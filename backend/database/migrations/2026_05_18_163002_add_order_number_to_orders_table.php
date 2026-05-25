<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop unique index if it exists
        try {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropUnique('orders_order_number_unique');
            });
        } catch (\Exception $e) {
            // Ignore if index doesn't exist
        }

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'order_number')) {
                $table->string('order_number')->after('id')->nullable();
            }
        });

        // Generate order numbers for any existing orders to avoid unique constraint violations
        $orders = DB::table('orders')->whereNull('order_number')->get();
        foreach ($orders as $order) {
            $exists = true;
            $number = '';
            while ($exists) {
                $number = 'EJ-' . strtoupper(Str::random(8));
                $exists = DB::table('orders')->where('order_number', $number)->exists();
            }
            DB::table('orders')->where('id', $order->id)->update(['order_number' => $number]);
        }

        // Change it to non-nullable now that we populated it and add unique constraint
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number')->unique()->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'order_number')) {
                $table->dropColumn('order_number');
            }
        });
    }
};
