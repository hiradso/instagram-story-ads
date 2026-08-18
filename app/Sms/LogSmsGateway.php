<?php

namespace App\Sms;

use Illuminate\Support\Facades\Log;

/**
 * Default driver for local dev / until the client provides real SMS
 * panel credentials. Mirrors how MAIL_MAILER=log works in this project.
 */
class LogSmsGateway implements SmsGateway
{
    public function send(string $to, string $message): void
    {
        Log::channel(config('sms.log_channel', 'stack'))->info("SMS to {$to}: {$message}");
    }
}
