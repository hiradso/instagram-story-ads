<?php

namespace App\Notifications;

use App\Models\WithdrawalRequest;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WithdrawalApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly WithdrawalRequest $withdrawal) {}

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

        return "ادیار: درخواست برداشت {$amount} تومانت تایید شد و به‌زودی واریز می‌شه.";
    }
}
