<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('measurements', function (Blueprint $table) {
            if (!Schema::hasColumn('measurements', 'lingkar_pangkal_lengan')) {
                $table->decimal('lingkar_pangkal_lengan', 5, 2)->nullable()->after('lingkar_pinggul');
            }
            if (!Schema::hasColumn('measurements', 'panjang_tangan')) {
                $table->decimal('panjang_tangan', 5, 2)->nullable()->after('lingkar_pangkal_lengan');
            }
            if (!Schema::hasColumn('measurements', 'lebar_dada')) {
                $table->decimal('lebar_dada', 5, 2)->nullable()->after('panjang_rok');
            }
            if (!Schema::hasColumn('measurements', 'lebar_punggung')) {
                $table->decimal('lebar_punggung', 5, 2)->nullable()->after('lebar_dada');
            }
        });

        // Copy existing data from panjang_lengan to panjang_tangan if panjang_tangan is null
        if (Schema::hasColumn('measurements', 'panjang_lengan') && Schema::hasColumn('measurements', 'panjang_tangan')) {
            DB::statement("UPDATE measurements SET panjang_tangan = panjang_lengan WHERE panjang_tangan IS NULL AND panjang_lengan IS NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('measurements', function (Blueprint $table) {
            $colsToDrop = [];
            if (Schema::hasColumn('measurements', 'lingkar_pangkal_lengan')) $colsToDrop[] = 'lingkar_pangkal_lengan';
            if (Schema::hasColumn('measurements', 'panjang_tangan')) $colsToDrop[] = 'panjang_tangan';
            if (Schema::hasColumn('measurements', 'lebar_dada')) $colsToDrop[] = 'lebar_dada';
            if (Schema::hasColumn('measurements', 'lebar_punggung')) $colsToDrop[] = 'lebar_punggung';

            if (!empty($colsToDrop)) {
                $table->dropColumn($colsToDrop);
            }
        });
    }
};
