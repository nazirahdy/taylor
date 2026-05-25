<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'admin'])->default('customer')->after('password');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('measurement_id')->nullable()->after('user_id')->constrained()->onDelete('set null');
            $table->enum('method', ['home_service', 'visit'])->default('visit')->after('notes');
            $table->date('quota_date')->nullable()->after('method'); // FK to daily_quotas ideally, but date is enough
            $table->string('dp_proof_path')->nullable()->after('quota_date');
            $table->timestamp('dp_verified_at')->nullable()->after('dp_proof_path');
            
            // Drop old columns if they exist
            if (Schema::hasColumn('orders', 'measurements')) {
                $table->dropColumn('measurements');
            }
            if (Schema::hasColumn('orders', 'progress_percent')) {
                $table->dropColumn('progress_percent');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['measurement_id']);
            $table->dropColumn(['measurement_id', 'method', 'quota_date', 'dp_proof_path', 'dp_verified_at']);
            // Add back the removed columns if we rollback
            $table->json('measurements')->nullable();
            $table->unsignedTinyInteger('progress_percent')->default(0);
        });
    }
};
