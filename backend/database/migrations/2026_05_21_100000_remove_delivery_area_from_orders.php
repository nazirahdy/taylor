<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop foreign key and column from orders table
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'delivery_area_id')) {
                try {
                    $table->dropForeign(['delivery_area_id']);
                } catch (\Exception $e) {
                    // Constraint may not exist, ignore
                }
                $table->dropColumn('delivery_area_id');
            }
        });

        // Drop the delivery_areas table
        Schema::dropIfExists('delivery_areas');
    }

    public function down(): void
    {
        Schema::create('delivery_areas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('delivery_area_id')->nullable()->constrained('delivery_areas')->nullOnDelete();
        });
    }
};
