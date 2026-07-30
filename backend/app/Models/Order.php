<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'measurement_id',
        'order_date',
        'quota_date',
        'method',
        'visit_address',
        'latitude',
        'longitude',
        'design_notes',
        'design_image_path',
        'estimated_price',
        'rejected_reason',
        'status',
        'financial_breakdown',
    ];

    protected $casts = [
        'order_date' => 'date',
        'quota_date' => 'date',
        'estimated_price' => 'decimal:2',
        'financial_breakdown' => 'array',
    ];

    // Eager-load payments relationship by default to optimize performance and accessor retrieval
    protected $with = ['payments'];

    // Append virtual attributes to JSON output for frontend backward-compatibility
    protected $appends = [
        'dp_amount',
        'dp_proof_path',
        'dp_verified_at',
        'final_payment_amount',
        'final_payment_proof_path',
        'final_payment_verified_at',
        'is_fully_paid',
        'payment_status',
        'payment_status_label',
    ];

    protected static function booted()
    {
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateUniqueOrderNumber();
            }
        });

        static::created(function (Order $order) {
            // Notifikasi otomatis ke Admin
            app(\App\Services\WhatsAppService::class)->notifyAdminNewOrder($order->load('user'));
        });

        static::updated(function (Order $order) {
            if ($order->wasChanged('status')) {
                $status = $order->status;
                $whatsAppService = app(\App\Services\WhatsAppService::class);
                $order->load('user');

                if (!$order->user || !$order->user->phone_wa) return;
                
                switch ($status) {
                    case 'confirmed': $whatsAppService->notifyOrderConfirmed($order); break;
                    case 'selesai_penyerahan': $whatsAppService->notifyOrderCompleted($order); break;
                    case 'rejected': $whatsAppService->notifyOrderRejected($order, $order->rejected_reason ?? 'Ketidaksesuaian detail'); break;
                    case 'proses_menjahit': $whatsAppService->notifyOrderInProgress($order); break;
                }
            }
        });
    }

    public static function generateUniqueOrderNumber(): string
    {
        do {
            $number = 'EJ-' . strtoupper(Str::random(8));
        } while (self::where('order_number', $number)->exists());

        return $number;
    }

    /* RELATIONSHIPS */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function measurement()
    {
        return $this->belongsTo(Measurement::class);
    }

    public function progressLogs()
    {
        return $this->hasMany(ProgressLog::class);
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /* VIRTUAL ACCESSORS for backward compatibility */

    public function getDpAmountAttribute()
    {
        return (float) $this->payments->where('type', 'dp')->sum('amount');
    }

    public function getDpProofPathAttribute()
    {
        return $this->payments->where('type', 'dp')->first()?->proof_path
            ?? $this->attributes['dp_proof_path'] ?? $this->attributes['dp_proof'] ?? null;
    }

    public function getDpVerifiedAtAttribute()
    {
        return $this->payments->where('type', 'dp')->first()?->verified_at
            ?? $this->attributes['dp_verified_at'] ?? null;
    }

    public function getFinalPaymentAmountAttribute()
    {
        return (float) $this->payments->where('type', 'final')->sum('amount');
    }

    public function getFinalPaymentProofPathAttribute()
    {
        return $this->payments->where('type', 'final')->first()?->proof_path
            ?? $this->attributes['final_payment_proof_path'] ?? null;
    }

    public function getFinalPaymentVerifiedAtAttribute()
    {
        return $this->payments->where('type', 'final')->first()?->verified_at
            ?? $this->attributes['final_payment_verified_at'] ?? null;
    }

    public function getIsFullyPaidAttribute()
    {
        if ($this->estimated_price <= 0) return false;
        
        $totalPaid = $this->dp_amount + $this->final_payment_amount;
        return $totalPaid >= (float) $this->estimated_price;
    }

    /**
     * Otomatis menentukan status pelunasan berdasarkan pembayaran yang ada.
     */
    public function getPaymentStatusAttribute(): string
    {
        $dpPaid = (float) $this->payments->where('type', 'dp')->sum('amount');
        $finalPaid = (float) $this->payments->where('type', 'final')->sum('amount');
        $totalPaid = $dpPaid + $finalPaid;
        $price = (float) $this->estimated_price;
        
        // Jika sudah ada harga estimasi, cek apakah total bayar sudah memenuhi
        if ($price > 0) {
            if ($totalPaid >= $price && $totalPaid > 0) {
                return 'lunas';
            }
            if ($finalPaid > 0) {
                return 'belum_lunas';
            }
            if ($dpPaid > 0 || $this->dp_proof_path) {
                return 'dp_diunggah';
            }
        } else {
            // Jika harga belum diset tapi sudah ada pembayaran akhir
            if ($finalPaid > 0) {
                return 'belum_lunas';
            }
            if ($dpPaid > 0 || $this->dp_proof_path) {
                return 'dp_diunggah';
            }
        }

        return 'belum_ada';
    }

    public function getPaymentStatusLabelAttribute(): string
    {
        return match($this->payment_status) {
            'belum_ada'   => 'Belum Ada Pembayaran',
            'dp_diunggah' => 'DP Diunggah',
            'belum_lunas' => 'Belum Lunas (Ada Sisa)',
            'lunas'       => 'Lunas ✅',
            default       => '-',
        };
    }
}

