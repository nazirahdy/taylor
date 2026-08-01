<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'type', // dp, final
        'amount',
        'payment_method',
        'proof_path',
        'status', // pending, verified, rejected
        'rejected_reason',
        'verified_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    protected static function booted()
    {
        $notifyIfPending = function (Payment $payment) {
            if ($payment->status !== 'pending') {
                return;
            }

            // Jangan notifikasi admin atas aksinya sendiri (mis. input DP manual di form Edit Pesanan)
            if (auth()->user()?->role === 'admin') {
                return;
            }

            $order = $payment->order()->with('user')->first();
            if (!$order) {
                return;
            }

            $typeLabel = $payment->type === 'dp' ? 'DP' : 'Pelunasan';
            $url = $order->method === 'home_service'
                ? \App\Filament\Resources\HomeServiceSettingResource::getUrl(isAbsolute: false)
                : \App\Filament\Resources\PaymentStatusResource::getUrl(isAbsolute: false);

            \App\Services\AdminNotifier::notify(
                title: "Bukti {$typeLabel} Baru",
                body: "Pesanan {$order->order_number} dari {$order->user?->name} menunggu verifikasi {$typeLabel}.",
                url: $url,
                icon: 'heroicon-o-banknotes',
                status: 'warning',
            );
        };

        static::created($notifyIfPending);

        static::updated(function (Payment $payment) use ($notifyIfPending) {
            if ($payment->wasChanged('status')) {
                $notifyIfPending($payment);
            }
        });
    }
}
