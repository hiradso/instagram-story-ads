<?php

namespace App\Console\Commands;

use App\Jobs\AllocateCampaignJob;
use App\Models\Campaign;
use Illuminate\Console\Command;

class AllocateCampaigns extends Command
{
    protected $signature = 'campaigns:allocate';

    protected $description = 'Dispatch allocation jobs for active campaigns that still have capacity';

    public function handle(): int
    {
        $campaigns = Campaign::query()
            ->where('status', 'active')
            ->where('assignment_mode', 'auto')
            ->whereColumn('views_delivered', '<', 'capacity_views')
            ->get();

        foreach ($campaigns as $campaign) {
            AllocateCampaignJob::dispatch($campaign);
        }

        $this->info("Dispatched allocation for {$campaigns->count()} campaign(s).");

        return self::SUCCESS;
    }
}
