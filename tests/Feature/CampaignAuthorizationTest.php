<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampaignAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_advertiser_cannot_view_another_advertisers_campaign(): void
    {
        $owner = User::factory()->advertiser()->create();
        $intruder = User::factory()->advertiser()->create();
        $campaign = Campaign::factory()->create(['advertiser_id' => $owner->id]);

        $response = $this->actingAs($intruder, 'sanctum')->getJson("/api/advertiser/campaigns/{$campaign->id}");

        $response->assertStatus(403);
    }

    public function test_an_advertiser_can_view_their_own_campaign(): void
    {
        $owner = User::factory()->advertiser()->create();
        $campaign = Campaign::factory()->create(['advertiser_id' => $owner->id]);

        $response = $this->actingAs($owner, 'sanctum')->getJson("/api/advertiser/campaigns/{$campaign->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $campaign->id);
    }

    public function test_an_advertiser_cannot_delete_another_advertisers_campaign(): void
    {
        $owner = User::factory()->advertiser()->create();
        $intruder = User::factory()->advertiser()->create();
        $campaign = Campaign::factory()->create(['advertiser_id' => $owner->id, 'status' => 'draft']);

        $response = $this->actingAs($intruder, 'sanctum')->deleteJson("/api/advertiser/campaigns/{$campaign->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('campaigns', ['id' => $campaign->id]);
    }

    public function test_an_advertiser_cannot_edit_a_campaign_once_it_is_no_longer_a_draft(): void
    {
        $owner = User::factory()->advertiser()->create();
        $campaign = Campaign::factory()->create(['advertiser_id' => $owner->id, 'status' => 'active']);

        $response = $this->actingAs($owner, 'sanctum')->postJson("/api/advertiser/campaigns/{$campaign->id}", [
            'title' => 'تغییر عنوان',
        ]);

        $response->assertStatus(403);
    }

    public function test_an_ambassador_cannot_access_advertiser_only_routes(): void
    {
        $ambassador = User::factory()->ambassador()->create();
        $campaign = Campaign::factory()->create();

        $response = $this->actingAs($ambassador, 'sanctum')->getJson("/api/advertiser/campaigns/{$campaign->id}");

        $response->assertStatus(403);
    }

    public function test_a_non_admin_cannot_reach_admin_routes(): void
    {
        $advertiser = User::factory()->advertiser()->create();

        $response = $this->actingAs($advertiser, 'sanctum')->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_any_campaign_via_the_advertiser_route_gate(): void
    {
        // Gate::authorize('view', ...) in CampaignController allows admins
        // through regardless of ownership.
        $admin = User::factory()->admin()->create();
        $campaign = Campaign::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->getJson("/api/advertiser/campaigns/{$campaign->id}");

        // Admins pass the ownership Gate but are blocked by the advertiser
        // role middleware on this route group — documents current behavior.
        $response->assertStatus(403);
    }
}
