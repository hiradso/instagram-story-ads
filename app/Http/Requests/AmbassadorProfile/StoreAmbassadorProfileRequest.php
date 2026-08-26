<?php

namespace App\Http\Requests\AmbassadorProfile;

use Illuminate\Foundation\Http\FormRequest;

class StoreAmbassadorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'province_id' => ['required', 'exists:provinces,id'],
            'city_id' => ['required', 'exists:cities,id'],
            'instagram_username' => ['required', 'string', 'max:255'],
            'instagram_url' => ['required', 'url', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'follower_count' => ['required', 'integer', 'min:0'],
            'avg_views_7d' => ['required', 'integer', 'min:0'],
            'reach' => ['nullable', 'integer', 'min:0'],
            'impressions' => ['nullable', 'integer', 'min:0'],
            'engagement_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'resume' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'advertised_city_ids' => ['nullable', 'array'],
            'advertised_city_ids.*' => ['integer', 'exists:cities,id'],
        ];
    }

    public function attributes(): array
    {
        return [
            'category_id' => 'دسته‌بندی',
            'province_id' => 'استان',
            'city_id' => 'شهر',
            'instagram_username' => 'نام‌کاربری اینستاگرام',
            'instagram_url' => 'لینک پیج',
            'bio' => 'معرفی پیج',
            'follower_count' => 'تعداد فالوور',
            'avg_views_7d' => 'میانگین بازدید',
            'reach' => 'Reach',
            'impressions' => 'Impressions',
            'engagement_rate' => 'درصد تعامل اجتماعی',
            'resume' => 'رزومه',
            'advertised_city_ids' => 'شهرهای تبلیغات انجام‌شده',
        ];
    }
}
