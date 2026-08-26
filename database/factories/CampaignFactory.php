<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Campaign>
 */
class CampaignFactory extends Factory
{
    public function definition(): array
    {
        $budgetTotal = fake()->randomElement(['500000.00', '1000000.00', '2000000.00']);
        $pricePer1000 = '50000.00';

        return [
            'advertiser_id' => User::factory()->advertiser(),
            'category_id' => Category::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'creative_path' => 'campaign-creatives/fake.jpg',
            'price_per_1000_views' => $pricePer1000,
            'budget_total' => $budgetTotal,
            'budget_remaining' => $budgetTotal,
            'capacity_views' => (int) bcmul(bcdiv($budgetTotal, $pricePer1000, 10), '1000', 0),
            'views_delivered' => 0,
            'status' => 'draft',
            'assignment_mode' => 'auto',
            'starts_at' => null,
            'ends_at' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'active']);
    }

    public function manual(): static
    {
        return $this->state(fn (array $attributes) => ['assignment_mode' => 'manual']);
    }
}
