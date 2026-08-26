<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('advertiser_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ambassador_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['open', 'agreed', 'declined'])->default('open');
            // The advertiser's ad-brief / business-verification attachment,
            // uploaded once when the conversation is started.
            $table->string('brief_file_path')->nullable();
            $table->timestamps();

            // One conversation per campaign+ambassador pair — reopening a
            // declined conversation isn't supported, matching how the auto
            // engine also never reassigns a rejected/expired ambassador to
            // the same campaign.
            $table->unique(['campaign_id', 'ambassador_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
