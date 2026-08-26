<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'user_id',
    'category_id',
    'province_id',
    'city_id',
    'instagram_username',
    'instagram_url',
    'bio',
    'follower_count',
    'avg_views_7d',
    'reach',
    'impressions',
    'engagement_rate',
    'resume_path',
    'wallet_balance',
    'verified_at',
])]
class AmbassadorProfile extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'follower_count' => 'integer',
            'avg_views_7d' => 'integer',
            'reach' => 'integer',
            'impressions' => 'integer',
            'wallet_balance' => 'decimal:2',
            'engagement_rate' => 'decimal:2',
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    // Cities this ambassador has previously run ads for — shown to
    // advertisers browsing the directory, separate from `city` (where
    // they're based).
    public function advertisedCities(): BelongsToMany
    {
        return $this->belongsToMany(City::class, 'ambassador_profile_city');
    }
}
