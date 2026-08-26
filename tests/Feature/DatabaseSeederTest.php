<?php

namespace Tests\Feature;

use App\Models\AmbassadorProfile;
use App\Models\Campaign;
use App\Models\CampaignAssignment;
use App\Models\User;
use App\Models\ViewSubmission;
use App\Models\WithdrawalRequest;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_admin_with_the_admin_role(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@storyyar.local')->first();

        $this->assertNotNull($admin);
        $this->assertSame('admin', $admin->role);
    }

    public function test_it_only_runs_the_demo_seeder_in_the_local_environment(): void
    {
        app()->detectEnvironment(fn () => 'production');

        app(DatabaseSeeder::class)->run();

        $this->assertDatabaseMissing('users', ['email' => 'advertiser@test.local']);

        app()->detectEnvironment(fn () => 'testing');
    }

    public function test_demo_seeder_creates_the_full_sample_dataset(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DemoSeeder::class);

        $advertiser = User::where('email', 'advertiser@test.local')->first();
        $this->assertNotNull($advertiser);
        $this->assertSame('advertiser', $advertiser->role);

        $ambassadorEmails = ['ambassador0@test.local', 'ambassador1@test.local', 'ambassador2@test.local'];
        foreach ($ambassadorEmails as $email) {
            $user = User::where('email', $email)->first();
            $this->assertNotNull($user, "{$email} should exist");
            $this->assertSame('ambassador', $user->role);

            $profile = AmbassadorProfile::where('user_id', $user->id)->first();
            $this->assertNotNull($profile, "{$email} should have a profile");
            $this->assertNotNull($profile->verified_at);
        }

        $this->assertSame(2, Campaign::where('advertiser_id', $advertiser->id)->count());
        $this->assertSame(3, CampaignAssignment::count());
        $this->assertSame(3, ViewSubmission::count());
        $this->assertSame(1, WithdrawalRequest::count());

        $activeCampaign = Campaign::where('status', 'active')->first();
        $this->assertNotNull($activeCampaign);
        // budget_remaining/capacity_views aren't fillable — confirms the
        // seeder's forceFill actually took (a plain create() would have
        // failed outright, since those columns have no DB default).
        $this->assertSame('2000000.00', $activeCampaign->budget_remaining);
        $this->assertGreaterThan(0, $activeCampaign->capacity_views);
    }

    public function test_demo_seeder_is_idempotent(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DemoSeeder::class);
        $this->seed(DemoSeeder::class);

        $this->assertSame(5, User::count());
        $this->assertSame(2, Campaign::count());
        $this->assertSame(3, CampaignAssignment::count());
        $this->assertSame(3, ViewSubmission::count());
        $this->assertSame(1, WithdrawalRequest::count());
    }
}
