<?php

namespace App\Sms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Real driver for Kavenegar (kavenegar.com), the most common Iranian SMS
 * gateway. Activate by setting SMS_DRIVER=kavenegar plus the API key and
 * sender line in .env — no code changes needed once the client provides
 * real panel credentials.
 */
class KavenegarSmsGateway implements SmsGateway
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $sender,
    ) {
    }

    public function send(string $to, string $message): void
    {
        $response = Http::asForm()->post("https://api.kavenegar.com/v1/{$this->apiKey}/sms/send.json", [
            'receptor' => $to,
            'sender' => $this->sender,
            'message' => $message,
        ]);

        if ($response->failed()) {
            Log::error('Kavenegar SMS send failed', [
                'to' => $to,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new RuntimeException('ارسال پیامک ناموفق بود.');
        }
    }
}
