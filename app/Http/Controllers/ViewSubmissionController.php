<?php

namespace App\Http\Controllers;

use App\Http\Requests\ViewSubmission\RejectSubmissionRequest;
use App\Models\ViewSubmission;
use App\Services\ViewSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ViewSubmissionController extends Controller
{
    public function index(): JsonResponse
    {
        $submissions = ViewSubmission::query()
            ->where('status', 'pending')
            ->with(['campaignAssignment.campaign', 'campaignAssignment.ambassador'])
            ->oldest()
            ->paginate(20);

        return response()->json($submissions);
    }

    public function approve(Request $request, ViewSubmission $submission, ViewSubmissionService $service): JsonResponse
    {
        $request->validate([
            'approved_views' => ['nullable', 'integer', 'min:1'],
        ]);

        $service->approve($submission, $request->user(), $request->integer('approved_views') ?: null);

        return response()->json($submission->fresh());
    }

    public function reject(
        RejectSubmissionRequest $request,
        ViewSubmission $submission,
        ViewSubmissionService $service
    ): JsonResponse {
        $service->reject($submission, $request->user(), $request->string('reason')->toString());

        return response()->json($submission->fresh());
    }

    public function screenshot(ViewSubmission $submission): StreamedResponse
    {
        return Storage::disk('local')->response($submission->screenshot_path);
    }
}
