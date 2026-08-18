<?php

namespace App\Sms;

interface SmsGateway
{
    public function send(string $to, string $message): void;
}
