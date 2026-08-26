<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            // 'auto' keeps the existing scheduled matching engine; 'manual'
            // means the advertiser browses the ambassador directory and
            // negotiates directly instead — see CampaignMatchingService and
            // AllocateCampaigns, which now skip 'manual' campaigns entirely.
            $table->enum('assignment_mode', ['auto', 'manual'])->default('auto')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn('assignment_mode');
        });
    }
};
