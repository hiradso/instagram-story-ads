<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'advertiser_id',
    'category_id',
    'title',
    'description',
    'creative_path',
    'price_per_1000_views',
    'budget_total',
    'budget_remaining',
    'capacity_views',
    'views_delivered',
    'status',
    'starts_at',
    'ends_at',
])]
class Campaign extends Model
{
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
}
