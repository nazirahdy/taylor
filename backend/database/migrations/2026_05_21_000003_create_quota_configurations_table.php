<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quota_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('weekly');
            $table->integer('max_orders')->default(10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quota_configurations');
    }
};
