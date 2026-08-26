<?php

namespace Tests\Feature\Services;

use App\Models\AmbassadorProfile;
use App\Models\User;
use App\Notifications\ReferralBonusNotification;
use App\Services\ReferralService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ReferralServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReferralService $service;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
        $this->service = new ReferralService;
    }

    public function test_it_pays_an_ambassador_referrer_into_their_profile_wallet(): void
    {
        $referrer = User::factory()->ambassador()->create();
        AmbassadorProfile::factory()->create(['user_id' => $referrer->id, 'wallet_balance' => '10000.00']);

        $referred = User::factory()->ambassador()->create(['referred_by_id' => $referrer->id]);

        $this->service->rewardIfEligible($referred, 'first milestone');

        $this->assertSame('60000.00', AmbassadorProfile::where('user_id', $referrer->id)->first()->wallet_balance);
        $this->assertNotNull($referred->fresh()->referral_bonus_paid_at);
        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $referrer->id,
            'type' => 'credit',
            'amount' => '50000.00',
            'source_type' => 'referral',
            'source_id' => $referred->id,
        ]);
        Notification::assertSentTo($referrer, ReferralBonusNotification::class);
    }

    public function test_it_pays_an_advertiser_referrer_into_their_user_wallet(): void
    {
        $referrer = User::factory()->advertiser()->create(['wallet_balance' => '0.00']);
        $referred = User::factory()->advertiser()->create(['referred_by_id' => $referrer->id]);

        $this->service->rewardIfEligible($referred, 'first campaign active');

        $this->assertSame('50000.00', $referrer->fresh()->wallet_balance);
    }

    public function test_it_never_pays_twice_for_the_same_referred_user(): void
    {
        $referrer = User::factory()->advertiser()->create(['wallet_balance' => '0.00']);
        $referred = User::factory()->advertiser()->create(['referred_by_id' => $referrer->id]);

        $this->service->rewardIfEligible($referred, 'first event');
        $this->service->rewardIfEligible($referred->fresh(), 'second event');

        $this->assertSame('50000.00', $referrer->fresh()->wallet_balance);
        $this->assertDatabaseCount('wallet_transactions', 1);
    }

    public function test_it_does_nothing_when_the_user_has_no_referrer(): void
    {
        $referred = User::factory()->advertiser()->create(['referred_by_id' => null]);

        $this->service->rewardIfEligible($referred, 'first event');

        $this->assertDatabaseCount('wallet_transactions', 0);
        $this->assertNull($referred->fresh()->referral_bonus_paid_at);
    }

    public function test_it_does_nothing_when_the_referrer_no_longer_exists(): void
    {
        $referrer = User::factory()->advertiser()->create();
        $referred = User::factory()->advertiser()->create(['referred_by_id' => $referrer->id]);
        $referrer->delete();

        $this->service->rewardIfEligible($referred->fresh(), 'first event');

        $this->assertDatabaseCount('wallet_transactions', 0);
        $this->assertNull($referred->fresh()->referral_bonus_paid_at);
    }
}
