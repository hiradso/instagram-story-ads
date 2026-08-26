<?php

namespace Tests\Feature\Services;

use App\Models\User;
use App\Models\WalletDeposit;
use App\Payments\PaymentGateway;
use App\Services\AdvertiserWalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvertiserWalletServiceTest extends TestCase
{
    use RefreshDatabase;

    private function serviceWithGateway(bool $verifySucceeds): AdvertiserWalletService
    {
        $gateway = new class($verifySucceeds) implements PaymentGateway
        {
            public function __construct(private bool $verifySucceeds) {}

            public function request(string $amount, string $description, string $callbackUrl): array
            {
                return ['authority' => 'TEST-AUTHORITY', 'redirect_url' => 'https://example.test/pay'];
            }

            public function verify(string $authority, string $amount): array
            {
                return ['success' => $this->verifySucceeds, 'ref_id' => $this->verifySucceeds ? 'REF-1' : null];
            }
        };

        return new AdvertiserWalletService($gateway);
    }

    public function test_request_deposit_creates_a_pending_deposit_and_returns_redirect_url(): void
    {
        $advertiser = User::factory()->advertiser()->create();
        $service = $this->serviceWithGateway(true);

        $url = $service->requestDeposit($advertiser, '100000.00', 'https://example.test/callback');

        $this->assertSame('https://example.test/pay', $url);
        $this->assertDatabaseHas('wallet_deposits', [
            'user_id' => $advertiser->id,
            'amount' => '100000.00',
            'authority' => 'TEST-AUTHORITY',
            'status' => 'pending',
        ]);
    }

    public function test_confirm_deposit_credits_the_wallet_on_successful_gateway_status(): void
    {
        $advertiser = User::factory()->advertiser()->create(['wallet_balance' => '50000.00']);
        $deposit = WalletDeposit::factory()->for($advertiser)->create([
            'amount' => '100000.00',
            'authority' => 'AUTH-1',
            'status' => 'pending',
        ]);

        $service = $this->serviceWithGateway(true);
        $result = $service->confirmDeposit('AUTH-1', 'OK');

        $this->assertTrue($result['success']);
        $this->assertSame('150000.00', $advertiser->fresh()->wallet_balance);
        $this->assertSame('paid', $deposit->fresh()->status);
        $this->assertSame('REF-1', $deposit->fresh()->ref_id);

        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $advertiser->id,
            'type' => 'credit',
            'amount' => '100000.00',
            'source_type' => WalletDeposit::class,
            'source_id' => $deposit->id,
        ]);
    }

    public function test_confirm_deposit_does_not_credit_when_gateway_status_is_not_ok(): void
    {
        $advertiser = User::factory()->advertiser()->create(['wallet_balance' => '0.00']);
        $deposit = WalletDeposit::factory()->for($advertiser)->create([
            'amount' => '100000.00',
            'authority' => 'AUTH-2',
            'status' => 'pending',
        ]);

        $service = $this->serviceWithGateway(true);
        $result = $service->confirmDeposit('AUTH-2', 'NOK');

        $this->assertFalse($result['success']);
        $this->assertSame('0.00', $advertiser->fresh()->wallet_balance);
        $this->assertSame('failed', $deposit->fresh()->status);
    }

    public function test_confirm_deposit_does_not_credit_when_gateway_verification_fails(): void
    {
        $advertiser = User::factory()->advertiser()->create(['wallet_balance' => '0.00']);
        $deposit = WalletDeposit::factory()->for($advertiser)->create([
            'amount' => '100000.00',
            'authority' => 'AUTH-3',
            'status' => 'pending',
        ]);

        $service = $this->serviceWithGateway(false);
        $result = $service->confirmDeposit('AUTH-3', 'OK');

        $this->assertFalse($result['success']);
        $this->assertSame('0.00', $advertiser->fresh()->wallet_balance);
        $this->assertSame('failed', $deposit->fresh()->status);
    }

    public function test_confirm_deposit_is_idempotent_for_an_already_paid_deposit(): void
    {
        $advertiser = User::factory()->advertiser()->create(['wallet_balance' => '100000.00']);
        $deposit = WalletDeposit::factory()->for($advertiser)->create([
            'amount' => '100000.00',
            'authority' => 'AUTH-4',
            'status' => 'paid',
        ]);

        $service = $this->serviceWithGateway(true);
        $result = $service->confirmDeposit('AUTH-4', 'OK');

        $this->assertTrue($result['success']);
        // Balance must be unaffected by the repeat callback — no double credit.
        $this->assertSame('100000.00', $advertiser->fresh()->wallet_balance);
        $this->assertDatabaseCount('wallet_transactions', 0);
    }

    public function test_confirm_deposit_amount_is_taken_from_the_stored_deposit_not_the_client(): void
    {
        // The gateway status the client sends is untrusted input; the
        // amount credited must come only from the server-stored WalletDeposit
        // row created at requestDeposit() time, never from the callback.
        $advertiser = User::factory()->advertiser()->create(['wallet_balance' => '0.00']);
        WalletDeposit::factory()->for($advertiser)->create([
            'amount' => '250000.00',
            'authority' => 'AUTH-5',
            'status' => 'pending',
        ]);

        $service = $this->serviceWithGateway(true);
        $result = $service->confirmDeposit('AUTH-5', 'OK');

        $this->assertSame('250000.00', $result['amount']);
        $this->assertSame('250000.00', $advertiser->fresh()->wallet_balance);
    }
}
