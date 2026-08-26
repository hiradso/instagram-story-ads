<?php

namespace App\Providers;

use App\Payments\LogPaymentGateway;
use App\Payments\PaymentGateway;
use App\Payments\ZarinpalGateway;
use App\Sms\KavenegarSmsGateway;
use App\Sms\LogSmsGateway;
use App\Sms\SmsGateway;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SmsGateway::class, function () {
            return match (config('sms.driver')) {
                'kavenegar' => new KavenegarSmsGateway(
                    config('sms.kavenegar.api_key'),
                    config('sms.kavenegar.sender'),
                ),
                default => new LogSmsGateway,
            };
        });

        $this->app->singleton(PaymentGateway::class, function () {
            return match (config('payments.driver')) {
                'zarinpal' => new ZarinpalGateway(
                    config('payments.zarinpal.merchant_id'),
                    config('payments.zarinpal.sandbox'),
                ),
                default => new LogPaymentGateway,
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Kept in sync with the frontend's password-strength meter
        // (lib/passwordStrength.ts) so a password the UI marks as
        // strong enough is never rejected by the backend, and vice versa.
        Password::defaults(fn () => Password::min(8)->mixedCase()->numbers());
    }
}
