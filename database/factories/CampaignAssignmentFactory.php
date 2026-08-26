<?php

namespace Database\Factories;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\CampaignAssignment>
 */
class CampaignAssignmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'campaign_id' => Campaign::factory(),
            'ambassador_id' => User::factory()->ambassador(),
            'status' => 'assigned',
            'assigned_at' => now(),
            'post_deadline_at' => now()->addDay(),
            'posted_at' => null,
        ];
    }
}
