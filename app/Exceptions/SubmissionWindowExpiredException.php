<?php

namespace App\Exceptions;

use RuntimeException;

class SubmissionWindowExpiredException extends RuntimeException
{
    protected $message = 'مهلت ثبت اسکرین‌شات برای این تخصیص تموم شده.';
}
