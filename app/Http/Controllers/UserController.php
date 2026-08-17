<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function updateLevel(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'level' => ['required', 'integer', 'between:1,3'],
        ]);

        $user->update(['level' => $request->integer('level')]);

        return response()->json($user);
    }
}
