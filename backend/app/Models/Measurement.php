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
        'lingkar_pangkal_lengan',
        'panjang_tangan',
        'panjang_baju',
        'panjang_rok',
        'lebar_dada',
        'lebar_punggung',
        'lebar_bahu',
        'tinggi_badan',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
