<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\ChatMessage;
use App\Models\Order;

class AdminChatBoard extends Component
{
    public $orderId;
    public $sessionId;
    public $newMessage = '';
    public $editingMessageId = null;
    public $editingMessageText = '';

    public function mount($orderId = null, $sessionId = null)
    {
        $this->orderId = $orderId;
        $this->sessionId = $sessionId;
        $this->markAsRead();
    }

    public function getCustomerNameProperty(): string
    {
        // Try to get the customer name from the first non-admin message
        $firstCustomerMsg = ChatMessage::query()
            ->when($this->orderId, fn ($q) => $q->where('order_id', $this->orderId))
            ->when(!$this->orderId && $this->sessionId, fn ($q) => $q->where('session_id', $this->sessionId))
            ->where(function ($q) {
                $q->whereHas('sender', fn ($sq) => $sq->where('role', '!=', 'admin'))
                  ->orWhereNull('sender_id');
            })
            ->with('sender')
            ->first();

        if ($firstCustomerMsg?->sender) {
            return $firstCustomerMsg->sender->name;
        }
        if ($firstCustomerMsg?->sender_name && strtolower($firstCustomerMsg->sender_name) !== 'admin') {
            return $firstCustomerMsg->sender_name;
        }

        // Try to get from order
        if ($this->orderId) {
            $order = Order::with('user')->find($this->orderId);
            if ($order?->user) return $order->user->name;
        }

        return 'Pelanggan';
    }

    public function getMessagesProperty()
    {
        return ChatMessage::query()
            ->when($this->orderId, fn ($q) => $q->where('order_id', $this->orderId))
            ->when(!$this->orderId && $this->sessionId, fn ($q) => $q->where('session_id', $this->sessionId))
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function markAsRead()
    {
        ChatMessage::query()
            ->when($this->orderId, fn ($q) => $q->where('order_id', $this->orderId))
            ->when(!$this->orderId && $this->sessionId, fn ($q) => $q->where('session_id', $this->sessionId))
            ->where('is_read', false)
            ->get()
            ->filter(fn ($msg) => !$msg->is_admin)
            ->each(fn ($msg) => $msg->update(['is_read' => true]));
    }

    public function sendMessage()
    {
        if (trim($this->newMessage) === '') return;

        ChatMessage::create([
            'order_id' => $this->orderId,
            'session_id' => $this->sessionId,
            'sender_id' => auth()->id(),
            'sender_name' => auth()->user()?->name ?: 'Admin',
            'message' => $this->newMessage,
            'is_read' => false,
        ]);

        $this->newMessage = '';
    }

    public function startEdit($id, $text)
    {
        $this->editingMessageId = $id;
        $this->editingMessageText = $text;
    }

    public function cancelEdit()
    {
        $this->editingMessageId = null;
        $this->editingMessageText = '';
    }

    public function saveEdit()
    {
        if ($this->editingMessageId && trim($this->editingMessageText) !== '') {
            $msg = ChatMessage::find($this->editingMessageId);
            if ($msg) {
                $msg->update(['message' => $this->editingMessageText]);
            }
            $this->cancelEdit();
        }
    }

    public function deleteMessage($id)
    {
        $msg = ChatMessage::find($id);
        if ($msg) {
            $msg->delete();
        }
    }

    public function render()
    {
        return view('livewire.admin-chat-board');
    }
}
