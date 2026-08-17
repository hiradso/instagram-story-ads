<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'advertiser', 'ambassador'])->default('advertiser')->after('email');
            $table->unsignedTinyInteger('level')->default(1)->after('role');
            $table->enum('status', ['active', 'suspended'])->default('active')->after('level');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'level', 'status']);
        });
    }
};
