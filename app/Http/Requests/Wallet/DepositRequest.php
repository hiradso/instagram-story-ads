<?php

namespace App\Http\Requests\Wallet;

use Illuminate\Foundation\Http\FormRequest;

class DepositRequest extends FormRequest
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
            'amount' => ['required', 'numeric', 'min:'.config('payments.min_deposit')],
        ];
    }

    public function attributes(): array
    {
        return [
            'amount' => 'مبلغ',
        ];
    }
}
