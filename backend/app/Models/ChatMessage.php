<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ChatMessage extends Model
{
    protected $fillable = [
        'order_id',
        'sender_id',
        'sender_name',
        'message',
        'attachment_path',
        'is_read',
        'session_id',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    protected $appends = ['is_admin'];

    public function getIsAdminAttribute()
    {
        if ($this->sender) {
            return $this->sender->role === 'admin';
        }
        return strtolower($this->sender_name) === 'admin';
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public static function unreadFromCustomersCount(): int
    {
        return static::where('is_read', false)
            ->where(function ($query) {
                $query->whereNull('sender_id')
                      ->orWhereHas('sender', function ($q) {
                          $q->where('role', '!=', 'admin');
                      });
            })
            ->count();
    }

    protected static function booted()
    {
        static::created(function (ChatMessage $message) {
            if ($message->is_admin) {
                return;
            }

            $senderName = $message->sender?->name ?: ($message->sender_name ?: 'Pelanggan');

            $url = $message->order_id
                ? \App\Filament\Resources\OrderResource\Pages\ViewOrder::getUrl([$message->order_id], isAbsolute: false)
                : \App\Filament\Resources\ChatMessageResource::getUrl(isAbsolute: false);

            \App\Services\AdminNotifier::notify(
                title: 'Pesan Baru dari Pelanggan',
                body: "{$senderName}: " . Str::limit($message->message, 80),
                url: $url,
                icon: 'heroicon-o-chat-bubble-left-right',
                status: 'info',
            );
        });
    }
}