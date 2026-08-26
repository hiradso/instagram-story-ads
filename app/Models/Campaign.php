<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

// budget_remaining/capacity_views/views_delivered/status are deliberately
// NOT fillable — they're derived/business-logic values, only ever set by
// trusted server code (CampaignController, ViewSubmissionService) via
// forceFill, never taken directly from a request.
#[Fillable([
    'advertiser_id',
    'category_id',
    'title',
    'description',
    'creative_path',
    'price_per_1000_views',
    'budget_total',
    'assignment_mode',
    'starts_at',
    'ends_at',
])]
class Campaign extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price_per_1000_views' => 'decimal:2',
            'budget_total' => 'decimal:2',
            'budget_remaining' => 'decimal:2',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function advertiser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'advertiser_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function provinces(): BelongsToMany
    {
        return $this->belongsToMany(Province::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(CampaignAssignment::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * Views reserved by assignments that have not yet been approved or
     * rejected. Kept separate from views_delivered, which only reflects
     * approved view submissions.
     */
    public function reservedViews(): int
    {
        return (int) $this->assignments()
            ->whereIn('status', ['assigned', 'posted', 'submitted'])
            ->join('ambassador_profiles', 'ambassador_profiles.user_id', '=', 'campaign_assignments.ambassador_id')
            ->sum('ambassador_profiles.avg_views_7d');
    }
}
