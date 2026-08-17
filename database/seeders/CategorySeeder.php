<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Str::slug() can't transliterate Persian into meaningful Latin
        // text, so slugs are assigned explicitly rather than generated.
        $categories = [
            'fashion' => 'مد و پوشاک',
            'beauty' => 'زیبایی و آرایشی',
            'kids' => 'کودک و نوزاد',
            'home-kitchen' => 'خانه و آشپزخانه',
            'digital-tech' => 'دیجیتال و تکنولوژی',
            'sports-fitness' => 'ورزش و تناسب اندام',
            'food-catering' => 'خوراکی و کترینگ',
            'health-medical' => 'سلامت و پزشکی',
            'books-stationery' => 'کتاب و لوازم تحریر',
            'automotive' => 'خودرو',
        ];

        foreach ($categories as $slug => $name) {
            Category::firstOrCreate(['slug' => $slug], ['name' => $name]);
        }
    }
}
