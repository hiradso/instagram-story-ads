<?php

namespace Database\Factories;

use App\Models\CampaignAssignment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\ViewSubmission>
 */
class ViewSubmissionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'campaign_assignment_id' => CampaignAssignment::factory(),
            'screenshot_path' => 'view-submissions/'.Str::random(40).'.jpg',
            'image_hash' => hash('sha256', Str::random(40)),
            'claimed_views' => fake()->numberBetween(500, 10000),
            'approved_views' => null,
            'status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'rejection_reason' => null,
        ];
    }
}
