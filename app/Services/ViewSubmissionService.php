<?php

namespace App\Services;

use App\Exceptions\DuplicateScreenshotException;
use App\Exceptions\SubmissionWindowExpiredException;
use App\Models\AmbassadorProfile;
use App\Models\Campaign;
use App\Models\CampaignAssignment;
use App\Models\User;
use App\Models\ViewSubmission;
use App\Models\WalletTransaction;
use App\Notifications\SubmissionApprovedNotification;
use App\Notifications\SubmissionRejectedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class ViewSubmissionService
{
    public function __construct(
        private UserLevelService $levelService,
        private ScreenshotProcessor $screenshotProcessor,
    ) {}

    /**
     * Store a screenshot for an assignment, rejecting duplicates and
     * expired submission windows before anything is persisted.
     */
    public function submit(CampaignAssignment $assignment, UploadedFile $screenshot, int $claimedViews): ViewSubmission
    {
        if (! in_array($assignment->status, ['assigned', 'posted'], true)) {
            throw new RuntimeException('این تخصیص دیگه قابل ثبت اسکرین‌شات نیست.');
        }

        if (now()->greaterThan($assignment->post_deadline_at)) {
            $assignment->update(['status' => 'expired']);
            throw new SubmissionWindowExpiredException;
        }

        // Hash the original upload (not the resized copy) so two identical
        // source screenshots are still caught as duplicates even though
        // processing re-encodes them.
        $hash = hash_file('sha256', $screenshot->getRealPath());

        if (ViewSubmission::where('image_hash', $hash)->exists()) {
            throw new DuplicateScreenshotException;
        }

        // Normalize dimensions/format before storing — see
        // ScreenshotProcessor for why (a fixed-size review card shouldn't
        // have to deal with whatever resolution a phone produced).
        $processed = $this->screenshotProcessor->process($screenshot);
        $path = 'view-submissions/'.Str::random(40).'.jpg';
        Storage::disk('local')->put($path, $processed);

        return DB::transaction(function () use ($assignment, $path, $claimedViews, $hash) {
            $submission = ViewSubmission::create([
                'campaign_assignment_id' => $assignment->id,
                'screenshot_path' => $path,
                'image_hash' => $hash,
                'claimed_views' => $claimedViews,
                'status' => 'pending',
            ]);

            $assignment->update(['status' => 'submitted']);

            return $submission;
        });
    }

    /**
     * Approve a submission: credits the ambassador's wallet (via an
     * immutable ledger row) and debits the campaign's remaining budget.
     */
    public function approve(ViewSubmission $submission, User $admin, ?int $approvedViews = null): void
    {
        if ($submission->status !== 'pending') {
            throw new RuntimeException('فقط اسکرین‌شات‌های در انتظار بررسی قابل تاییدن.');
        }

        $approvedViews ??= $submission->claimed_views;
        $amount = null;

        DB::transaction(function () use ($submission, $admin, $approvedViews, &$amount) {
            $assignment = $submission->campaignAssignment()->lockForUpdate()->first();
            $campaign = Campaign::whereKey($assignment->campaign_id)->lockForUpdate()->firstOrFail();
            $profile = AmbassadorProfile::where('user_id', $assignment->ambassador_id)->lockForUpdate()->firstOrFail();

            $amount = bcmul(bcdiv((string) $approvedViews, '1000', 10), (string) $campaign->price_per_1000_views, 2);
            $newBalance = bcadd((string) $profile->wallet_balance, $amount, 2);

            $submission->update([
                'status' => 'approved',
                'approved_views' => $approvedViews,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            $assignment->update(['status' => 'approved']);

            $campaign->update([
                'views_delivered' => $campaign->views_delivered + $approvedViews,
                'budget_remaining' => bcsub((string) $campaign->budget_remaining, $amount, 2),
            ]);

            $profile->update(['wallet_balance' => $newBalance]);

            WalletTransaction::create([
                'user_id' => $assignment->ambassador_id,
                'type' => 'credit',
                'amount' => $amount,
                'balance_after' => $newBalance,
                'source_type' => ViewSubmission::class,
                'source_id' => $submission->id,
                'description' => "بابت بازدید تاییدشده کمپین #{$campaign->id}",
            ]);

            $this->levelService->maybePromote($assignment->ambassador);
        });

        $submission->campaignAssignment->ambassador->notify(new SubmissionApprovedNotification($submission, $amount));
    }

    public function reject(ViewSubmission $submission, User $admin, string $reason): void
    {
        if ($submission->status !== 'pending') {
            throw new RuntimeException('فقط اسکرین‌شات‌های در انتظار بررسی قابل ردن.');
        }

        DB::transaction(function () use ($submission, $admin, $reason) {
            $submission->update([
                'status' => 'rejected',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'rejection_reason' => $reason,
            ]);

            $submission->campaignAssignment()->update(['status' => 'rejected']);
        });

        $submission->campaignAssignment->ambassador->notify(new SubmissionRejectedNotification($submission));
    }
}
