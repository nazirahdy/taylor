<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProgressLog;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    protected $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    /**
     * Get progress logs for a specific order.
     */
    public function index($orderId)
    {
        $user = Auth::user();
        $order = Order::findOrFail($orderId);

        // Check authorization
        if ($user->id !== $order->user_id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pesanan ini'
            ], 403);
        }

        $logs = ProgressLog::where('order_id', $orderId)
            ->with('updater:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    /**
     * Admin: Add a progress update to an order.
     */
    public function store(Request $request, $orderId)
    {
        $user = Auth::user();

        // Admin only
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat update progres pesanan'
            ], 403);
        }

        $request->validate([
            'stage' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ], [
            'stage.required' => 'Nama tahap wajib diisi',
            'description.max' => 'Deskripsi maksimal 1000 karakter',
        ]);

        $order = Order::with('user')->findOrFail($orderId);

        // Ensure order is in valid status for progress update
        if (!in_array($order->status, ['confirmed', 'in_progress'])) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan harus dikonfirmasi terlebih dahulu sebelum progres dapat dicatat.'
            ], 422);
        }

        if ($order->status === 'confirmed') {
            $order->update(['status' => 'in_progress']);
        }

        $log = ProgressLog::create([
            'order_id' => $orderId,
            'stage' => $request->stage,
            'description' => $request->description,
            'updated_by' => $user->id,
        ]);

        // Send WhatsApp notification
        $this->whatsAppService->notifyProgressUpdate($log);
        
        $log->update(['notified_at' => now()]);

        $log->load('updater:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Progres pesanan berhasil diupdate',
            'data' => $log
        ], 201);
    }

    /**
     * Admin: Mark order as completed
     */
    public function complete(Request $request, $orderId)
    {
        $user = Auth::user();

        // Admin only
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat menyelesaikan pesanan'
            ], 403);
        }

        $order = Order::with('user')->findOrFail($orderId);

        if ($order->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan sudah ditandai selesai'
            ], 422);
        }

        $order->update(['status' => 'completed']);

        // Send completion notification
        $this->whatsAppService->notifyOrderCompleted($order);

        // Create final progress log
        $log = ProgressLog::create([
            'order_id' => $orderId,
            'stage' => 'Siap Diambil',
            'description' => 'Pesanan selesai dan siap untuk diambil',
            'updated_by' => $user->id,
            'notified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil ditandai selesai',
            'data' => $order
        ]);
    }
}
