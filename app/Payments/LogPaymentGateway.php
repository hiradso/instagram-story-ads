<?php

namespace App\Payments;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Default driver for local dev / until the client provides real (or
 * sandbox) ZarinPal merchant credentials. Mirrors how SMS_DRIVER=log
 * works in this project: instead of calling out to a real gateway, it
 * sends the payer to a local "fake gateway" page (see
 * PaymentCallbackController::fakeGateway) where a developer can click
 * through to a simulated success or failure, exercising the exact same
 * callback/verify code path the real ZarinPal driver uses.
 */
class LogPaymentGateway implements PaymentGateway
{
    public function request(string $amount, string $description, string $callbackUrl): array
    {
        $authority = 'A'.Str::random(35);

        Log::info("Payment request: {$amount} toman — {$description}", ['authority' => $authority]);

        return [
            'authority' => $authority,
            'redirect_url' => url('/payments/fake-gateway/'.$authority).'?'.http_build_query([
                'callback_url' => $callbackUrl,
            ]),
        ];
    }

    public function verify(string $authority, string $amount): array
    {
        Log::info("Payment verified (log driver, always succeeds): {$authority}");

        return [
            'success' => true,
            'ref_id' => 'LOG-'.Str::random(8),
        ];
    }
}
