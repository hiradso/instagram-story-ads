<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class PasswordResetController extends Controller
{
    public function forgotPassword(ForgotPasswordRequest $request, PasswordResetService $service): JsonResponse
    {
        $service->requestOtp($request->validated('phone'));

        // Same response whether or not the phone is registered, so this
        // endpoint can't be used to enumerate accounts.
        return response()->json([
            'message' => 'اگه این شماره ثبت شده باشه، کد بازیابی براش پیامک می‌شه.',
        ]);
    }

    public function reset(ResetPasswordRequest $request, PasswordResetService $service): JsonResponse
    {
        try {
            $service->resetPassword(
                $request->validated('phone'),
                $request->validated('code'),
                $request->validated('password'),
            );
        } catch (RuntimeException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json(['message' => 'رمز عبورت با موفقیت تغییر کرد.']);
    }
}
