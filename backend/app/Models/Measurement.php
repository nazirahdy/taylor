<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Measurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lingkar_badan',
        'lingkar_pinggang',
        'lingkar_pinggul',
        'panjang_baju',
        'panjang_lengan',
        'lebar_bahu',
        'panjang_rok',
        'tinggi_badan',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
