<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function adminIndex(Request $request): JsonResponse
    {
        $users = User::query()
            ->whereIn('role', ['advertiser', 'ambassador'])
            ->when(
                $request->filled('role') && $request->string('role')->toString() !== 'all',
                fn ($query) => $query->where('role', $request->string('role'))
            )
            ->when(
                $request->filled('status') && $request->string('status')->toString() !== 'all',
                fn ($query) => $query->where('status', $request->string('status'))
            )
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where(function ($q) use ($request) {
                    $search = $request->string('search')->toString();
                    $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                })
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return response()->json($users);
    }

    // Reuses the public registration rules (name/email/phone/password/role,
    // role limited to advertiser|ambassador) — an admin-created account goes
    // through the exact same validation a self-service signup would.
    public function store(RegisterRequest $request): JsonResponse
    {
        $user = new User([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'password' => Hash::make($request->validated('password')),
        ]);
        $user->forceFill(['role' => $request->validated('role')])->save();
        $user->refresh();

        return response()->json($user, 201);
    }

    public function updateLevel(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'level' => ['required', 'integer', 'between:1,3'],
        ]);

        $user->forceFill(['level' => $request->integer('level')])->save();

        return response()->json($user);
    }

    // Suspending a user blocks future logins (checked in AuthController::login)
    // and revokes every token they're currently holding, so access is cut
    // immediately rather than only on their next login attempt. We never hard
    // -delete a user: their campaigns, assignments, and wallet ledger rows
    // must stay intact for financial/audit history.
    public function updateStatus(Request $request, User $user): JsonResponse
    {
        abort_if($user->role === 'admin', 403, 'نمی‌شه وضعیت حساب ادمین رو تغییر داد.');

        $request->validate([
            'status' => ['required', 'in:active,suspended'],
        ]);

        $user->forceFill(['status' => $request->string('status')->toString()])->save();

        if ($user->status === 'suspended') {
            $user->tokens()->delete();
        }

        return response()->json($user);
    }
}
