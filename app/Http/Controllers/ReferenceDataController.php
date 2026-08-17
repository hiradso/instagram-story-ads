<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Province;
use Illuminate\Http\JsonResponse;

class ReferenceDataController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json(Category::orderBy('name')->get());
    }

    public function provinces(): JsonResponse
    {
        return response()->json(Province::orderBy('name')->get());
    }

    public function cities(Province $province): JsonResponse
    {
        return response()->json($province->cities()->orderBy('name')->get());
    }
}
