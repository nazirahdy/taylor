<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotaLock extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quota_date',
        'expires_at',
    ];

    protected $casts = [
        'quota_date' => 'date',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
