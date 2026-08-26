<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'campaign_assignment_id',
    'screenshot_path',
    'image_hash',
    'claimed_views',
    'approved_views',
    'status',
    'reviewed_by',
    'reviewed_at',
    'rejection_reason',
])]
class ViewSubmission extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function campaignAssignment(): BelongsTo
    {
        return $this->belongsTo(CampaignAssignment::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
