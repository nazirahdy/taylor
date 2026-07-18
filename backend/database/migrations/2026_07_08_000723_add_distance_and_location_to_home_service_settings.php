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
        Schema::table('home_service_settings', function (Blueprint $table) {
            $table->decimal('max_distance_km', 8, 2)->default(15.00)->after('dp_amount');
            $table->decimal('store_latitude', 10, 8)->nullable()->after('max_distance_km');
            $table->decimal('store_longitude', 11, 8)->nullable()->after('store_latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('home_service_settings', function (Blueprint $table) {
            $table->dropColumn(['max_distance_km', 'store_latitude', 'store_longitude']);
        });
    }
};
