<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * User::panelTier() drives the purely cosmetic 1-3 tier that scales how
 * fantasy/ornate a dashboard's theme looks. Ambassadors already have a
 * real `level` column (see UserLevelService); advertisers don't, so
 * their tier is derived from lifetime campaign budget instead.
 */
class PanelTierTest extends TestCase
{
    use RefreshDatabase;

    public function test_ambassador_tier_mirrors_their_level(): void
    {
        $ambassador = User::factory()->ambassador()->create();

        $ambassador->forceFill(['level' => 1])->save();
        $this->assertSame(1, $ambassador->fresh()->panelTier());

        $ambassador->forceFill(['level' => 2])->save();
        $this->assertSame(2, $ambassador->fresh()->panelTier());

        $ambassador->forceFill(['level' => 3])->save();
        $this->assertSame(3, $ambassador->fresh()->panelTier());
    }

    public function test_advertiser_with_no_campaigns_is_tier_one(): void
    {
        $advertiser = User::factory()->advertiser()->create();

        $this->assertSame(1, $advertiser->panelTier());
    }

    public function test_advertiser_tier_rises_with_lifetime_campaign_budget(): void
    {
        $advertiser = User::factory()->advertiser()->create();

        Campaign::factory()->for($advertiser, 'advertiser')->create(['budget_total' => '1000000.00']);
        $this->assertSame(1, $advertiser->panelTier());

        Campaign::factory()->for($advertiser, 'advertiser')->create(['budget_total' => '2500000.00']);
        $this->assertSame(2, $advertiser->panelTier());

        Campaign::factory()->for($advertiser, 'advertiser')->create(['budget_total' => '7000000.00']);
        $this->assertSame(3, $advertiser->panelTier());
    }

    public function test_me_endpoint_includes_the_computed_tier(): void
    {
        $ambassador = User::factory()->ambassador()->create();
        $ambassador->forceFill(['level' => 2])->save();

        $response = $this->actingAs($ambassador, 'sanctum')->getJson('/api/me');

        $response->assertOk();
        $response->assertJsonPath('tier', 2);
    }
}
