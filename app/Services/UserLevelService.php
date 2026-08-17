<?php

namespace App\Services;

use App\Models\User;

class UserLevelService
{
    /**
     * Promote an ambassador based on their lifetime count of approved
     * view submissions, if they've crossed a threshold. Never demotes —
     * that's an admin-only action.
     */
    public function maybePromote(User $user): void
    {
        if ($user->role !== 'ambassador') {
            return;
        }

        $approvedCount = $user->campaignAssignments()->where('status', 'approved')->count();

        $eligibleLevel = collect(config('campaigns.level_up_thresholds'))
            ->filter(fn (int $threshold) => $approvedCount >= $threshold)
            ->keys()
            ->max();

        if ($eligibleLevel && $eligibleLevel > $user->level) {
            $user->update(['level' => $eligibleLevel]);
        }
    }
}
