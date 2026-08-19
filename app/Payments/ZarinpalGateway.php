<?php

namespace App\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Real driver for ZarinPal (zarinpal.com), the most common Iranian
 * payment gateway. Activate by setting PAYMENT_DRIVER=zarinpal plus the
 * merchant ID in .env — no code changes needed once the client provides
 * real (or sandbox) merchant credentials. Uses ZarinPal's REST API v4.
 *
 * @see https://docs.zarinpal.com/paymentGateway/
 */
class ZarinpalGateway implements PaymentGateway
{
    public function __construct(
        private readonly string $merchantId,
        private readonly bool $sandbox = false,
    ) {}

    private function apiBase(): string
    {
        return $this->sandbox ? 'https://sandbox.zarinpal.com' : 'https://api.zarinpal.com';
    }

    private function startPayBase(): string
    {
        return $this->sandbox ? 'https://sandbox.zarinpal.com' : 'https://www.zarinpal.com';
    }

    public function request(string $amount, string $description, string $callbackUrl): array
    {
        $response = Http::post("{$this->apiBase()}/pg/v4/payment/request.json", [
            'merchant_id' => $this->merchantId,
            // ZarinPal's amount unit is Toman for merchants onboarded
            // after the Rial migration; this app's amounts are already
            // in Toman throughout, so no conversion needed.
            'amount' => (int) $amount,
            'description' => $description,
            'callback_url' => $callbackUrl,
        ]);

        $data = $response->json('data');

        if ($response->failed() || ! $data || ($data['code'] ?? null) !== 100) {
            Log::error('ZarinPal payment request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new RuntimeException('اتصال به درگاه پرداخت ناموفق بود.');
        }

        return [
            'authority' => $data['authority'],
            'redirect_url' => "{$this->startPayBase()}/pg/StartPay/{$data['authority']}",
        ];
    }

    public function verify(string $authority, string $amount): array
    {
        $response = Http::post("{$this->apiBase()}/pg/v4/payment/verify.json", [
            'merchant_id' => $this->merchantId,
            'amount' => (int) $amount,
            'authority' => $authority,
        ]);

        $data = $response->json('data');

        // 100 = freshly verified, 101 = already verified (e.g. the payer
        // hit refresh) — both mean the payment is genuinely settled.
        $success = $data && in_array($data['code'] ?? null, [100, 101], true);

        if (! $success) {
            Log::warning('ZarinPal payment verification failed', [
                'authority' => $authority,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        return [
            'success' => $success,
            'ref_id' => $success ? (string) $data['ref_id'] : null,
        ];
    }
}
