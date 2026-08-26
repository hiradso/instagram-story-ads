<?php

namespace App\Services;

use App\Models\LoginOtp;
use App\Models\User;
use App\Notifications\LoginOtpNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class LoginOtpService
{
    private const OTP_TTL_MINUTES = 10;

    private const MAX_ATTEMPTS = 5;

    /**
     * Send a login OTP if the phone belongs to a user, and silently do
     * nothing otherwise — same anti-enumeration shape as password reset,
     * via PasswordResetService::requestOtp.
     */
    public function requestOtp(string $phone): void
    {
        $user = User::where('phone', $phone)->first();

        if (! $user) {
            return;
        }

        LoginOtp::where('phone', $phone)->delete();

        $code = (string) random_int(100000, 999999);

        LoginOtp::create([
            'phone' => $phone,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
        ]);

        $user->notify(new LoginOtpNotification($code));
    }

    public function login(string $phone, string $code): User
    {
        $otp = LoginOtp::where('phone', $phone)->latest()->first();

        if (! $otp || $otp->expires_at->isPast()) {
            throw new RuntimeException('کد نامعتبر یا منقضی‌شده. دوباره درخواست بده.');
        }

        if ($otp->attempts >= self::MAX_ATTEMPTS) {
            throw new RuntimeException('تعداد تلاش‌های مجاز تموم شده. دوباره درخواست بده.');
        }

        if (! Hash::check($code, $otp->code)) {
            $otp->increment('attempts');

            throw new RuntimeException('کد وارد شده اشتباهه.');
        }

        $user = User::where('phone', $phone)->firstOrFail();

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'phone' => ['این حساب مسدود شده.'],
            ]);
        }

        LoginOtp::where('phone', $phone)->delete();

        return $user;
    }
}
