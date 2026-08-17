<?php

namespace App\Http\Requests\Campaign;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'creative' => ['required', 'image', 'max:5120'],
            'price_per_1000_views' => ['required', 'numeric', 'min:1'],
            'budget_total' => ['required', 'numeric', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'province_ids' => ['nullable', 'array'],
            'province_ids.*' => ['integer', 'exists:provinces,id'],
        ];
    }
}
