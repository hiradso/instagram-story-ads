<?php

namespace App\Http\Controllers;

use App\Http\Requests\Campaign\StoreCampaignRequest;
use App\Http\Requests\Campaign\UpdateCampaignRequest;
use App\Models\Campaign;
use App\Notifications\CampaignActivatedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $campaigns = $request->user()->campaigns()
            ->with(['category', 'provinces'])
            ->latest()
            ->paginate(20);

        return response()->json($campaigns);
    }

    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $data = $request->validated();
        $creativePath = $request->file('creative')->store('campaign-creatives', 'public');
        $capacityViews = (int) floor($data['budget_total'] / $data['price_per_1000_views'] * 1000);

        $campaign = $request->user()->campaigns()->create([
            ...collect($data)->except(['creative', 'province_ids'])->all(),
            'creative_path' => $creativePath,
            'budget_remaining' => $data['budget_total'],
            'capacity_views' => $capacityViews,
            'views_delivered' => 0,
            'status' => 'draft',
        ]);

        if (! empty($data['province_ids'])) {
            $campaign->provinces()->sync($data['province_ids']);
        }

        return response()->json($campaign->load('provinces'), 201);
    }

    public function show(Campaign $campaign): JsonResponse
    {
        Gate::authorize('view', $campaign);

        return response()->json($campaign->load(['category', 'provinces', 'assignments']));
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign): JsonResponse
    {
        Gate::authorize('update', $campaign);

        $data = $request->validated();
        $campaign->fill(collect($data)->except(['creative', 'province_ids'])->all());

        if ($request->hasFile('creative')) {
            $campaign->creative_path = $request->file('creative')->store('campaign-creatives', 'public');
        }

        // Budget or price changed: keep remaining budget and capacity consistent.
        if (isset($data['budget_total']) || isset($data['price_per_1000_views'])) {
            $campaign->budget_remaining = $campaign->budget_total;
            $campaign->capacity_views = (int) floor($campaign->budget_total / $campaign->price_per_1000_views * 1000);
        }

        $campaign->save();

        if (array_key_exists('province_ids', $data)) {
            $campaign->provinces()->sync($data['province_ids'] ?? []);
        }

        return response()->json($campaign->load('provinces'));
    }

    public function destroy(Campaign $campaign): JsonResponse
    {
        Gate::authorize('delete', $campaign);

        $campaign->delete();

        return response()->json(status: 204);
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json(
            Campaign::with(['advertiser', 'category', 'provinces'])->latest()->paginate(20)
        );
    }

    public function updateStatus(Request $request, Campaign $campaign): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending_review,active,paused,completed,cancelled'],
        ]);

        $newStatus = $request->string('status')->toString();
        $campaign->update(['status' => $newStatus]);

        if ($newStatus === 'active') {
            $campaign->advertiser->notify(new CampaignActivatedNotification($campaign));
        }

        return response()->json($campaign);
    }
}
