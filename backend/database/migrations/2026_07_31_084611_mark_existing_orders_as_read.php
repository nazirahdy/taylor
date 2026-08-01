<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Pesanan yang sudah ada sebelum fitur badge "belum dibaca" ditambahkan
     * bukan aktivitas baru, jadi ditandai sudah dibaca supaya badge "Semua
     * Pesanan" hanya muncul untuk pesanan yang benar-benar baru masuk.
     */
    public function up(): void
    {
        DB::table('orders')->update(['is_read' => true]);
    }

    public function down(): void
    {
        //
    }
};
