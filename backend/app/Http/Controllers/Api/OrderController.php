<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Http\Requests\UploadDPRequest;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\DailyQuota;
use App\Models\StoreClosure;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class OrderController extends Controller
{
    protected $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    /**
     * Get all orders for authenticated user
     */
    public function index()
    {
        $user = Auth::user();
        
        $orders = Order::with([
            'user',
            'measurement',
            'progressLogs' => fn($q) => $q->orderBy('created_at', 'desc'),
            'chatMessages'
        ])->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Get detail order
     */
    public function show($id)
    {
        $user = Auth::user();
        $order = Order::with([
            'user',
            'measurement',
            'progressLogs' => fn($q) => $q->orderBy('created_at', 'desc'),
            'chatMessages'
        ])->findOrFail($id);

        // Check authorization
        if ($user->id !== $order->user_id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pesanan ini'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Create new order
     */
    public function store(OrderRequest $request)
    {
        $user = Auth::user();

        // Check active orders limit
        $activeOrdersCount = Order::where('user_id', $user->id)
            ->whereNotIn('status', ['completed', 'cancelled', 'rejected'])
            ->count();

        if ($activeOrdersCount >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'Anda memiliki terlalu banyak pesanan aktif (Maksimal 3). Harap selesaikan pesanan sebelumnya.'
            ], 422);
        }

        // Check daily quota and weekly/monthly store closure rules
        $requiredDate = Carbon::createFromFormat('Y-m-d', $request->quota_date);
        $closure = StoreClosure::where('is_active', true)
            ->where('start_date', '<=', $requiredDate)
            ->where('end_date', '>=', $requiredDate)
            ->first();

        if ($closure || $requiredDate->isSunday()) {
            return response()->json([
                'success' => false,
                'message' => 'Maaf, tanggal pemesanan ini tidak tersedia karena toko tutup.'
            ], 422);
        }

        $config = \App\Models\DailyQuota::first();
        $maxOrders = $config ? $config->max_orders : 5;
        $globalIsOpen = $config ? $config->is_open : true;

        $remaining = $this->getWeeklyRemainingFromOrders($requiredDate, $maxOrders);

        if (!$globalIsOpen || $remaining <= 0) {
            return response()->json([
                'success' => false,
                'message' => $remaining <= 0
                    ? 'Kuota minggu ini sudah penuh. Silakan coba lagi pada minggu depan.'
                    : 'Maaf, pendaftaran pesanan sedang ditutup sementara oleh admin.'
            ], 422);
        }

        // Update user address if provided in order form
        if ($request->filled('alamat')) {
            $user->update(['alamat' => $request->input('alamat')]);
        }

        // Get or create measurement
        $measurementId = $user->measurement?->id;

        // Upload design image if provided
        $designImagePath = null;
        if ($request->hasFile('design_image')) {
            $designImagePath = $request->file('design_image')->store('designs', 'public');
        } elseif ($request->filled('gallery_image_path')) {
            $designImagePath = $request->input('gallery_image_path');
        }

        $dpAmount = 0;
        $dpProofPath = null;
        $status = 'pending';

        if ($request->method === 'home_service') {
            $setting = \App\Models\HomeServiceSetting::first();
            $dpAmount = $setting ? $setting->dp_amount : 150000;
            
            if ($request->hasFile('dp_proof')) {
                $dpProofPath = $request->file('dp_proof')->store('dp_proofs', 'public');
                $status = 'dp_uploaded';
            }
        }

        // Create order with secure tracking number
        $order = Order::create([
            'order_number' => Order::generateUniqueOrderNumber(),
            'user_id' => $user->id,
            'measurement_id' => $measurementId,
            'order_date' => now()->toDateString(),
            'quota_date' => $request->quota_date,
            'method' => $request->method,
            'design_notes' => $request->design_notes,
            'design_image_path' => $designImagePath,
            'status' => $status,
            'estimated_price' => 0, // Admin will review and update this before confirmation
            'dp_amount' => $dpAmount,
            'dp_proof' => $dpProofPath,
        ]);

        if ($status === 'dp_uploaded' && $dpProofPath !== null) {
            $order->payments()->create([
                'type' => 'dp',
                'amount' => $dpAmount,
                'payment_method' => 'transfer',
                'proof_path' => $dpProofPath,
                'status' => 'pending',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat.',
            'data' => $order
        ], 201);
    }

    protected function getWeeklyRemainingFromOrders(Carbon $date, int $weeklyMaxOrders): int
    {
        $weekStart = $date->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $weekEnd = $date->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        $usedThisWeek = Order::whereBetween('quota_date', [$weekStart, $weekEnd])
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->count();

        return max(0, $weeklyMaxOrders - $usedThisWeek);
    }

    /**
     * Upload DP proof (Home Service only)
     */
    public function uploadDp(UploadDPRequest $request, $id)
    {
        $user = Auth::user();
        $order = Order::findOrFail($id);

        // Check authorization and eligibility
        if ($user->id !== $order->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pesanan ini'
            ], 403);
        }

        if ($order->method !== 'home_service') {
            return response()->json([
                'success' => false,
                'message' => 'Upload DP hanya untuk metode Home Service'
            ], 422);
        }

        if (!in_array($order->status, ['pending', 'dp_uploaded'])) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat menerima upload DP di status ini'
            ], 422);
        }

        // Delete old file if exists
        if ($order->dp_proof_path) {
            Storage::disk('public')->delete($order->dp_proof_path);
        }

        $proofFile = $request->file('dp_proof') ?? $request->file('bukti_dp');

        // Store new file in public disk
        $path = $proofFile->store('dp-proofs', 'public');

        // Update order
        $order->update([
            'dp_proof_path' => $path,
            'dp_amount' => $request->dp_amount,
            'status' => 'dp_uploaded',
        ]);

        $dp = $order->payments()->where('type', 'dp')->first();
        if ($dp) {
            $dp->update([
                'amount' => $request->dp_amount,
                'proof_path' => $path,
                'status' => 'pending',
                'verified_at' => null,
            ]);
        } else {
            $order->payments()->create([
                'type' => 'dp',
                'amount' => $request->dp_amount,
                'payment_method' => 'transfer',
                'proof_path' => $path,
                'status' => 'pending',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Bukti DP berhasil diunggah.',
            'data' => $order
        ]);
    }

    /**
     * Track order progress (public or authenticated)
     */
    public function track($id)
    {
        $user = Auth::user();
        $order = Order::with([
            'user',
            'measurement',
            'progressLogs' => fn($q) => $q->orderBy('created_at', 'desc')
        ])->findOrFail($id);

        // Check authorization
        if ($user && $user->id !== $order->user_id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pesanan ini'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Admin: Confirm order (after DP approved)
     */
    public function confirm(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat mengkonfirmasi pesanan'
            ], 403);
        }

        $order = Order::findOrFail($id);

        if (!in_array($order->status, ['pending', 'dp_uploaded'])) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dikonfirmasi di status ini'
            ], 422);
        }

        if ($order->estimated_price <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Estimasi harga harus diatur sebelum pesanan dapat dikonfirmasi.'
            ], 422);
        }

        if ($order->method === 'home_service' && !$order->dp_proof_path) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan Home Service membutuhkan bukti DP sebelum konfirmasi.'
            ], 422);
        }

        $order->update([
            'status' => 'confirmed',
            'dp_verified_at' => $order->dp_proof_path ? ($order->dp_verified_at ?: now()) : $order->dp_verified_at,
        ]);

        // Send WhatsApp notification
        $this->whatsAppService->notifyOrderConfirmed($order);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dikonfirmasi',
            'data' => $order
        ]);
    }

    /**
     * Admin: Reject order
     */
    public function reject(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat menolak pesanan'
            ], 403);
        }

        $request->validate([
            'reason' => 'required|string|min:5'
        ], [
            'reason.required' => 'Alasan penolakan wajib diisi',
            'reason.min' => 'Alasan minimal 5 karakter',
        ]);

        $order = Order::findOrFail($id);

        if (!in_array($order->status, ['pending', 'dp_uploaded'])) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat ditolak di status ini'
            ], 422);
        }

        $order->update([
            'status' => 'rejected',
            'rejected_reason' => $request->reason,
        ]);

        // Decrement quota
        $quota = DailyQuota::where('date', $order->quota_date)->first();
        if ($quota && $quota->current_orders > 0) {
            $quota->decrement('current_orders');
        }

        // Send WhatsApp notification
        $this->whatsAppService->notifyOrderRejected($order, $request->reason);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil ditolak',
            'data' => $order
        ]);
    }

    /**
     * Admin: Cancel order
     */
    public function cancel(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin' && $user->id !== Order::find($id)->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk membatalkan pesanan ini'
            ], 403);
        }

        $order = Order::findOrFail($id);

        if (!in_array($order->status, ['pending', 'dp_uploaded', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dibatalkan di status ini'
            ], 422);
        }

        $order->update(['status' => 'cancelled']);

        // Decrement quota
        $quota = DailyQuota::where('date', $order->quota_date)->first();
        if ($quota && $quota->current_orders > 0) {
            $quota->decrement('current_orders');
        }

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan',
            'data' => $order
        ]);
    }
}

