<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Province;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * One city (the provincial capital) per province, so every province
     * has at least one selectable city. Ambassadors/campaigns can only
     * target provinces for now — this is enough to unblock the profile
     * and campaign forms; a fuller city list can come later.
     */
    public function run(): void
    {
        $capitals = [
            'آذربایجان شرقی' => 'تبریز',
            'آذربایجان غربی' => 'ارومیه',
            'اردبیل' => 'اردبیل',
            'اصفهان' => 'اصفهان',
            'البرز' => 'کرج',
            'ایلام' => 'ایلام',
            'بوشهر' => 'بوشهر',
            'تهران' => 'تهران',
            'چهارمحال و بختیاری' => 'شهرکرد',
            'خراسان جنوبی' => 'بیرجند',
            'خراسان رضوی' => 'مشهد',
            'خراسان شمالی' => 'بجنورد',
            'خوزستان' => 'اهواز',
            'زنجان' => 'زنجان',
            'سمنان' => 'سمنان',
            'سیستان و بلوچستان' => 'زاهدان',
            'فارس' => 'شیراز',
            'قزوین' => 'قزوین',
            'قم' => 'قم',
            'کردستان' => 'سنندج',
            'کرمان' => 'کرمان',
            'کرمانشاه' => 'کرمانشاه',
            'کهگیلویه و بویراحمد' => 'یاسوج',
            'گلستان' => 'گرگان',
            'گیلان' => 'رشت',
            'لرستان' => 'خرم‌آباد',
            'مازندران' => 'ساری',
            'مرکزی' => 'اراک',
            'هرمزگان' => 'بندرعباس',
            'همدان' => 'همدان',
            'یزد' => 'یزد',
        ];

        foreach ($capitals as $provinceName => $cityName) {
            $province = Province::where('name', $provinceName)->first();

            if ($province) {
                City::firstOrCreate(['province_id' => $province->id, 'name' => $cityName]);
            }
        }
    }
}
