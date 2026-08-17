<?php

namespace App\Exceptions;

use RuntimeException;

class DuplicateScreenshotException extends RuntimeException
{
    protected $message = 'این اسکرین‌شات قبلاً برای یه کمپین دیگه ثبت شده.';
}
