<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeServiceSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'dp_amount',
        'max_distance_km',
        'store_latitude',
        'store_longitude',
    ];

    protected $casts = [
        'max_distance_km' => 'decimal:2',
        'store_latitude' => 'decimal:8',
        'store_longitude' => 'decimal:8',
    ];
}
