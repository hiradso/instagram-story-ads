<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

// Public, unauthenticated pricing transparency — real average/min/max
// price_per_1000_views computed from campaigns that actually ran (never a
// fabricated rate card). Categories with zero qualifying campaigns are
// left out entirely rather than shown with a made-up number.
class PricingController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Cache::remember('pricing-stats', now()->addMinutes(15), function () {
            $ranCampaigns = Campaign::whereIn('status', ['active', 'completed']);

            $overall = (clone $ranCampaigns)
                ->selectRaw('avg(price_per_1000_views) as avg, min(price_per_1000_views) as min, max(price_per_1000_views) as max, count(*) as sample_count')
                ->first();

            $byCategory = (clone $ranCampaigns)
                ->join('categories', 'categories.id', '=', 'campaigns.category_id')
                ->selectRaw('categories.id as category_id, categories.name as category_name, avg(campaigns.price_per_1000_views) as avg, count(*) as sample_count')
                ->groupBy('categories.id', 'categories.name')
                ->orderByDesc('sample_count')
                ->get();

            return [
                'overall' => [
                    'avg' => $overall->avg !== null ? round((float) $overall->avg) : null,
                    'min' => $overall->min !== null ? round((float) $overall->min) : null,
                    'max' => $overall->max !== null ? round((float) $overall->max) : null,
                    'sample_count' => (int) $overall->sample_count,
                ],
                // ->values()->all() so this is a plain array, not an
                // Eloquent Collection — caching the collection object
                // itself round-trips through PHP's serializer as a broken
                // stub (__PHP_Incomplete_Class_Name) on the next request.
                'by_category' => $byCategory->map(fn ($row) => [
                    'category_id' => $row->category_id,
                    'category_name' => $row->category_name,
                    'avg' => round((float) $row->avg),
                    'sample_count' => (int) $row->sample_count,
                ])->values()->all(),
            ];
        });

        return response()->json($data);
    }
}
