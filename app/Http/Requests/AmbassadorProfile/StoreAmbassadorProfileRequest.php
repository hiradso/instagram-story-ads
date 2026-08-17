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
            'follower_count' => ['required', 'integer', 'min:0'],
            'avg_views_7d' => ['required', 'integer', 'min:0'],
        ];
    }
}
