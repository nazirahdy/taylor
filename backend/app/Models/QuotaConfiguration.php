<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotaConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'max_orders',
    ];

    protected $casts = [
        'type' => 'string',
        'max_orders' => 'integer',
    ];

    public function getMonthlyQuotaAttribute(): int
    {
        return $this->type === 'weekly'
            ? $this->max_orders * 4
            : $this->max_orders;
    }

    public function getWeeklyQuotaAttribute(): int
    {
        return $this->type === 'weekly'
            ? $this->max_orders
            : (int) floor($this->max_orders / 4);
    }
}
