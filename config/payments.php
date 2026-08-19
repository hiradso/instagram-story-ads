<?php

return [
    'driver' => env('PAYMENT_DRIVER', 'log'),

    'zarinpal' => [
        'merchant_id' => env('ZARINPAL_MERCHANT_ID'),
        'sandbox' => env('ZARINPAL_SANDBOX', true),
    ],

    'min_deposit' => env('WALLET_MIN_DEPOSIT', 50000),
];
