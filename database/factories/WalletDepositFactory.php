<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\WalletDeposit>
 */
class WalletDepositFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->advertiser(),
            'amount' => '100000.00',
            'authority' => 'A'.Str::random(35),
            'ref_id' => null,
            'status' => 'pending',
        ];
    }
}
