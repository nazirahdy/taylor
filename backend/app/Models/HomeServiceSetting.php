<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeServiceSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'dp_amount',
    ];
}
