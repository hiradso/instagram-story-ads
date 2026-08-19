<?php

namespace App\Http\Controllers;

use App\Services\AdvertiserWalletService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Redirect;

class PaymentCallbackController extends Controller
{
    /**
     * The gateway (real or fake) redirects the payer's browser here after
     * the payment attempt. Not behind auth:sanctum — a plain browser
     * redirect can't carry a bearer token, so the deposit's unguessable
     * `authority` is what ties this request back to the right advertiser.
     */
    public function callback(Request $request, AdvertiserWalletService $service)
    {
        $authority = $request->string('Authority')->toString();
        $status = $request->string('Status')->toString();

        $result = $service->confirmDeposit($authority, $status);

        return Redirect::away(
            rtrim(config('app.frontend_url'), '/').'/advertiser/wallet?'.http_build_query([
                'deposit' => $result['success'] ? 'success' : 'failed',
                'amount' => $result['amount'],
            ])
        );
    }

    /**
     * Dev-only stand-in for the real gateway's hosted payment page, used
     * by the `log` payment driver so the whole deposit → callback →
     * wallet-credit flow can be exercised without real ZarinPal
     * credentials. Never reached when PAYMENT_DRIVER=zarinpal.
     */
    public function fakeGateway(string $authority, Request $request): Response
    {
        $callbackUrl = $request->string('callback_url')->toString();
        $successUrl = $callbackUrl.'?'.http_build_query(['Authority' => $authority, 'Status' => 'OK']);
        $failUrl = $callbackUrl.'?'.http_build_query(['Authority' => $authority, 'Status' => 'NOK']);

        $html = <<<HTML
        <!doctype html>
        <html lang="fa" dir="rtl">
        <head>
            <meta charset="utf-8">
            <title>شبیه‌ساز درگاه پرداخت (فقط توسعه)</title>
            <style>
                body { font-family: Tahoma, sans-serif; background: #0b0f1a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                .card { background: #1e293b; border-radius: 16px; padding: 32px; max-width: 360px; text-align: center; }
                h1 { font-size: 18px; margin-bottom: 8px; }
                p { color: #94a3b8; font-size: 13px; margin-bottom: 24px; }
                a { display: block; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-bottom: 10px; }
                .pay { background: #16a34a; color: #fff; }
                .cancel { background: #334155; color: #cbd5e1; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>شبیه‌ساز درگاه پرداخت</h1>
                <p>این صفحه فقط برای تست محلیه — تا وقتی اطلاعات واقعی زرین‌پال وصل نشده، این جای درگاه واقعی رو می‌گیره.</p>
                <a class="pay" href="{$successUrl}">پرداخت موفق</a>
                <a class="cancel" href="{$failUrl}">انصراف از پرداخت</a>
            </div>
        </body>
        </html>
        HTML;

        return response($html);
    }
}
