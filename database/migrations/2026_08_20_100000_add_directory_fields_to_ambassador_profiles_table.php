<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ambassador_profiles', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('instagram_url');
            $table->unsignedInteger('reach')->nullable()->after('avg_views_7d');
            $table->unsignedInteger('impressions')->nullable()->after('reach');
            $table->decimal('engagement_rate', 5, 2)->nullable()->after('impressions');
            $table->string('resume_path')->nullable()->after('engagement_rate');
        });
    }

    public function down(): void
    {
        Schema::table('ambassador_profiles', function (Blueprint $table) {
            $table->dropColumn(['bio', 'reach', 'impressions', 'engagement_rate', 'resume_path']);
        });
    }
};
