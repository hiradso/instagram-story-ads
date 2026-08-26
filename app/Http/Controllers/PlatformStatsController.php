<?php

namespace App\Http\Controllers;

use App\Models\AmbassadorProfile;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

// Public, unauthenticated aggregate numbers shown on the marketing landing
// page as social proof. Real, live-computed figures — never hardcoded —
// so the page never claims something the platform hasn't actually done.
class PlatformStatsController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = Cache::remember('platform-stats', now()->addMinutes(15), function () {
            return [
                'campaigns_run' => Campaign::whereIn('status', ['active', 'completed'])->count(),
                'views_delivered' => (int) Campaign::sum('views_delivered'),
                'verified_ambassadors' => AmbassadorProfile::whereNotNull('verified_at')->count(),
                'advertisers' => User::where('role', 'advertiser')->count(),
            ];
        });

        return response()->json($stats);
    }
}
