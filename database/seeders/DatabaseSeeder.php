<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ProvinceSeeder::class,
            CitySeeder::class,
            CategorySeeder::class,
        ]);

        // 'role' isn't mass-assignable (see User::$fillable) — force it in
        // explicitly rather than relying on firstOrCreate's create() array.
        $admin = User::firstOrCreate(
            ['email' => 'admin@storyyar.local'],
            [
                'name' => 'ادمین',
                'password' => Hash::make('password'),
            ]
        );
        $admin->forceFill(['role' => 'admin'])->save();

        if (app()->environment('local')) {
            $this->call(DemoSeeder::class);
        }
    }
}
