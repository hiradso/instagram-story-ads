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

        return response()->json($profile);
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json(
            AmbassadorProfile::with(['user', 'category', 'province', 'city'])->paginate(20)
        );
    }

    public function verify(AmbassadorProfile $ambassadorProfile): JsonResponse
    {
        $ambassadorProfile->update(['verified_at' => now()]);

        return response()->json($ambassadorProfile);
    }
}
