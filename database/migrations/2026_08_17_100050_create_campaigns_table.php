<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('advertiser_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('creative_path');
            $table->decimal('price_per_1000_views', 10, 2);
            $table->decimal('budget_total', 12, 2);
            $table->decimal('budget_remaining', 12, 2);
            $table->unsignedInteger('capacity_views');
            $table->unsignedInteger('views_delivered')->default(0);
            $table->enum('status', [
                'draft',
                'pending_review',
                'active',
                'paused',
                'completed',
                'cancelled',
            ])->default('draft');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
