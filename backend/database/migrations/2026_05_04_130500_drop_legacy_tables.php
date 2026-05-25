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
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('fashion_models');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-creation logic skipped for legacy cleanup
    }
};
