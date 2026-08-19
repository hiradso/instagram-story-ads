<?php

namespace App\Http\Controllers;

use App\Http\Requests\Wallet\DepositRequest;
use App\Models\WalletTransaction;
use App\Services\AdvertiserWalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AdvertiserWalletController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'wallet_balance' => $request->user()->wallet_balance,
            'transactions' => WalletTransaction::where('user_id', $request->user()->id)
                ->latest()
                ->paginate(20),
        ]);
    }

    public function deposit(DepositRequest $request, AdvertiserWalletService $service): JsonResponse
    {
        try {
            $redirectUrl = $service->requestDeposit(
                $request->user(),
                (string) $request->float('amount'),
                route('payments.callback'),
            );
        } catch (RuntimeException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json(['redirect_url' => $redirectUrl]);
    }
}
