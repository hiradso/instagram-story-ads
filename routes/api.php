<?php

use App\Http\Controllers\AmbassadorProfileController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CampaignAssignmentController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\ReferenceDataController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ViewSubmissionController;
use App\Http\Controllers\WithdrawalRequestController;
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
    Route::patch('/me', [AuthController::class, 'updateMe']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/ambassador-profiles', [AmbassadorProfileController::class, 'adminIndex']);
        Route::post('/ambassador-profiles/{ambassadorProfile}/verify', [AmbassadorProfileController::class, 'verify']);

        Route::get('/campaigns', [CampaignController::class, 'adminIndex']);
        Route::patch('/campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);

        Route::patch('/users/{user}/level', [UserController::class, 'updateLevel']);

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
    });

    Route::middleware('role:ambassador')->prefix('ambassador')->group(function () {
        Route::get('/profile', [AmbassadorProfileController::class, 'show']);
        Route::post('/profile', [AmbassadorProfileController::class, 'store']);
        Route::put('/profile', [AmbassadorProfileController::class, 'update']);

        Route::get('/assignments', [CampaignAssignmentController::class, 'index']);
        Route::post('/assignments/{assignment}/submission', [CampaignAssignmentController::class, 'submitScreenshot']);

        Route::get('/withdrawals', [WithdrawalRequestController::class, 'index']);
        Route::post('/withdrawals', [WithdrawalRequestController::class, 'store']);
    });
});
