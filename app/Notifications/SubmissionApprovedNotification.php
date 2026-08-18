<?php

namespace App\Notifications;

use App\Models\ViewSubmission;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SubmissionApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly ViewSubmission $submission, private readonly string $amount)
    {
    }

    /**
     * @return array<int, class-string>
     */
    public function via(mixed $notifiable): array
    {
        return [SmsChannel::class];
    }

    public function toSms(mixed $notifiable): string
    {
        $views = number_format((int) $this->submission->approved_views);
        $amount = number_format((float) $this->amount);

        return "استوری‌یار: بازدید تو ({$views}) تایید شد و {$amount} تومان به کیف‌پولت اضافه شد.";
    }
}
