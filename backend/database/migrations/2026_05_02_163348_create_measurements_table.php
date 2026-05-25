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
        Schema::create('measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('lingkar_dada', 5, 2)->nullable();
            $table->decimal('lingkar_pinggang', 5, 2)->nullable();
            $table->decimal('lingkar_pinggul', 5, 2)->nullable();
            $table->decimal('panjang_baju', 5, 2)->nullable();
            $table->decimal('panjang_lengan', 5, 2)->nullable();
            $table->decimal('lingkar_leher', 5, 2)->nullable();
            $table->decimal('panjang_celana', 5, 2)->nullable();
            $table->decimal('lingkar_paha', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('measurements');
    }
};
