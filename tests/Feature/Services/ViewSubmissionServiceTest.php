<?php

namespace Tests\Feature\Services;

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
use App\Services\ViewSubmissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class ViewSubmissionServiceTest extends TestCase
{
    use RefreshDatabase;

    private ViewSubmissionService $service;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        Notification::fake();

        $this->service = app(ViewSubmissionService::class);
    }

    private function makeAssignmentInternal(array $attributes = []): CampaignAssignment
    {
        $campaign = Campaign::factory()->active()->create([
            'price_per_1000_views' => '50000.00',
            'budget_remaining' => '1000000.00',
            'views_delivered' => 0,
        ]);

        $ambassador = User::factory()->ambassador()->create();
        AmbassadorProfile::factory()->create([
            'user_id' => $ambassador->id,
            'wallet_balance' => 0,
        ]);

        return CampaignAssignment::factory()->create(array_merge([
            'campaign_id' => $campaign->id,
            'ambassador_id' => $ambassador->id,
            'status' => 'assigned',
            'post_deadline_at' => now()->addDay(),
        ], $attributes));
    }

    public function test_submit_creates_a_pending_submission_and_marks_assignment_submitted(): void
    {
        $assignment = $this->makeAssignmentInternal();
        $file = UploadedFile::fake()->image('proof.jpg', 200, 400);

        $submission = $this->service->submit($assignment, $file, 5000);

        $this->assertSame('pending', $submission->status);
        $this->assertSame(5000, $submission->claimed_views);
        $this->assertSame('submitted', $assignment->fresh()->status);
        Storage::disk('local')->assertExists($submission->screenshot_path);
    }

    public function test_submit_rejects_a_duplicate_screenshot(): void
    {
        $assignment = $this->makeAssignmentInternal();
        $file = UploadedFile::fake()->createWithContent('proof.jpg', 'identical-bytes');

        $this->service->submit($assignment, $file, 1000);

        $secondAssignment = $this->makeAssignmentInternal();
        $duplicateFile = UploadedFile::fake()->createWithContent('proof2.jpg', 'identical-bytes');

        $this->expectException(DuplicateScreenshotException::class);
        $this->service->submit($secondAssignment, $duplicateFile, 1000);
    }

    public function test_submit_expires_the_assignment_past_its_deadline(): void
    {
        $assignment = $this->makeAssignmentInternal(['post_deadline_at' => now()->subHour()]);
        $file = UploadedFile::fake()->image('proof.jpg');

        $this->expectException(SubmissionWindowExpiredException::class);

        try {
            $this->service->submit($assignment, $file, 1000);
        } finally {
            $this->assertSame('expired', $assignment->fresh()->status);
        }
    }

    public function test_submit_rejects_an_assignment_not_in_a_submittable_state(): void
    {
        $assignment = $this->makeAssignmentInternal(['status' => 'approved']);
        $file = UploadedFile::fake()->image('proof.jpg');

        $this->expectException(RuntimeException::class);
        $this->service->submit($assignment, $file, 1000);
    }

    public function test_approve_credits_the_ambassador_wallet_and_debits_campaign_budget(): void
    {
        $assignment = $this->makeAssignmentInternal(['status' => 'submitted']);
        $campaign = $assignment->campaign;
        $profile = AmbassadorProfile::where('user_id', $assignment->ambassador_id)->first();

        $submission = ViewSubmission::factory()->create([
            'campaign_assignment_id' => $assignment->id,
            'claimed_views' => 4000,
            'status' => 'pending',
        ]);

        $admin = User::factory()->admin()->create();

        $this->service->approve($submission, $admin, 4000);

        // 4000 / 1000 * 50000 = 200000.00
        $this->assertSame('200000.00', $profile->fresh()->wallet_balance);
        $this->assertSame('800000.00', $campaign->fresh()->budget_remaining);
        $this->assertSame(4000, $campaign->fresh()->views_delivered);
        $this->assertSame('approved', $submission->fresh()->status);
        $this->assertSame('approved', $assignment->fresh()->status);
        $this->assertSame($admin->id, $submission->fresh()->reviewed_by);

        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $assignment->ambassador_id,
            'type' => 'credit',
            'amount' => '200000.00',
            'source_type' => ViewSubmission::class,
            'source_id' => $submission->id,
        ]);

        Notification::assertSentTo($assignment->ambassador->fresh(), SubmissionApprovedNotification::class);
    }

    public function test_approve_defaults_to_claimed_views_when_no_override_given(): void
    {
        $assignment = $this->makeAssignmentInternal(['status' => 'submitted']);
        $submission = ViewSubmission::factory()->create([
            'campaign_assignment_id' => $assignment->id,
            'claimed_views' => 2000,
            'status' => 'pending',
        ]);

        $this->service->approve($submission, User::factory()->admin()->create());

        $this->assertSame(2000, $submission->fresh()->approved_views);
    }

    public function test_approve_rejects_a_submission_that_is_not_pending(): void
    {
        $assignment = $this->makeAssignmentInternal(['status' => 'submitted']);
        $submission = ViewSubmission::factory()->create([
            'campaign_assignment_id' => $assignment->id,
            'status' => 'approved',
        ]);

        $this->expectException(RuntimeException::class);
        $this->service->approve($submission, User::factory()->admin()->create());
    }

    public function test_reject_marks_submission_and_assignment_rejected(): void
    {
        $assignment = $this->makeAssignmentInternal(['status' => 'submitted']);
        $submission = ViewSubmission::factory()->create([
            'campaign_assignment_id' => $assignment->id,
            'status' => 'pending',
        ]);

        $admin = User::factory()->admin()->create();
        $this->service->reject($submission, $admin, 'تصویر واضح نیست');

        $this->assertSame('rejected', $submission->fresh()->status);
        $this->assertSame('rejected', $assignment->fresh()->status);
        $this->assertSame('تصویر واضح نیست', $submission->fresh()->rejection_reason);
        $this->assertSame(0, WalletTransaction::count());

        Notification::assertSentTo($assignment->ambassador->fresh(), SubmissionRejectedNotification::class);
    }

    public function test_reject_rejects_a_submission_that_is_not_pending(): void
    {
        $assignment = $this->makeAssignmentInternal(['status' => 'submitted']);
        $submission = ViewSubmission::factory()->create([
            'campaign_assignment_id' => $assignment->id,
            'status' => 'rejected',
        ]);

        $this->expectException(RuntimeException::class);
        $this->service->reject($submission, User::factory()->admin()->create(), 'reason');
    }
}
