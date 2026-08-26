<?php

namespace App\Services;

use App\Models\AmbassadorProfile;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Notifications\ReferralBonusNotification;
use Illuminate\Support\Facades\DB;

class ReferralService
{
    private const BONUS_AMOUNT = '50000';

    /**
     * Pays the referrer a flat bonus the first time the user they referred
     * hits a real milestone — an ambassador's first approved view
     * submission, or an advertiser's first campaign going active (see call
     * sites in ViewSubmissionService and CampaignController). Only ever
     * pays once per referred user, regardless of how many times they hit
     * a qualifying event afterward.
     */
    public function rewardIfEligible(User $referredUser, string $description): void
    {
        if (! $referredUser->referred_by_id || $referredUser->referral_bonus_paid_at) {
            return;
        }

        $referrer = User::find($referredUser->referred_by_id);
        if (! $referrer) {
            return;
        }

        $paid = DB::transaction(function () use ($referrer, $referredUser, $description) {
            $newBalance = null;

            if ($referrer->role === 'ambassador') {
                $profile = AmbassadorProfile::where('user_id', $referrer->id)->lockForUpdate()->first();
                if (! $profile) {
                    return false;
                }
                $newBalance = bcadd((string) $profile->wallet_balance, self::BONUS_AMOUNT, 2);
                $profile->forceFill(['wallet_balance' => $newBalance])->save();
            } else {
                $referrer = User::whereKey($referrer->id)->lockForUpdate()->first();
                $newBalance = bcadd((string) $referrer->wallet_balance, self::BONUS_AMOUNT, 2);
                $referrer->forceFill(['wallet_balance' => $newBalance])->save();
            }

            // 'referral' is a plain tag, not a real morph class — nothing
            // reads WalletTransaction::source() for these rows, and tagging
            // them this way (rather than pointing at whatever milestone
            // triggered the payout) is what lets us reliably sum "referral
            // earnings" separately from normal wallet activity later.
            WalletTransaction::create([
                'user_id' => $referrer->id,
                'type' => 'credit',
                'amount' => self::BONUS_AMOUNT,
                'balance_after' => $newBalance,
                'source_type' => 'referral',
                'source_id' => $referredUser->id,
                'description' => $description,
            ]);

            return true;
        });

        if (! $paid) {
            return;
        }

        $referredUser->forceFill(['referral_bonus_paid_at' => now()])->save();
        $referrer->notify(new ReferralBonusNotification(self::BONUS_AMOUNT, $referredUser->name));
    }
}
