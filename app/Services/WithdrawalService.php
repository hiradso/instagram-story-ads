<?php

namespace App\Services;

use App\Models\AmbassadorProfile;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use App\Notifications\WithdrawalApprovedNotification;
use App\Notifications\WithdrawalRejectedNotification;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class WithdrawalService
{
    /**
     * Request a withdrawal: reserves the amount by debiting the wallet
     * immediately (via an immutable ledger row), so a second request can't
     * over-draw a balance that's already spoken for.
     */
    public function request(User $ambassador, string $amount): WithdrawalRequest
    {
        return DB::transaction(function () use ($ambassador, $amount) {
            $profile = AmbassadorProfile::where('user_id', $ambassador->id)->lockForUpdate()->firstOrFail();

            if (bccomp($amount, (string) $profile->wallet_balance, 2) === 1) {
                throw new RuntimeException('مبلغ درخواستی بیشتر از موجودی کیف‌پولته.');
            }

            $newBalance = bcsub((string) $profile->wallet_balance, $amount, 2);
            $profile->forceFill(['wallet_balance' => $newBalance])->save();

            $withdrawal = WithdrawalRequest::create([
                'user_id' => $ambassador->id,
                'amount' => $amount,
                'status' => 'pending',
            ]);

            WalletTransaction::create([
                'user_id' => $ambassador->id,
                'type' => 'debit',
                'amount' => $amount,
                'balance_after' => $newBalance,
                'source_type' => WithdrawalRequest::class,
                'source_id' => $withdrawal->id,
                'description' => 'درخواست برداشت وجه',
            ]);

            return $withdrawal;
        });
    }

    public function approve(WithdrawalRequest $withdrawal, User $admin, ?string $note = null): void
    {
        if ($withdrawal->status !== 'pending') {
            throw new RuntimeException('فقط درخواست‌های در انتظار بررسی قابل تاییدن.');
        }

        $withdrawal->update([
            'status' => 'approved',
            'processed_by' => $admin->id,
            'processed_at' => now(),
            'admin_note' => $note,
        ]);

        $withdrawal->user->notify(new WithdrawalApprovedNotification($withdrawal));
    }

    /**
     * Reject a pending withdrawal and refund the reserved amount back to
     * the ambassador's wallet.
     */
    public function reject(WithdrawalRequest $withdrawal, User $admin, string $reason): void
    {
        if ($withdrawal->status !== 'pending') {
            throw new RuntimeException('فقط درخواست‌های در انتظار بررسی قابل ردن.');
        }

        DB::transaction(function () use ($withdrawal, $admin, $reason) {
            $profile = AmbassadorProfile::where('user_id', $withdrawal->user_id)->lockForUpdate()->firstOrFail();

            $newBalance = bcadd((string) $profile->wallet_balance, (string) $withdrawal->amount, 2);
            $profile->forceFill(['wallet_balance' => $newBalance])->save();

            WalletTransaction::create([
                'user_id' => $withdrawal->user_id,
                'type' => 'credit',
                'amount' => $withdrawal->amount,
                'balance_after' => $newBalance,
                'source_type' => WithdrawalRequest::class,
                'source_id' => $withdrawal->id,
                'description' => 'استرداد درخواست برداشت ردشده',
            ]);

            $withdrawal->update([
                'status' => 'rejected',
                'processed_by' => $admin->id,
                'processed_at' => now(),
                'admin_note' => $reason,
            ]);
        });

        $withdrawal->user->notify(new WithdrawalRejectedNotification($withdrawal, $reason));
    }

    public function markPaid(WithdrawalRequest $withdrawal, User $admin): void
    {
        if ($withdrawal->status !== 'approved') {
            throw new RuntimeException('فقط درخواست‌های تاییدشده قابل ثبت پرداختن.');
        }

        $withdrawal->update([
            'status' => 'paid',
            'processed_by' => $admin->id,
            'processed_at' => now(),
        ]);
    }
}
