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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('final_payment_amount', 12, 2)->nullable()->after('dp_verified_at');
            $table->string('final_payment_proof_path')->nullable()->after('final_payment_amount');
            $table->timestamp('final_payment_verified_at')->nullable()->after('final_payment_proof_path');
            $table->boolean('is_fully_paid')->default(false)->after('final_payment_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'final_payment_amount',
                'final_payment_proof_path',
                'final_payment_verified_at',
                'is_fully_paid'
            ]);
        });
    }
};
