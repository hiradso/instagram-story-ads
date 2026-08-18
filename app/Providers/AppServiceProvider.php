<?php

namespace App\Providers;

use App\Sms\KavenegarSmsGateway;
use App\Sms\LogSmsGateway;
use App\Sms\SmsGateway;
use Illuminate\Support\ServiceProvider;

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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
