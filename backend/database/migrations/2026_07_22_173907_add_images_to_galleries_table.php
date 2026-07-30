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
        Schema::table('galleries', function (Blueprint $table) {
            $table->json('images')->nullable()->after('image_path');
        });

        // Migrate existing data
        $galleries = DB::table('galleries')->get();
        foreach ($galleries as $gallery) {
            $images = [];
            if ($gallery->image_path) {
                $images[] = $gallery->image_path;
            }
            if ($gallery->additional_images) {
                $additional = json_decode($gallery->additional_images, true);
                if (is_array($additional)) {
                    $images = array_merge($images, $additional);
                }
            }
            DB::table('galleries')->where('id', $gallery->id)->update([
                'images' => json_encode($images)
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            $table->dropColumn('images');
        });
    }
};
