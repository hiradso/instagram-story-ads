<?php

namespace App\Notifications;

use App\Models\Campaign;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class CampaignAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Campaign $campaign)
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
        return "استوری‌یار: کمپین «{$this->campaign->title}» بهت تخصیص داده شد. تا ۲۴ ساعت آینده استوری رو بذار و اسکرین‌شات بازدید رو تو پنل ثبت کن.";
    }
}
