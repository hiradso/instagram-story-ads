<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code')->unique()->nullable()->after('id');
            $table->foreignId('referred_by_id')->nullable()->after('referral_code')->constrained('users')->nullOnDelete();
            // Set once the referral bonus has actually been paid out, so a
            // referred user can only ever trigger one payout to their
            // referrer — not once per qualifying action they take.
            $table->timestamp('referral_bonus_paid_at')->nullable()->after('referred_by_id');
        });

        // The model's `creating` hook only generates a code for users made
        // from here on — backfill everyone who already existed so nobody's
        // referral link is permanently broken.
        DB::table('users')->whereNull('referral_code')->orderBy('id')->pluck('id')->each(function (int $id) {
            do {
                $code = strtoupper(Str::random(8));
            } while (DB::table('users')->where('referral_code', $code)->exists());

            DB::table('users')->where('id', $id)->update(['referral_code' => $code]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('referred_by_id');
            $table->dropColumn(['referral_code', 'referral_bonus_paid_at']);
        });
    }
};
