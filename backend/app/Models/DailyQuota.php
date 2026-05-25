<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyQuota extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'type',
        'max_orders',
        'current_orders',
        'is_open',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'type' => 'string',
        'is_open' => 'boolean',
    ];
}
