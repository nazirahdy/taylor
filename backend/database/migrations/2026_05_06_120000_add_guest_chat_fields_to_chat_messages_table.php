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
        Schema::table('chat_messages', function (Blueprint $table) {
            if (! Schema::hasColumn('chat_messages', 'sender_name')) {
                $table->string('sender_name')->nullable()->after('sender_id');
            }
            if (! Schema::hasColumn('chat_messages', 'session_id')) {
                $table->string('session_id')->nullable()->after('message');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            if (Schema::hasColumn('chat_messages', 'session_id')) {
                $table->dropColumn('session_id');
            }
            if (Schema::hasColumn('chat_messages', 'sender_name')) {
                $table->dropColumn('sender_name');
            }
        });
    }
};
