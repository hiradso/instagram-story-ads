<?php

namespace App\Jobs;

use App\Models\Campaign;
use App\Services\CampaignMatchingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AllocateCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Campaign $campaign)
    {
    }

    public function handle(CampaignMatchingService $matchingService): void
    {
        $matchingService->allocate($this->campaign);
    }
}
