<?php

namespace Tests\Feature\Services;

use App\Models\AmbassadorProfile;
use App\Models\Campaign;
use App\Models\CampaignAssignment;
use App\Models\Category;
use App\Models\Province;
use App\Models\User;
use App\Notifications\CampaignAssignedNotification;
use App\Services\CampaignMatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CampaignMatchingServiceTest extends TestCase
{
    use RefreshDatabase;

    private CampaignMatchingService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new CampaignMatchingService;

        config([
            'campaigns.min_assignable_views' => 100,
            'campaigns.max_assignments_per_run' => 20,
            'campaigns.level_limits' => [
                1 => ['max_concurrent_assignments' => 1],
                2 => ['max_concurrent_assignments' => 3],
                3 => ['max_concurrent_assignments' => null],
            ],
        ]);
    }

    private function ambassador(Category $category, int $avgViews, ?Province $province = null, int $level = 1): AmbassadorProfile
    {
        return AmbassadorProfile::factory()->create([
            'category_id' => $category->id,
            'province_id' => $province?->id ?? Province::factory(),
            'avg_views_7d' => $avgViews,
            'user_id' => User::factory()->ambassador()->level($level),
        ]);
    }

    public function test_it_assigns_eligible_ambassadors_up_to_capacity(): void
    {
        Notification::fake();

        $category = Category::factory()->create();
        $campaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 10000,
        ]);

        $this->ambassador($category, 6000);
        $this->ambassador($category, 5000);

        $count = $this->service->allocate($campaign);

        $this->assertSame(1, $count);
        $this->assertSame(1, CampaignAssignment::count());
        Notification::assertSentTimes(CampaignAssignedNotification::class, 1);
    }

    public function test_it_ignores_campaigns_that_are_not_active(): void
    {
        $category = Category::factory()->create();
        $campaign = Campaign::factory()->create([
            'status' => 'draft',
            'category_id' => $category->id,
        ]);

        $this->ambassador($category, 1000);

        $this->assertSame(0, $this->service->allocate($campaign));
        $this->assertSame(0, CampaignAssignment::count());
    }

    public function test_it_ignores_manual_assignment_mode_campaigns(): void
    {
        $category = Category::factory()->create();
        $campaign = Campaign::factory()->active()->manual()->create([
            'category_id' => $category->id,
        ]);

        $this->ambassador($category, 1000);

        $this->assertSame(0, $this->service->allocate($campaign));
    }

    public function test_it_only_matches_ambassadors_in_the_same_category(): void
    {
        $category = Category::factory()->create();
        $otherCategory = Category::factory()->create();
        $campaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 10000,
        ]);

        $this->ambassador($otherCategory, 5000);

        $this->assertSame(0, $this->service->allocate($campaign));
    }

    public function test_it_filters_by_campaign_provinces_when_set(): void
    {
        $category = Category::factory()->create();
        $matchingProvince = Province::factory()->create();
        $otherProvince = Province::factory()->create();

        $campaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 10000,
        ]);
        $campaign->provinces()->attach($matchingProvince);

        $this->ambassador($category, 5000, $otherProvince);
        $inProvince = $this->ambassador($category, 4000, $matchingProvince);

        $this->service->allocate($campaign);

        $this->assertSame(1, CampaignAssignment::count());
        $this->assertSame(
            $inProvince->user_id,
            CampaignAssignment::first()->ambassador_id
        );
    }

    public function test_it_skips_ambassadors_already_assigned_to_the_campaign(): void
    {
        $category = Category::factory()->create();
        $campaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 10000,
        ]);

        $profile = $this->ambassador($category, 5000);
        CampaignAssignment::factory()->create([
            'campaign_id' => $campaign->id,
            'ambassador_id' => $profile->user_id,
        ]);

        $this->assertSame(0, $this->service->allocate($campaign));
    }

    public function test_it_excludes_suspended_ambassadors(): void
    {
        $category = Category::factory()->create();
        $campaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 10000,
        ]);

        AmbassadorProfile::factory()->create([
            'category_id' => $category->id,
            'avg_views_7d' => 5000,
            'user_id' => User::factory()->ambassador()->suspended(),
        ]);

        $this->assertSame(0, $this->service->allocate($campaign));
    }

    public function test_it_respects_the_minimum_assignable_views_threshold(): void
    {
        config(['campaigns.min_assignable_views' => 500]);

        $category = Category::factory()->create();
        $campaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 10000,
        ]);

        $this->ambassador($category, 100);

        $this->assertSame(0, $this->service->allocate($campaign));
    }

    public function test_it_does_not_exceed_remaining_capacity(): void
    {
        $category = Category::factory()->create();
        $campaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 3000,
            'views_delivered' => 0,
        ]);

        $this->ambassador($category, 5000);

        $this->assertSame(0, $this->service->allocate($campaign));
    }

    public function test_level_1_ambassador_capped_at_one_concurrent_assignment(): void
    {
        $category = Category::factory()->create();
        $profile = $this->ambassador($category, 5000, level: 1);

        $existingCampaign = Campaign::factory()->active()->create(['category_id' => $category->id]);
        CampaignAssignment::factory()->create([
            'campaign_id' => $existingCampaign->id,
            'ambassador_id' => $profile->user_id,
            'status' => 'assigned',
        ]);

        $newCampaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 10000,
        ]);

        $this->assertSame(0, $this->service->allocate($newCampaign));
    }

    public function test_level_3_ambassador_has_unlimited_concurrent_assignments(): void
    {
        $category = Category::factory()->create();
        $profile = $this->ambassador($category, 1000, level: 3);

        for ($i = 0; $i < 5; $i++) {
            CampaignAssignment::factory()->create([
                'campaign_id' => Campaign::factory()->active()->create(['category_id' => $category->id]),
                'ambassador_id' => $profile->user_id,
                'status' => 'assigned',
            ]);
        }

        $newCampaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 10000,
        ]);

        $this->assertSame(1, $this->service->allocate($newCampaign));
    }

    public function test_it_greedily_prefers_higher_reach_ambassadors_first(): void
    {
        $category = Category::factory()->create();
        $campaign = Campaign::factory()->active()->create([
            'category_id' => $category->id,
            'capacity_views' => 6000,
        ]);

        $low = $this->ambassador($category, 3000);
        $high = $this->ambassador($category, 5000);

        $this->service->allocate($campaign);

        $assignedIds = CampaignAssignment::pluck('ambassador_id')->all();
        $this->assertContains($high->user_id, $assignedIds);
        $this->assertNotContains($low->user_id, $assignedIds);
    }
}
