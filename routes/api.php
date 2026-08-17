<?php

use App\Http\Controllers\AmbassadorProfileController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\ReferenceDataController;
use Illuminate\Support\Facades\Route;

// Admin accounts are never created through public registration; only
// advertiser/ambassador roles are self-service (enforced in RegisterRequest).
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categories', [ReferenceDataController::class, 'categories']);
Route::get('/provinces', [ReferenceDataController::class, 'provinces']);
Route::get('/provinces/{province}/cities', [ReferenceDataController::class, 'cities']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/ambassador-profiles', [AmbassadorProfileController::class, 'adminIndex']);
        Route::post('/ambassador-profiles/{ambassadorProfile}/verify', [AmbassadorProfileController::class, 'verify']);

        Route::get('/campaigns', [CampaignController::class, 'adminIndex']);
        Route::patch('/campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);
    });

    Route::middleware('role:advertiser')->prefix('advertiser')->group(function () {
        Route::get('/campaigns', [CampaignController::class, 'index']);
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
        // POST, not PUT/PATCH: this accepts multipart uploads (a new creative image).
        Route::post('/campaigns/{campaign}', [CampaignController::class, 'update']);
        Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);
    });

    Route::middleware('role:ambassador')->prefix('ambassador')->group(function () {
        Route::get('/profile', [AmbassadorProfileController::class, 'show']);
        Route::post('/profile', [AmbassadorProfileController::class, 'store']);
        Route::put('/profile', [AmbassadorProfileController::class, 'update']);
    });
});
