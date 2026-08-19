<?php

namespace App\Services;

use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Notifications\PasswordResetOtpNotification;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class PasswordResetService
{
    private const OTP_TTL_MINUTES = 10;

    private const MAX_ATTEMPTS = 5;

    /**
     * Send an OTP if the phone belongs to a user, and silently do nothing
     * otherwise — the controller always responds the same way either way,
     * so this endpoint can't be used to check which phone numbers are
     * registered.
     */
    public function requestOtp(string $phone): void
    {
        $user = User::where('phone', $phone)->first();

        if (! $user) {
            return;
        }

        PasswordResetOtp::where('phone', $phone)->delete();

        $code = (string) random_int(100000, 999999);

        PasswordResetOtp::create([
            'phone' => $phone,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
        ]);

        $user->notify(new PasswordResetOtpNotification($code));
    }

    public function resetPassword(string $phone, string $code, string $newPassword): void
    {
        $otp = PasswordResetOtp::where('phone', $phone)->latest()->first();

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
        $user->update(['password' => Hash::make($newPassword)]);
        $user->tokens()->delete();

        PasswordResetOtp::where('phone', $phone)->delete();
    }
}
