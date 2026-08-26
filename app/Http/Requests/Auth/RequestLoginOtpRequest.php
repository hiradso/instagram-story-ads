<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RequestLoginOtpRequest extends FormRequest
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
            'phone' => ['required', 'regex:/^09\d{9}$/'],
        ];
    }

    public function attributes(): array
    {
        return [
            'phone' => 'شماره موبایل',
        ];
    }
}
