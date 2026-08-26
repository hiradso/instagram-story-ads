<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\WithdrawalRequest>
 */
class WithdrawalRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->ambassador(),
            'amount' => '100000.00',
            'status' => 'pending',
            'processed_by' => null,
            'processed_at' => null,
            'admin_note' => null,
        ];
    }
}
