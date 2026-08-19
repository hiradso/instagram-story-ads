<?php

use App\Http\Controllers\PaymentCallbackController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/payments/callback', [PaymentCallbackController::class, 'callback'])->name('payments.callback');
Route::get('/payments/fake-gateway/{authority}', [PaymentCallbackController::class, 'fakeGateway'])->name('payments.fake-gateway');
