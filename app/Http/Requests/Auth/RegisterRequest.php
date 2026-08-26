<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'regex:/^09\d{9}$/'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:advertiser,ambassador'],
            // Not validated against `exists:users,referral_code` on purpose
            // — an unrecognized or empty code should never block signup,
            // it just means no referrer gets credited.
            'referral_code' => ['nullable', 'string', 'max:16'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'نام',
            'email' => 'ایمیل',
            'phone' => 'شماره موبایل',
            'password' => 'رمز عبور',
            'role' => 'نوع حساب',
            'referral_code' => 'کد معرف',
        ];
    }
}
