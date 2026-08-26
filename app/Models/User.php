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

#[Fillable([
    'name', 'email', 'phone', 'password', 'role', 'level', 'status', 'wallet_balance',
    'referral_code', 'referred_by_id', 'referral_bonus_paid_at',
])]
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
