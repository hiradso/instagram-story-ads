<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('view_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_assignment_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('screenshot_path');
            $table->string('image_hash', 64)->index();
            $table->unsignedInteger('claimed_views');
            $table->unsignedInteger('approved_views')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('view_submissions');
    }
};
