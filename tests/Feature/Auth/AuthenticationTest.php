<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register_as_an_advertiser(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'رضا رضایی',
            'email' => 'reza@example.test',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => 'advertiser',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('user.role', 'advertiser');
        $response->assertJsonPath('user.status', 'active');
        $this->assertDatabaseHas('users', ['email' => 'reza@example.test', 'role' => 'advertiser']);
    }

    public function test_registration_cannot_self_assign_the_admin_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'کسی که تلاش می‌کنه ادمین بشه',
            'email' => 'wannabe-admin@example.test',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => 'admin',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('users', ['email' => 'wannabe-admin@example.test']);
    }

    public function test_registration_rejects_a_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.test']);

        $response = $this->postJson('/api/register', [
            'name' => 'کاربر جدید',
            'email' => 'taken@example.test',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => 'advertiser',
        ]);

        $response->assertStatus(422);
    }

    public function test_a_user_can_log_in_with_correct_credentials(): void
    {
        User::factory()->create([
            'email' => 'user@example.test',
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.test',
            'password' => 'correct-password',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_an_incorrect_password(): void
    {
        User::factory()->create([
            'email' => 'user@example.test',
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.test',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_does_not_reveal_whether_the_email_exists(): void
    {
        User::factory()->create([
            'email' => 'user@example.test',
            'password' => Hash::make('correct-password'),
        ]);

        $existing = $this->postJson('/api/login', [
            'email' => 'user@example.test',
            'password' => 'wrong-password',
        ]);

        $nonExistent = $this->postJson('/api/login', [
            'email' => 'nobody@example.test',
            'password' => 'wrong-password',
        ]);

        $this->assertSame(
            $existing->json('errors.email.0'),
            $nonExistent->json('errors.email.0')
        );
    }

    public function test_a_suspended_user_cannot_log_in(): void
    {
        User::factory()->suspended()->create([
            'email' => 'blocked@example.test',
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'blocked@example.test',
            'password' => 'correct-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create([
            'email' => 'user@example.test',
            'password' => Hash::make('correct-password'),
        ]);

        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/login', ['email' => 'user@example.test', 'password' => 'wrong']);
        }

        $response = $this->postJson('/api/login', ['email' => 'user@example.test', 'password' => 'wrong']);

        $response->assertStatus(429);
    }

    public function test_an_authenticated_user_can_fetch_their_own_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/me');

        $response->assertOk();
        $response->assertJsonPath('id', $user->id);
    }

    public function test_an_unauthenticated_request_cannot_fetch_a_profile(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }
}
