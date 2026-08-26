<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RequestLoginOtpRequest;
use App\Http\Requests\Auth\VerifyLoginOtpRequest;
use App\Services\LoginOtpService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class LoginOtpController extends Controller
{
    public function request(RequestLoginOtpRequest $request, LoginOtpService $service): JsonResponse
    {
        $service->requestOtp($request->validated('phone'));

        // Same response whether or not the phone is registered, so this
        // endpoint can't be used to enumerate accounts.
        return response()->json([
            'message' => 'اگه این شماره ثبت شده باشه، کد ورود براش پیامک می‌شه.',
        ]);
    }

    public function verify(VerifyLoginOtpRequest $request, LoginOtpService $service): JsonResponse
    {
        try {
            $user = $service->login($request->validated('phone'), $request->validated('code'));
        } catch (RuntimeException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ]);
    }
}
