<?php

namespace App\Notifications;

use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReferralBonusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly string $amount, private readonly string $referredName) {}

    /**
     * @return array<int, class-string>
     */
    public function via(mixed $notifiable): array
    {
        return [SmsChannel::class];
    }

    public function toSms(mixed $notifiable): string
    {
        $amount = number_format((float) $this->amount);

        return "ادیار: کسی که معرفی کردی ({$this->referredName}) شروع به کار کرد و {$amount} تومان پاداش معرفی به کیف‌پولت اضافه شد.";
    }
}
