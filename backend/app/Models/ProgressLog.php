<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgressLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'stage',
        'description',
        'updated_by',
        'notified_at',
    ];

    protected $casts = [
        'notified_at' => 'datetime',
    ];

    public const STAGE_LABELS = [
        'confirmed' => 'Dikonfirmasi',
        'pola_pemotongan' => 'Pola dan Pemotongan',
        'pola_penjahitan' => 'Pola Penjahitan',
        'proses_menjahit' => 'Proses Menjahit',
        'finishing' => 'Finishing',
        'selesai_penyerahan' => 'Selesai & Penyerahan',
    ];

    public function getStageLabelAttribute(): string
    {
        return self::STAGE_LABELS[$this->stage] ?? $this->stage;
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
