<?php

namespace App\Http\Controllers;

use App\Http\Requests\AmbassadorProfile\StoreAmbassadorProfileRequest;
use App\Http\Requests\AmbassadorProfile\UpdateAmbassadorProfileRequest;
use App\Models\AmbassadorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AmbassadorProfileController extends Controller
{
    public function store(StoreAmbassadorProfileRequest $request): JsonResponse
    {
        if ($request->user()->ambassadorProfile()->exists()) {
            abort(422, 'قبلاً پروفایل سفیر ساختی؛ برای ویرایش از مسیر آپدیت استفاده کن.');
        }

        $profile = $request->user()->ambassadorProfile()->create($request->validated());

        // create() returns the in-memory model as given, not what the DB
        // actually stored (e.g. the wallet_balance column default) —
        // reload it, with relations, so the response matches show().
        $profile->refresh()->load(['category', 'province', 'city']);

        return response()->json($profile, 201);
    }

    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->ambassadorProfile()
            ->with(['category', 'province', 'city'])
            ->firstOrFail();

        return response()->json($profile);
    }

    public function update(UpdateAmbassadorProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->ambassadorProfile()->firstOrFail();
        $profile->update($request->validated());
        $profile->load(['category', 'province', 'city']);

        return response()->json($profile);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $profiles = AmbassadorProfile::query()
            ->with(['user', 'category', 'province', 'city'])
            ->when($request->filled('verified'), function ($query) use ($request) {
                $request->string('verified')->toString() === 'yes'
                    ? $query->whereNotNull('verified_at')
                    : $query->whereNull('verified_at');
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = '%'.$request->string('search').'%';
                $query->where(function ($inner) use ($term) {
                    $inner->where('instagram_username', 'like', $term)
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', $term));
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return response()->json($profiles);
    }

    public function verify(AmbassadorProfile $ambassadorProfile): JsonResponse
    {
        $ambassadorProfile->update(['verified_at' => now()]);

        return response()->json($ambassadorProfile);
    }
}
