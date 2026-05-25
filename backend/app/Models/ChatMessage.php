<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}