<?php

namespace App\Http\Requests\CampaignAssignment;

use Illuminate\Foundation\Http\FormRequest;

class SubmitViewRequest extends FormRequest
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
            'screenshot' => ['required', 'image', 'max:5120'],
            'claimed_views' => ['required', 'integer', 'min:1'],
        ];
    }
}
