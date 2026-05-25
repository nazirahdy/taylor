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
        // 1. Users Table Alignment
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'whatsapp')) {
                $table->renameColumn('whatsapp', 'phone_wa');
            }
            // Remove columns not in TRD v2.0 (Google Login & Alamat)
            $colsToDrop = [];
            if (Schema::hasColumn('users', 'google_id')) $colsToDrop[] = 'google_id';
            if (Schema::hasColumn('users', 'avatar')) $colsToDrop[] = 'avatar';
            if (Schema::hasColumn('users', 'alamat')) $colsToDrop[] = 'alamat';
            
            if (!empty($colsToDrop)) {
                $table->dropColumn($colsToDrop);
            }
        });

        // 2. Measurements Table Alignment
        Schema::table('measurements', function (Blueprint $table) {
            // Rename lingkar_dada to lingkar_badan
            if (Schema::hasColumn('measurements', 'lingkar_dada')) {
                $table->renameColumn('lingkar_dada', 'lingkar_badan');
            }
            // Add new columns
            if (!Schema::hasColumn('measurements', 'lebar_bahu')) {
                $table->decimal('lebar_bahu', 5, 2)->nullable()->after('panjang_lengan');
            }
            if (!Schema::hasColumn('measurements', 'panjang_rok')) {
                $table->decimal('panjang_rok', 5, 2)->nullable()->after('lebar_bahu');
            }
            if (!Schema::hasColumn('measurements', 'tinggi_badan')) {
                $table->decimal('tinggi_badan', 5, 2)->nullable()->after('panjang_rok');
            }
            
            // Remove columns not in TRD
            $colsToDrop = [];
            if (Schema::hasColumn('measurements', 'lingkar_leher')) $colsToDrop[] = 'lingkar_leher';
            if (Schema::hasColumn('measurements', 'panjang_celana')) $colsToDrop[] = 'panjang_celana';
            if (Schema::hasColumn('measurements', 'lingkar_paha')) $colsToDrop[] = 'lingkar_paha';
            
            if (!empty($colsToDrop)) {
                $table->dropColumn($colsToDrop);
            }
        });

        // 3. Daily Quotas Table Alignment
        Schema::table('daily_quotas', function (Blueprint $table) {
            if (!Schema::hasColumn('daily_quotas', 'notes')) {
                $table->string('notes')->nullable()->after('is_open');
            }
        });

        // 4. Orders Table Alignment (Major Change)
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key first
            if (Schema::hasColumn('orders', 'fashion_model_id')) {
                $table->dropForeign(['fashion_model_id']);
            }

            // Rename columns
            if (Schema::hasColumn('orders', 'notes')) {
                $table->renameColumn('notes', 'design_notes');
            }
            if (Schema::hasColumn('orders', 'total_price')) {
                $table->renameColumn('total_price', 'estimated_price');
            }
            if (Schema::hasColumn('orders', 'rejection_reason')) {
                $table->renameColumn('rejection_reason', 'rejected_reason');
            }

            // Add new columns
            if (!Schema::hasColumn('orders', 'order_date')) {
                $table->date('order_date')->after('measurement_id')->useCurrent();
            }
            if (!Schema::hasColumn('orders', 'design_image_path')) {
                $table->string('design_image_path')->nullable()->after('design_notes');
            }

            // Remove columns not in TRD v2.0
            $colsToDrop = [];
            if (Schema::hasColumn('orders', 'fashion_model_id')) $colsToDrop[] = 'fashion_model_id';
            if (Schema::hasColumn('orders', 'customer_name')) $colsToDrop[] = 'customer_name';
            if (Schema::hasColumn('orders', 'customer_email')) $colsToDrop[] = 'customer_email';
            if (Schema::hasColumn('orders', 'whatsapp_number')) $colsToDrop[] = 'whatsapp_number';
            if (Schema::hasColumn('orders', 'dp_paid')) $colsToDrop[] = 'dp_paid';
            if (Schema::hasColumn('orders', 'balance_remaining')) $colsToDrop[] = 'balance_remaining';
            if (Schema::hasColumn('orders', 'estimated_finish_at')) $colsToDrop[] = 'estimated_finish_at';
            
            if (Schema::hasColumn('orders', 'tracking_id')) {
                // Drop unique index first for SQLite compatibility
                $table->dropUnique(['tracking_id']);
                $colsToDrop[] = 'tracking_id';
            }
            
            if (!empty($colsToDrop)) {
                $table->dropColumn($colsToDrop);
            }
        });

        // 5. Progress Logs Table Alignment
        Schema::table('progress_logs', function (Blueprint $table) {
            if (Schema::hasColumn('progress_logs', 'user_id')) {
                // Drop foreign key if exists
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {}
                $table->renameColumn('user_id', 'updated_by');
            }
            if (!Schema::hasColumn('progress_logs', 'notified_at')) {
                $table->timestamp('notified_at')->nullable()->after('description');
            }
        });

        // 6. Galleries Table Alignment (Was testimonials or fashion_models?)
        // TRD says "galleries". Let's check if we have it.
        if (!Schema::hasTable('galleries')) {
            Schema::create('galleries', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('image_path');
                $table->boolean('is_published')->default(true);
                $table->integer('sort_order')->nullable()->default(0);
                $table->timestamps();
            });
        } else {
            Schema::table('galleries', function (Blueprint $table) {
                if (!Schema::hasColumn('galleries', 'sort_order')) {
                    $table->integer('sort_order')->nullable()->default(0);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse renaming and adding/dropping
        // (Skipping detailed down for brevity unless requested, 
        // as sync migrations are often one-way during overhaul)
    }
};
