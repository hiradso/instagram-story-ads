<?php

namespace Database\Factories;

use App\Models\Province;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\City>
 */
class CityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'province_id' => Province::factory(),
            'name' => fake()->unique()->citySuffix().fake()->unique()->word(),
        ];
    }
}
