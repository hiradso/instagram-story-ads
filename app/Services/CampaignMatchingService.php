<?php

namespace App\Services;

use App\Models\AmbassadorProfile;
use App\Models\Campaign;
use App\Models\CampaignAssignment;
use Illuminate\Support\Facades\DB;

class CampaignMatchingService
{
    /**
     * Assign eligible ambassadors to a campaign until its remaining
     * capacity is exhausted. Returns the number of assignments created.
     */
    public function allocate(Campaign $campaign): int
    {
        return DB::transaction(function () use ($campaign) {
            /** @var Campaign $campaign */
            $campaign = Campaign::whereKey($campaign->id)->lockForUpdate()->firstOrFail();

            if ($campaign->status !== 'active') {
                return 0;
            }

            $minViews = (int) config('campaigns.min_assignable_views');
            $remainingCapacity = $campaign->capacity_views - $campaign->views_delivered - $campaign->reservedViews();
            $assignedCount = 0;

            foreach ($this->eligibleAmbassadors($campaign) as $profile) {
                if ($remainingCapacity < $minViews) {
                    break;
                }

                if ($profile->avg_views_7d < $minViews || $profile->avg_views_7d > $remainingCapacity) {
                    continue;
                }

                CampaignAssignment::create([
                    'campaign_id' => $campaign->id,
                    'ambassador_id' => $profile->user_id,
                    'status' => 'assigned',
                    'assigned_at' => now(),
                    'post_deadline_at' => now()->addHours((int) config('campaigns.post_deadline_hours')),
                ]);

                $remainingCapacity -= $profile->avg_views_7d;
                $assignedCount++;
            }

            return $assignedCount;
        });
    }

    /**
     * @return \Illuminate\Support\Collection<int, AmbassadorProfile>
     */
    private function eligibleAmbassadors(Campaign $campaign)
    {
        $provinceIds = $campaign->provinces()->pluck('provinces.id');
        $alreadyAssignedUserIds = $campaign->assignments()->pluck('ambassador_id');

        return AmbassadorProfile::query()
            ->where('category_id', $campaign->category_id)
            ->when(
                $provinceIds->isNotEmpty(),
                fn ($query) => $query->whereIn('province_id', $provinceIds)
            )
            ->whereNotIn('user_id', $alreadyAssignedUserIds)
            ->whereHas('user', fn ($query) => $query->where('role', 'ambassador')->where('status', 'active'))
            ->orderByDesc('avg_views_7d')
            ->limit((int) config('campaigns.max_assignments_per_run'))
            ->get();
    }
}
