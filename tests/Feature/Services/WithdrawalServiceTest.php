<?php

namespace Tests\Feature\Services;

use App\Models\AmbassadorProfile;
use App\Models\User;
use App\Models\WithdrawalRequest;
use App\Notifications\WithdrawalApprovedNotification;
use App\Notifications\WithdrawalRejectedNotification;
use App\Services\WithdrawalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use RuntimeException;
use Tests\TestCase;

class WithdrawalServiceTest extends TestCase
{
    use RefreshDatabase;

    private WithdrawalService $service;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
        $this->service = new WithdrawalService;
    }

    private function ambassadorWithBalance(string $balance): User
    {
        $ambassador = User::factory()->ambassador()->create();
        AmbassadorProfile::factory()->create([
            'user_id' => $ambassador->id,
            'wallet_balance' => $balance,
        ]);

        return $ambassador;
    }

    public function test_request_reserves_funds_by_debiting_immediately(): void
    {
        $ambassador = $this->ambassadorWithBalance('500000.00');

        $withdrawal = $this->service->request($ambassador, '200000.00');

        $this->assertSame('pending', $withdrawal->status);
        $this->assertSame('300000.00', AmbassadorProfile::where('user_id', $ambassador->id)->first()->wallet_balance);
        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $ambassador->id,
            'type' => 'debit',
            'amount' => '200000.00',
            'source_type' => WithdrawalRequest::class,
        ]);
    }

    public function test_request_rejects_an_amount_larger_than_the_balance(): void
    {
        $ambassador = $this->ambassadorWithBalance('100000.00');

        $this->expectException(RuntimeException::class);

        try {
            $this->service->request($ambassador, '100000.01');
        } finally {
            $this->assertSame('100000.00', AmbassadorProfile::where('user_id', $ambassador->id)->first()->wallet_balance);
        }
    }

    public function test_request_allows_withdrawing_the_exact_balance(): void
    {
        $ambassador = $this->ambassadorWithBalance('150000.00');

        $withdrawal = $this->service->request($ambassador, '150000.00');

        $this->assertSame('0.00', AmbassadorProfile::where('user_id', $ambassador->id)->first()->wallet_balance);
        $this->assertSame('150000.00', $withdrawal->amount);
    }

    public function test_a_second_withdrawal_cannot_overdraw_reserved_funds(): void
    {
        $ambassador = $this->ambassadorWithBalance('100000.00');

        $this->service->request($ambassador, '100000.00');

        $this->expectException(RuntimeException::class);
        $this->service->request($ambassador, '1.00');
    }

    public function test_approve_transitions_pending_to_approved_and_notifies(): void
    {
        $ambassador = $this->ambassadorWithBalance('200000.00');
        $withdrawal = $this->service->request($ambassador, '100000.00');
        $admin = User::factory()->admin()->create();

        $this->service->approve($withdrawal, $admin, 'ok');

        $this->assertSame('approved', $withdrawal->fresh()->status);
        $this->assertSame($admin->id, $withdrawal->fresh()->processed_by);
        Notification::assertSentTo($ambassador, WithdrawalApprovedNotification::class);
    }

    public function test_approve_rejects_a_withdrawal_that_is_not_pending(): void
    {
        $ambassador = $this->ambassadorWithBalance('200000.00');
        $withdrawal = $this->service->request($ambassador, '100000.00');
        $admin = User::factory()->admin()->create();
        $this->service->approve($withdrawal, $admin);

        $this->expectException(RuntimeException::class);
        $this->service->approve($withdrawal, $admin);
    }

    public function test_reject_refunds_the_reserved_amount_back_to_the_wallet(): void
    {
        $ambassador = $this->ambassadorWithBalance('200000.00');
        $withdrawal = $this->service->request($ambassador, '150000.00');
        $admin = User::factory()->admin()->create();

        $this->service->reject($withdrawal, $admin, 'اطلاعات ناقص');

        $this->assertSame('rejected', $withdrawal->fresh()->status);
        $this->assertSame('200000.00', AmbassadorProfile::where('user_id', $ambassador->id)->first()->wallet_balance);
        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $ambassador->id,
            'type' => 'credit',
            'amount' => '150000.00',
            'description' => 'استرداد درخواست برداشت ردشده',
        ]);
        Notification::assertSentTo($ambassador, WithdrawalRejectedNotification::class);
    }

    public function test_mark_paid_requires_an_approved_withdrawal(): void
    {
        $ambassador = $this->ambassadorWithBalance('200000.00');
        $withdrawal = $this->service->request($ambassador, '100000.00');
        $admin = User::factory()->admin()->create();

        $this->expectException(RuntimeException::class);
        $this->service->markPaid($withdrawal, $admin);
    }

    public function test_mark_paid_transitions_approved_to_paid(): void
    {
        $ambassador = $this->ambassadorWithBalance('200000.00');
        $withdrawal = $this->service->request($ambassador, '100000.00');
        $admin = User::factory()->admin()->create();
        $this->service->approve($withdrawal, $admin);

        $this->service->markPaid($withdrawal, $admin);

        $this->assertSame('paid', $withdrawal->fresh()->status);
    }
}
