<?php

namespace App\Http\Requests\AmbassadorProfile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAmbassadorProfileRequest extends FormRequest
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
            'category_id' => ['sometimes', 'exists:categories,id'],
            'province_id' => ['sometimes', 'exists:provinces,id'],
            'city_id' => ['sometimes', 'exists:cities,id'],
            'instagram_username' => ['sometimes', 'string', 'max:255'],
            'instagram_url' => ['sometimes', 'url', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'follower_count' => ['sometimes', 'integer', 'min:0'],
            'avg_views_7d' => ['sometimes', 'integer', 'min:0'],
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
