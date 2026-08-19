<?php

namespace App\Http\Requests\WithdrawalRequest;

use Illuminate\Foundation\Http\FormRequest;

class StoreWithdrawalRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:100000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'amount' => 'مبلغ',
        ];
    }
}
