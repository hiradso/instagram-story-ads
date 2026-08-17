<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

// Admin accounts are never created through public registration; only
// advertiser/ambassador roles are self-service (enforced in RegisterRequest).
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/ping', fn () => response()->json(['ok' => true]));
    });

    Route::middleware('role:advertiser')->group(function () {
        Route::get('/advertiser/ping', fn () => response()->json(['ok' => true]));
    });

    Route::middleware('role:ambassador')->group(function () {
        Route::get('/ambassador/ping', fn () => response()->json(['ok' => true]));
    });
});
