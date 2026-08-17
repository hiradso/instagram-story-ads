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
            'follower_count' => ['sometimes', 'integer', 'min:0'],
            'avg_views_7d' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
