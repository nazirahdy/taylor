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
            $table->foreignId('order_id')->after('id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->after('order_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('attachment_path')->nullable()->after('message');
            $table->boolean('is_read')->default(false)->after('attachment_path');

            // Drop old columns
            $colsToDrop = [];
            if (Schema::hasColumn('chat_messages', 'sender_name')) $colsToDrop[] = 'sender_name';
            if (Schema::hasColumn('chat_messages', 'user_id')) {
                // Drop foreign if exists
                try { $table->dropForeign(['user_id']); } catch (\Exception $e) {}
                $colsToDrop[] = 'user_id';
            }
            if (Schema::hasColumn('chat_messages', 'is_admin')) $colsToDrop[] = 'is_admin';
            if (Schema::hasColumn('chat_messages', 'session_id')) $colsToDrop[] = 'session_id';

            if (!empty($colsToDrop)) {
                $table->dropColumn($colsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
