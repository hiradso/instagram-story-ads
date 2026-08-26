<?php

namespace App\Notifications;

use App\Models\Conversation;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ConversationStartedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Conversation $conversation)
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
        return "ادیار: یه آگهی‌دهنده برای کمپین «{$this->conversation->campaign->title}» باهات گفت‌وگو شروع کرده. تو پنل ببینش.";
    }
}
