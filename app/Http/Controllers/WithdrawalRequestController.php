<?php

namespace App\Http\Controllers;

use App\Http\Requests\ViewSubmission\RejectSubmissionRequest;
use App\Http\Requests\WithdrawalRequest\StoreWithdrawalRequestRequest;
use App\Models\WithdrawalRequest;
use App\Services\WithdrawalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class WithdrawalRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $withdrawals = $request->user()->withdrawalRequests()
            ->latest()
            ->paginate(20);

        return response()->json($withdrawals);
    }

    public function store(StoreWithdrawalRequestRequest $request, WithdrawalService $service): JsonResponse
    {
        try {
            $withdrawal = $service->request($request->user(), (string) $request->float('amount'));
        } catch (RuntimeException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json($withdrawal, 201);
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json(
            WithdrawalRequest::with('user')->latest()->paginate(20)
        );
    }

    public function approve(Request $request, WithdrawalRequest $withdrawal, WithdrawalService $service): JsonResponse
    {
        try {
            $service->approve($withdrawal, $request->user(), $request->string('admin_note')->toString() ?: null);
        } catch (RuntimeException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json($withdrawal->fresh());
    }

    public function reject(
        RejectSubmissionRequest $request,
        WithdrawalRequest $withdrawal,
        WithdrawalService $service
    ): JsonResponse {
        try {
            $service->reject($withdrawal, $request->user(), $request->string('reason')->toString());
        } catch (RuntimeException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json($withdrawal->fresh());
    }

    public function markPaid(Request $request, WithdrawalRequest $withdrawal, WithdrawalService $service): JsonResponse
    {
        try {
            $service->markPaid($withdrawal, $request->user());
        } catch (RuntimeException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json($withdrawal->fresh());
    }
}
