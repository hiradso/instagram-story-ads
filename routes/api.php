<?php

use App\Http\Controllers\AdvertiserWalletController;
use App\Http\Controllers\AmbassadorDirectoryController;
use App\Http\Controllers\AmbassadorProfileController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\LoginOtpController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\CampaignAssignmentController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\PlatformStatsController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\ReferenceDataController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ViewSubmissionController;
use App\Http\Controllers\WithdrawalRequestController;
use Illuminate\Support\Facades\Route;

// Admin accounts are never created through public registration; only
// advertiser/ambassador roles are self-service (enforced in RegisterRequest).
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/login/otp/request', [LoginOtpController::class, 'request'])->middleware('throttle:3,1');
Route::post('/login/otp/verify', [LoginOtpController::class, 'verify'])->middleware('throttle:10,1');

Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:10,1');

Route::get('/platform-stats', [PlatformStatsController::class, 'index']);
Route::get('/pricing', [PricingController::class, 'index']);

Route::get('/categories', [ReferenceDataController::class, 'categories']);
Route::get('/provinces', [ReferenceDataController::class, 'provinces']);
Route::get('/provinces/{province}/cities', [ReferenceDataController::class, 'cities']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateMe']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/ambassador-profiles', [AmbassadorProfileController::class, 'adminIndex']);
        Route::post('/ambassador-profiles/{ambassadorProfile}/verify', [AmbassadorProfileController::class, 'verify']);

        Route::get('/campaigns', [CampaignController::class, 'adminIndex']);
        Route::patch('/campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);

        Route::get('/users', [UserController::class, 'adminIndex']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{user}/level', [UserController::class, 'updateLevel']);
        Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);

        Route::get('/submissions', [ViewSubmissionController::class, 'index']);
        Route::get('/submissions/{submission}/screenshot', [ViewSubmissionController::class, 'screenshot']);
        Route::post('/submissions/{submission}/approve', [ViewSubmissionController::class, 'approve']);
        Route::post('/submissions/{submission}/reject', [ViewSubmissionController::class, 'reject']);

        Route::get('/withdrawals', [WithdrawalRequestController::class, 'adminIndex']);
        Route::post('/withdrawals/{withdrawal}/approve', [WithdrawalRequestController::class, 'approve']);
        Route::post('/withdrawals/{withdrawal}/reject', [WithdrawalRequestController::class, 'reject']);
        Route::post('/withdrawals/{withdrawal}/mark-paid', [WithdrawalRequestController::class, 'markPaid']);
    });

    Route::middleware('role:advertiser')->prefix('advertiser')->group(function () {
        Route::get('/campaigns', [CampaignController::class, 'index']);
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
        // POST, not PUT/PATCH: this accepts multipart uploads (a new creative image).
        Route::post('/campaigns/{campaign}', [CampaignController::class, 'update']);
        Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);

        Route::get('/wallet', [AdvertiserWalletController::class, 'show']);
        Route::post('/wallet/deposit', [AdvertiserWalletController::class, 'deposit']);

        Route::get('/ambassadors', [AmbassadorDirectoryController::class, 'index']);
        Route::get('/ambassadors/{ambassadorProfile}', [AmbassadorDirectoryController::class, 'show']);

        Route::post('/conversations', [ConversationController::class, 'store']);
        Route::post('/conversations/{conversation}/agree', [ConversationController::class, 'agree']);
    });

    Route::middleware('role:ambassador')->prefix('ambassador')->group(function () {
        Route::get('/profile', [AmbassadorProfileController::class, 'show']);
        Route::post('/profile', [AmbassadorProfileController::class, 'store']);
        // POST, not PUT: this accepts a multipart resume upload (see the
        // `_method=PUT` spoof field the frontend sends alongside it).
        Route::put('/profile', [AmbassadorProfileController::class, 'update']);

        Route::get('/assignments', [CampaignAssignmentController::class, 'index']);
        Route::post('/assignments/{assignment}/submission', [CampaignAssignmentController::class, 'submitScreenshot']);

        Route::get('/withdrawals', [WithdrawalRequestController::class, 'index']);
        Route::post('/withdrawals', [WithdrawalRequestController::class, 'store']);
    });

    Route::middleware('role:advertiser,ambassador')->group(function () {
        Route::get('/conversations', [ConversationController::class, 'index']);
        Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
        Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);
        Route::post('/conversations/{conversation}/decline', [ConversationController::class, 'decline']);
    });
});
