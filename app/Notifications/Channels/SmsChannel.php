<?php

namespace App\Notifications\Channels;

use App\Sms\SmsGateway;
use Illuminate\Notifications\Notification;

class SmsChannel
{
    public function __construct(private readonly SmsGateway $gateway)
    {
    }

    public function send(mixed $notifiable, Notification $notification): void
    {
        $phone = $notifiable->routeNotificationFor('sms', $notification);

        if (! $phone || ! method_exists($notification, 'toSms')) {
            return;
        }

        $this->gateway->send($phone, $notification->toSms($notifiable));
    }
}
