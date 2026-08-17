<?php

namespace App\Http\Requests\Campaign;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCampaignRequest extends FormRequest
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
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'creative' => ['sometimes', 'image', 'max:5120'],
            'price_per_1000_views' => ['sometimes', 'numeric', 'min:1'],
            'budget_total' => ['sometimes', 'numeric', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'province_ids' => ['nullable', 'array'],
            'province_ids.*' => ['integer', 'exists:provinces,id'],
        ];
    }
}
