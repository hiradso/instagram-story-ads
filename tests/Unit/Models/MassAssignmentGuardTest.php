<?php

namespace Tests\Unit\Models;

use App\Models\AmbassadorProfile;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Province;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression tests for the mass-assignment landmine flagged in the security
 * review: privileged columns (role, wallet_balance, status, budget_remaining,
 * verified_at, ...) must stay out of $fillable so that even a careless future
 * `Model::create($request->all())` or `$model->update($request->all())`
 * can't let a client set them — only trusted server code using forceFill()
 * can. These tests simulate exactly that careless call pattern directly
 * against the model, independent of any FormRequest validation.
 */
class MassAssignmentGuardTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_mass_assignment_cannot_set_privileged_fields(): void
    {
        $attacker = User::create([
            'name' => 'Attacker',
            'email' => 'attacker@example.test',
            'password' => 'irrelevant',
            'role' => 'admin',
            'level' => 3,
            'status' => 'active',
            'wallet_balance' => '999999.00',
            'referred_by_id' => 1,
            'referral_bonus_paid_at' => now(),
        ]);

        $attacker = $attacker->fresh();

        $this->assertSame('advertiser', $attacker->role); // DB default, not attacker-supplied 'admin'
        $this->assertSame(1, $attacker->level);
        $this->assertSame('0.00', $attacker->wallet_balance);
        $this->assertNull($attacker->referred_by_id);
        $this->assertNull($attacker->referral_bonus_paid_at);
    }

    public function test_user_mass_update_cannot_change_privileged_fields(): void
    {
        $user = User::factory()->create(['wallet_balance' => '0.00']);

        $user->update([
            'name' => 'New Name',
            'role' => 'admin',
            'wallet_balance' => '999999.00',
            'status' => 'suspended',
        ]);

        $this->assertSame('New Name', $user->fresh()->name); // legitimate field still works
        $this->assertSame('advertiser', $user->fresh()->role);
        $this->assertSame('0.00', $user->fresh()->wallet_balance);
        $this->assertSame('active', $user->fresh()->status);
    }

    public function test_campaign_mass_assignment_cannot_set_privileged_fields(): void
    {
        // budget_remaining/capacity_views have no DB default, so a create()
        // call that only supplies attacker-controlled values for them (and
        // has them silently dropped by the fillable guard) fails loudly at
        // the database instead of quietly succeeding with tampered values —
        // there's no path to sneak a Campaign into existence with a
        // client-chosen status/budget_remaining/capacity_views.
        $advertiser = User::factory()->advertiser()->create();
        $category = Category::factory()->create();

        $this->expectException(QueryException::class);

        Campaign::create([
            'advertiser_id' => $advertiser->id,
            'category_id' => $category->id,
            'title' => 'Attacker campaign',
            'creative_path' => 'campaign-creatives/fake.jpg',
            'price_per_1000_views' => '1.00',
            'budget_total' => '1000.00',
            'status' => 'active',
            'budget_remaining' => '999999.00',
            'capacity_views' => 999999,
            'views_delivered' => 999999,
        ]);
    }

    public function test_campaign_mass_update_cannot_change_privileged_fields(): void
    {
        $campaign = Campaign::factory()->create([
            'status' => 'draft',
            'budget_remaining' => '500.00',
        ]);

        $campaign->update([
            'title' => 'Renamed',
            'status' => 'active',
            'budget_remaining' => '999999.00',
        ]);

        $this->assertSame('Renamed', $campaign->fresh()->title);
        $this->assertSame('draft', $campaign->fresh()->status);
        $this->assertSame('500.00', $campaign->fresh()->budget_remaining);
    }

    public function test_ambassador_profile_mass_assignment_cannot_set_privileged_fields(): void
    {
        $user = User::factory()->ambassador()->create();
        $category = Category::factory()->create();
        $province = Province::factory()->create();

        $profile = AmbassadorProfile::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'province_id' => $province->id,
            'city_id' => \App\Models\City::factory()->create(['province_id' => $province->id])->id,
            'instagram_username' => 'attacker',
            'instagram_url' => 'https://instagram.com/attacker',
            'wallet_balance' => '999999.00',
            'verified_at' => now(),
        ]);

        $profile = $profile->fresh();

        $this->assertSame('0.00', $profile->wallet_balance); // DB default
        $this->assertNull($profile->verified_at);
    }

    public function test_ambassador_profile_mass_update_cannot_change_privileged_fields(): void
    {
        $profile = AmbassadorProfile::factory()->unverified()->create(['wallet_balance' => '0.00']);

        $profile->update([
            'bio' => 'updated bio',
            'wallet_balance' => '999999.00',
            'verified_at' => now(),
        ]);

        $this->assertSame('updated bio', $profile->fresh()->bio);
        $this->assertSame('0.00', $profile->fresh()->wallet_balance);
        $this->assertNull($profile->fresh()->verified_at);
    }
}
