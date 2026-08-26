<?php

namespace App\Notifications;

use App\Models\ViewSubmission;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SubmissionRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly ViewSubmission $submission)
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
        return "ادیار: اسکرین‌شات ثبت‌شده رد شد. دلیل: {$this->submission->rejection_reason}";
    }
}
