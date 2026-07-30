<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category',
        'description',
        'image_path',
        'additional_images',
        'images',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'sort_order' => 'integer',
        'additional_images' => 'array',
        'images' => 'array',
    ];

    protected static function booted()
    {
        static::saving(function ($gallery) {
            if (is_array($gallery->images) && count($gallery->images) > 0) {
                $gallery->image_path = $gallery->images[0];
            } elseif (empty($gallery->image_path)) {
                $gallery->image_path = ''; // fallback if images is empty but image_path is required
            }
        });
    }
}
