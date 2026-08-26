<?php

namespace Tests\Feature;

use App\Models\AmbassadorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AmbassadorDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_directory_list_does_not_leak_contact_details(): void
    {
        $advertiser = User::factory()->advertiser()->create();
        AmbassadorProfile::factory()->create([
            'user_id' => User::factory()->ambassador()->create(['email' => 'secret@example.test', 'phone' => '09121234567']),
        ]);

        $response = $this->actingAs($advertiser, 'sanctum')->getJson('/api/advertiser/ambassadors');

        $response->assertOk();
        $response->assertJsonMissing(['email' => 'secret@example.test']);
        $response->assertJsonMissing(['phone' => '09121234567']);
    }

    public function test_the_directory_detail_does_not_leak_contact_details(): void
    {
        $advertiser = User::factory()->advertiser()->create();
        $profile = AmbassadorProfile::factory()->create([
            'user_id' => User::factory()->ambassador()->create(['email' => 'secret@example.test', 'phone' => '09121234567']),
        ]);

        $response = $this->actingAs($advertiser, 'sanctum')->getJson("/api/advertiser/ambassadors/{$profile->id}");

        $response->assertOk();
        $response->assertJsonMissing(['email' => 'secret@example.test']);
        $response->assertJsonMissing(['phone' => '09121234567']);
    }

    public function test_the_directory_only_lists_verified_profiles(): void
    {
        $advertiser = User::factory()->advertiser()->create();
        AmbassadorProfile::factory()->unverified()->create();
        $verified = AmbassadorProfile::factory()->create();

        $response = $this->actingAs($advertiser, 'sanctum')->getJson('/api/advertiser/ambassadors');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertSame([$verified->id], $ids);
    }
}
