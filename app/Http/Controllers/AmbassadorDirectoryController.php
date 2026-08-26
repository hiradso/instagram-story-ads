<?php

namespace App\Http\Controllers;

use App\Models\AmbassadorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Lets an advertiser browse ambassador profiles to hand-pick who to work
// with (the alternative to waiting on CampaignMatchingService's automatic
// assignment) — see Campaign::assignment_mode. Only verified profiles show
// up here, since an advertiser is trusting this listing to vet ambassadors
// for them.
class AmbassadorDirectoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profiles = AmbassadorProfile::query()
            ->with(['user', 'category', 'province', 'city'])
            ->whereNotNull('verified_at')
            ->whereHas('user', fn ($query) => $query->where('status', 'active'))
            ->when(
                $request->filled('category_id'),
                fn ($query) => $query->where('category_id', $request->integer('category_id'))
            )
            ->when(
                $request->filled('province_id'),
                fn ($query) => $query->where('province_id', $request->integer('province_id'))
            )
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where('instagram_username', 'like', '%'.$request->string('search').'%')
            )
            ->orderByDesc('avg_views_7d')
            ->paginate(20)
            ->withQueryString();

        return response()->json($profiles);
    }

    public function show(AmbassadorProfile $ambassadorProfile): JsonResponse
    {
        abort_unless($ambassadorProfile->verified_at, 404);

        $ambassadorProfile->load(['user', 'category', 'province', 'city', 'advertisedCities']);
        // Contact details stay private until a conversation is agreed on —
        // the directory is for vetting, not for reaching ambassadors directly.
        $ambassadorProfile->user->makeHidden(['email', 'phone']);

        return response()->json($ambassadorProfile);
    }
}
