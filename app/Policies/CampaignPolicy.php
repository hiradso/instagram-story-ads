<?php

namespace App\Policies;

use App\Models\Campaign;
use App\Models\User;

class CampaignPolicy
{
    public function view(User $user, Campaign $campaign): bool
    {
        return $user->role === 'admin' || $campaign->advertiser_id === $user->id;
    }

    /**
     * Owners can only edit their own campaign while it's still a draft —
     * once submitted, changes go through the admin instead.
     */
    public function update(User $user, Campaign $campaign): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $campaign->advertiser_id === $user->id && $campaign->status === 'draft';
    }

    public function delete(User $user, Campaign $campaign): bool
    {
        return $this->update($user, $campaign);
    }
}
