<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

// role/level/status/wallet_balance/referred_by_id/referral_bonus_paid_at/
// referral_code are deliberately NOT fillable — they're only ever set by
// trusted server logic (via forceFill or direct attribute assignment),
// never from a raw request array, so a future `User::create($request->all())`
// or `$user->update($request->all())` can't let a client set its own role
// or wallet balance.
#[Fillable(['name', 'email', 'phone', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if ($user->referral_code) {
                return;
            }

            // Retry on the rare collision instead of trusting an 8-char
            // random code to never repeat.
            do {
                $code = strtoupper(Str::random(8));
            } while (static::where('referral_code', $code)->exists());

            $user->referral_code = $code;
        });
    }

    public function ambassadorProfile(): HasOne
    {
        return $this->hasOne(AmbassadorProfile::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by_id');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'advertiser_id');
    }

    public function campaignAssignments(): HasMany
    {
        return $this->hasMany(CampaignAssignment::class, 'ambassador_id');
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function withdrawalRequests(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class);
    }

    public function advertiserConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'advertiser_id');
    }

    public function ambassadorConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'ambassador_id');
    }

    public function walletDeposits(): HasMany
    {
        return $this->hasMany(WalletDeposit::class);
    }

    public function activeAssignmentsCount(): int
    {
        return $this->campaignAssignments()
            ->whereIn('status', ['assigned', 'posted', 'submitted'])
            ->count();
    }

    /**
     * A 1-3 tier used purely for how fancy the dashboard theme looks —
     * ambassadors already have a real `level` column (promoted by
     * UserLevelService on approved view submissions); advertisers have
     * no such column, so their tier is derived here from lifetime
     * campaign budget instead. Not an accessor/append on purpose: it
     * runs a query for advertisers, and this model gets serialized in
     * places (admin user lists, search results) where that per-row cost
     * would add up. Call it only where the tier is actually displayed.
     */
    public function panelTier(): int
    {
        if ($this->role === 'ambassador') {
            return min(3, max(1, $this->level));
        }

        if ($this->role === 'advertiser') {
            $totalBudget = (float) $this->campaigns()->sum('budget_total');

            return match (true) {
                $totalBudget >= 10_000_000 => 3,
                $totalBudget >= 3_000_000 => 2,
                default => 1,
            };
        }

        return 1;
    }

    public function routeNotificationForSms(): ?string
    {
        return $this->phone;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'wallet_balance' => 'decimal:2',
            'referral_bonus_paid_at' => 'datetime',
        ];
    }
}
