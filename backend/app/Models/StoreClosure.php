<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreClosure extends Model
{
    use HasFactory;

    protected $fillable = [
        'start_date',
        'end_date',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function containsDate($date): bool
    {
        return $this->is_active && $date->between($this->start_date, $this->end_date);
    }
}
