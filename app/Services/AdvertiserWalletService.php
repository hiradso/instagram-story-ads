<?php

namespace App\Services;

use App\Models\User;
use App\Models\WalletDeposit;
use App\Models\WalletTransaction;
use App\Payments\PaymentGateway;
use Illuminate\Support\Facades\DB;

class AdvertiserWalletService
{
    public function __construct(private readonly PaymentGateway $gateway) {}

    /**
     * Start a deposit: creates a pending WalletDeposit and returns the
     * gateway URL to send the advertiser to.
     */
    public function requestDeposit(User $advertiser, string $amount, string $callbackUrl): string
    {
        $result = $this->gateway->request($amount, "شارژ کیف‌پول {$advertiser->name}", $callbackUrl);

        WalletDeposit::create([
            'user_id' => $advertiser->id,
            'amount' => $amount,
            'authority' => $result['authority'],
            'status' => 'pending',
        ]);

        return $result['redirect_url'];
    }

    /**
     * Handle the gateway's callback: verify the payment and, if genuine,
     * credit the advertiser's wallet. Idempotent — a repeated callback
     * for an already-settled deposit just returns its existing outcome
     * instead of crediting twice.
     *
     * @return array{success: bool, amount: string}
     */
    public function confirmDeposit(string $authority, string $gatewayStatus): array
    {
        $deposit = WalletDeposit::where('authority', $authority)->firstOrFail();

        if ($deposit->status !== 'pending') {
            return ['success' => $deposit->status === 'paid', 'amount' => (string) $deposit->amount];
        }

        if ($gatewayStatus !== 'OK') {
            $deposit->update(['status' => 'failed']);

            return ['success' => false, 'amount' => (string) $deposit->amount];
        }

        $result = $this->gateway->verify($deposit->authority, (string) $deposit->amount);

        if (! $result['success']) {
            $deposit->update(['status' => 'failed']);

            return ['success' => false, 'amount' => (string) $deposit->amount];
        }

        DB::transaction(function () use ($deposit, $result) {
            $user = User::whereKey($deposit->user_id)->lockForUpdate()->firstOrFail();
            $newBalance = bcadd((string) $user->wallet_balance, (string) $deposit->amount, 2);
            $user->update(['wallet_balance' => $newBalance]);

            WalletTransaction::create([
                'user_id' => $user->id,
                'type' => 'credit',
                'amount' => $deposit->amount,
                'balance_after' => $newBalance,
                'source_type' => WalletDeposit::class,
                'source_id' => $deposit->id,
                'description' => 'شارژ کیف‌پول از طریق درگاه پرداخت',
            ]);

            $deposit->update(['status' => 'paid', 'ref_id' => $result['ref_id']]);
        });

        return ['success' => true, 'amount' => (string) $deposit->amount];
    }
}
