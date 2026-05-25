<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_service_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('dp_amount')->default(150000);
            $table->timestamps();
        });

        // Insert default setting
        DB::table('home_service_settings')->insert([
            'id' => 1,
            'dp_amount' => 150000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('home_service_settings');
    }
};
