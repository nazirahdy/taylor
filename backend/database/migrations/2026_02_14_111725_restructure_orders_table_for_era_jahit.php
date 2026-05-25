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
            $table->string('order_number')->unique()->after('id');
            $table->foreignId('user_id')->nullable()->after('fashion_model_id')->constrained()->onDelete('cascade');
            $table->decimal('total_price', 12, 2)->default(0)->after('notes');
            $table->decimal('dp_paid', 12, 2)->default(0)->after('total_price');
            $table->decimal('balance_remaining', 12, 2)->default(0)->after('dp_paid');
            $table->unsignedTinyInteger('progress_percent')->default(0)->after('status');
            $table->date('estimated_finish_at')->nullable()->after('progress_percent');
            
            // Modify status to include the new workflow steps
            $table->string('status')->default('pending')->change(); 
            // WorkFlow: pending, diterima/konfirmasi, diproses, pemotongan, dijahit, finishing, selesai
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
