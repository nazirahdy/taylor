<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatMessageRequest;
use App\Models\ChatMessage;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Get all messages for a specific order.
     */
    public function index($orderId)
    {
        $user = Auth::user();
        $order = Order::findOrFail($orderId);

        // Only allow owner or admin to see messages
        if ($user->id !== $order->user_id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke chat ini'
            ], 403);
        }

        $messages = ChatMessage::with('sender:id,name,role')
            ->where('order_id', $orderId)
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark messages as read for the current user
        ChatMessage::where('order_id', $orderId)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Send a message in an order's chat.
     */
    public function store(ChatMessageRequest $request, $orderId)
    {
        $user = Auth::user();
        $order = Order::findOrFail($orderId);

        // Check authorization
        if ($user->id !== $order->user_id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke chat ini'
            ], 403);
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('chat_attachments', 'public');
        }

        $chatMessage = ChatMessage::create([
            'order_id' => $orderId,
            'sender_id' => $user->id,
            'message' => $request->message,
            'attachment_path' => $attachmentPath,
            'is_read' => false,
        ]);

        $chatMessage->load('sender:id,name,role');

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dikirim',
            'data' => $chatMessage
        ], 201);
    }

    public function guestIndex(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);

        $messages = ChatMessage::with('sender')
            ->where('session_id', $request->session_id)
            ->orderBy('created_at', 'asc')
            ->get();

        if ($request->query('mark_read') === 'true') {
            $messages->filter(fn($msg) => $msg->is_admin && !$msg->is_read)
                     ->each(fn($msg) => $msg->update(['is_read' => true]));
        }

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    public function guestStore(Request $request)
    {
        $data = $request->validate([
            'sender_name' => 'nullable|string|max:255',
            'message' => 'required|string|min:1|max:1000',
            'session_id' => 'required|string',
        ]);

        $user = Auth::guard('sanctum')->user();

        $chatMessage = ChatMessage::create([
            'sender_id' => $user?->id,
            'sender_name' => $data['sender_name'] ?? ($user?->name ?? 'Pelanggan'),
            'message' => $data['message'],
            'session_id' => $data['session_id'],
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dikirim',
            'data' => $chatMessage
        ], 201);
    }
}
