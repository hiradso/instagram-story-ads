<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ambassador_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', [
                'assigned',
                'posted',
                'submitted',
                'approved',
                'rejected',
                'expired',
            ])->default('assigned');
            $table->timestamp('assigned_at');
            $table->timestamp('post_deadline_at');
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();

            $table->unique(['campaign_id', 'ambassador_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_assignments');
    }
};
