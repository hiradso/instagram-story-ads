<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $referrerId = null;
        if ($code = $request->validated('referral_code')) {
            $referrerId = User::where('referral_code', $code)->value('id');
        }

        $user = new User([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'password' => Hash::make($request->validated('password')),
        ]);

        // role/referred_by_id aren't mass-assignable (see User::$fillable) —
        // force them in explicitly, since they're server-validated/resolved
        // values here, not a raw request array.
        $user->forceFill([
            'role' => $request->validated('role'),
            'referred_by_id' => $referrerId,
        ])->save();

        // save() leaves the in-memory model as given, not what the DB
        // actually stored (e.g. the level/status column defaults) — same
        // class of bug already fixed once in AmbassadorProfileController.
        $user->refresh();

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['ایمیل یا رمز عبور اشتباهه.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['این حساب مسدود شده.'],
            ]);
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'خارج شدید.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function referrals(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'referral_code' => $user->referral_code,
            'referrals_count' => $user->referrals()->count(),
            'rewarded_referrals_count' => $user->referrals()->whereNotNull('referral_bonus_paid_at')->count(),
            'total_earned' => (string) $user->walletTransactions()->where('source_type', 'referral')->sum('amount'),
        ]);
    }

    public function updateMe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['nullable', 'regex:/^09\d{9}$/'],
        ]);

        $request->user()->update($data);

        return response()->json($request->user());
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->validated('current_password'), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['رمز عبور فعلی اشتباهه.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->validated('password'))]);

        // Keep the session that just proved the current password; sign
        // out every other device/token.
        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'رمز عبورت با موفقیت تغییر کرد.']);
    }
}
