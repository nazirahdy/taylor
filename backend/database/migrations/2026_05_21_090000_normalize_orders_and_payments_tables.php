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
        // 1. Alter Payments table to match normalized structure
        Schema::table('payments', function (Blueprint $table) {
            // Drop proof_image if exists, replace with proof_path
            if (Schema::hasColumn('payments', 'proof_image')) {
                $table->dropColumn('proof_image');
            }
            if (!Schema::hasColumn('payments', 'proof_path')) {
                $table->string('proof_path')->nullable()->after('payment_method');
            }

            // Add type (dp, final)
            if (!Schema::hasColumn('payments', 'type')) {
                $table->string('type')->default('dp')->after('order_id');
            }

            // Add verified_at
            if (!Schema::hasColumn('payments', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('status');
            }

            // Add rejected_reason
            if (!Schema::hasColumn('payments', 'rejected_reason')) {
                $table->string('rejected_reason')->nullable()->after('verified_at');
            }
        });

        // Change status default to pending (using try-catch block for Doctrine DBAL or direct raw query safety)
        try {
            Schema::table('payments', function (Blueprint $table) {
                $table->string('status')->default('pending')->change();
            });
        } catch (\Exception $e) {
            // In case database driver change() has constraints or Doctrine is not present, use raw query
            try {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE payments ALTER COLUMN status SET DEFAULT 'pending'");
            } catch (\Exception $ex) {
                // Ignore if not supported by current database driver
            }
        }

        // 2. Drop payment columns from Orders table
        Schema::table('orders', function (Blueprint $table) {
            $colsToDrop = [];
            if (Schema::hasColumn('orders', 'dp_amount')) $colsToDrop[] = 'dp_amount';
            if (Schema::hasColumn('orders', 'dp_proof')) $colsToDrop[] = 'dp_proof';
            if (Schema::hasColumn('orders', 'dp_proof_path')) $colsToDrop[] = 'dp_proof_path';
            if (Schema::hasColumn('orders', 'dp_verified_at')) $colsToDrop[] = 'dp_verified_at';
            if (Schema::hasColumn('orders', 'final_payment_amount')) $colsToDrop[] = 'final_payment_amount';
            if (Schema::hasColumn('orders', 'final_payment_proof_path')) $colsToDrop[] = 'final_payment_proof_path';
            if (Schema::hasColumn('orders', 'final_payment_verified_at')) $colsToDrop[] = 'final_payment_verified_at';
            if (Schema::hasColumn('orders', 'is_fully_paid')) $colsToDrop[] = 'is_fully_paid';

            if (!empty($colsToDrop)) {
                $table->dropColumn($colsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add columns to orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('dp_amount', 12, 2)->nullable();
            $table->string('dp_proof_path')->nullable();
            $table->timestamp('dp_verified_at')->nullable();
            $table->decimal('final_payment_amount', 12, 2)->nullable();
            $table->string('final_payment_proof_path')->nullable();
            $table->timestamp('final_payment_verified_at')->nullable();
            $table->boolean('is_fully_paid')->default(false);
        });

        // Revert payments table
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'proof_path')) {
                $table->dropColumn('proof_path');
            }
            if (!Schema::hasColumn('payments', 'proof_image')) {
                $table->string('proof_image')->nullable();
            }
            if (Schema::hasColumn('payments', 'type')) {
                $table->dropColumn('type');
            }
            if (Schema::hasColumn('payments', 'verified_at')) {
                $table->dropColumn('verified_at');
            }
            if (Schema::hasColumn('payments', 'rejected_reason')) {
                $table->dropColumn('rejected_reason');
            }
        });
    }
};
