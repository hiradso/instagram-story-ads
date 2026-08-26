<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\City;
use App\Models\Province;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\AmbassadorProfile>
 */
class AmbassadorProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->ambassador(),
            'category_id' => Category::factory(),
            'province_id' => Province::factory(),
            'city_id' => City::factory(),
            'instagram_username' => fake()->unique()->userName(),
            'instagram_url' => fn (array $attributes) => 'https://instagram.com/'.$attributes['instagram_username'],
            'bio' => fake()->sentence(),
            'follower_count' => fake()->numberBetween(1000, 200000),
            'avg_views_7d' => fake()->numberBetween(500, 50000),
            'reach' => null,
            'impressions' => null,
            'engagement_rate' => null,
            'resume_path' => null,
            'wallet_balance' => 0,
            'verified_at' => now(),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => ['verified_at' => null]);
    }
}
