<?php

namespace App\Notifications;

use App\Models\WithdrawalRequest;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WithdrawalRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly WithdrawalRequest $withdrawal, private readonly string $reason) {}

    /**
     * @return array<int, class-string>
     */
    public function via(mixed $notifiable): array
    {
        return [SmsChannel::class];
    }

    public function toSms(mixed $notifiable): string
    {
        $amount = number_format((float) $this->withdrawal->amount);

        return "استوری‌یار: درخواست برداشت {$amount} تومانت رد شد. دلیل: {$this->reason}. مبلغ به کیف‌پولت برگشت.";
    }
}
