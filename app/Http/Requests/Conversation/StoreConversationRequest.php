<?php

namespace App\Http\Requests\Conversation;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
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
            'campaign_id' => ['required', 'exists:campaigns,id'],
            'ambassador_profile_id' => ['required', 'exists:ambassador_profiles,id'],
            'message' => ['required', 'string', 'max:2000'],
            'brief_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
        ];
    }

    public function attributes(): array
    {
        return [
            'campaign_id' => 'کمپین',
            'ambassador_profile_id' => 'سفیر',
            'message' => 'پیام',
            'brief_file' => 'فایل بریف تبلیغاتی',
        ];
    }
}
