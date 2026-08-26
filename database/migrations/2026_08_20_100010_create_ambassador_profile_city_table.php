<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Cities the ambassador has already run ads for — distinct from
// ambassador_profiles.city_id (where they're based), which stays a single
// value. This is a free multi-select of past-campaign cities shown to
// advertisers browsing the directory.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ambassador_profile_city', function (Blueprint $table) {
            $table->foreignId('ambassador_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->primary(['ambassador_profile_id', 'city_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ambassador_profile_city');
    }
};
