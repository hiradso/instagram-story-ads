<?php

namespace App\Notifications;

use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class LoginOtpNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly string $code) {}

    /**
     * @return array<int, class-string>
     */
    public function via(mixed $notifiable): array
    {
        return [SmsChannel::class];
    }

    public function toSms(mixed $notifiable): string
    {
        return "ادیار: کد ورودت {$this->code}ه. این کد تا ۱۰ دقیقه معتبره و به هیچ‌کس نگو.";
    }
}
