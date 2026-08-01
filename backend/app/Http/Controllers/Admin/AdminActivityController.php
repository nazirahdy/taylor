<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class AdminActivityController extends Controller
{
    public function count(): JsonResponse
    {
        abort_unless(auth()->user()?->role === 'admin', 403);

        $count = ChatMessage::unreadFromCustomersCount()
            + Order::where('status', 'pending')->count();

        return response()->json(['count' => $count]);
    }
}
