<?php

namespace App\Http\Controllers;

use App\Exceptions\DuplicateScreenshotException;
use App\Exceptions\SubmissionWindowExpiredException;
use App\Http\Requests\CampaignAssignment\SubmitViewRequest;
use App\Models\CampaignAssignment;
use App\Services\ViewSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignAssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $assignments = $request->user()->campaignAssignments()
            ->with(['campaign.category', 'viewSubmission'])
            ->latest('assigned_at')
            ->paginate(20);

        return response()->json($assignments);
    }

    public function submitScreenshot(
        SubmitViewRequest $request,
        CampaignAssignment $assignment,
        ViewSubmissionService $service
    ): JsonResponse {
        abort_if($assignment->ambassador_id !== $request->user()->id, 403);

        try {
            $submission = $service->submit(
                $assignment,
                $request->file('screenshot'),
                $request->integer('claimed_views')
            );
        } catch (DuplicateScreenshotException|SubmissionWindowExpiredException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json($submission, 201);
    }
}
