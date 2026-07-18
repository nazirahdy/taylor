<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyQuota;
use App\Models\StoreClosure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class QuotaController extends Controller
{
    /**
     * Get quota availability for the next 14 days or specified month/year
     */
    public function index(Request $request)
    {
        $month = $request->query('month');
        $year = $request->query('year');
        $today = Carbon::today();

        if ($month && $year) {
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();
        } else {
            $startDate = Carbon::today()->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();
        }

        $config = \App\Models\DailyQuota::first();
        $defaultMax = $config ? $config->max_orders : 5;
        $globalIsOpen = $config ? $config->is_open : true;

        $closures = StoreClosure::where('is_active', true)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($query) use ($startDate, $endDate) {
                        $query->where('start_date', '<=', $startDate)
                              ->where('end_date', '>=', $endDate);
                    });
            })
            ->get();

        $dates = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $dateStr = $current->format('Y-m-d');
            $isWeekend = $current->isWeekend();
            $isPast = $current < $today;
            $closure = $closures->first(fn (StoreClosure $closure) => $closure->containsDate($current));

            $maxOrders = $defaultMax;
            
            $remaining = $this->getWeeklyRemainingFromOrders($current, $maxOrders);
            
            $isOpen = !$isWeekend && !$isPast && $globalIsOpen && $remaining > 0;

            if ($closure) {
                $isOpen = false;
            }

            $availableSlots = $isOpen ? $remaining : 0;

            $statusLabel = 'Buka';
            if ($isPast) {
                $statusLabel = 'Lampau';
            } elseif (($closure !== null) || $isWeekend) {
                $statusLabel = 'Tutup';
            } elseif ($remaining <= 0) {
                $statusLabel = 'Kuota Minggu Penuh';
            }

            $dates[] = [
                'date' => $dateStr,
                'day' => $current->translatedFormat('l'),
                'day_short' => $current->format('D'),
                'num' => (int) $current->format('d'),
                'date_num' => (int) $current->format('d'),
                'is_open' => $isOpen,
                'is_closed' => !$isOpen,
                'is_past' => $isPast,
                'is_closure' => ($closure !== null) || $isWeekend,
                'status_label' => $statusLabel,
                'disabled' => !$isOpen,
                'quota_type' => 'weekly',
                'max_orders' => $maxOrders,
                'current_orders' => $maxOrders - $remaining,
                'available_slots' => $availableSlots,
                'is_weekend' => $isWeekend,
                'remaining' => $remaining,
                'closure' => $closure ? [
                    'start_date' => $closure->start_date->format('Y-m-d'),
                    'end_date' => $closure->end_date->format('Y-m-d'),
                    'notes' => $closure->notes,
                ] : null,
            ];

            $current->addDay();
        }

        return response()->json([
            'success' => true,
            'data' => $dates,
        ]);
    }

    protected function getWeeklyRemainingFromOrders(Carbon $date, int $weeklyMaxOrders): int
    {
        $weekStart = $date->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $weekEnd = $date->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        $usedThisWeek = \App\Models\Order::whereBetween('quota_date', [$weekStart, $weekEnd])
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->count();

        // Calculate locks
        $lockedThisWeek = \App\Models\QuotaLock::whereBetween('quota_date', [$weekStart, $weekEnd])
            ->where('expires_at', '>', now());

        if (Auth::check()) {
            $lockedThisWeek->where('user_id', '!=', Auth::id());
        }

        $lockedCount = $lockedThisWeek->count();

        return max(0, $weeklyMaxOrders - ($usedThisWeek + $lockedCount));
    }

    /**
     * Lock a quota slot temporarily for the authenticated user
     */
    public function lock(Request $request)
    {
        $request->validate([
            'quota_date' => 'required|date',
        ]);

        $user = Auth::user();

        // Clean up expired locks for this user to avoid clutter
        \App\Models\QuotaLock::where('user_id', $user->id)->where('expires_at', '<', now())->delete();

        // Check if there is already an active lock for this user
        $lock = \App\Models\QuotaLock::where('user_id', $user->id)->first();
        if ($lock) {
            $lock->update([
                'quota_date' => $request->quota_date,
                'expires_at' => now()->addMinutes(10),
            ]);
        } else {
            \App\Models\QuotaLock::create([
                'user_id' => $user->id,
                'quota_date' => $request->quota_date,
                'expires_at' => now()->addMinutes(10),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dikunci sementara.',
        ]);
    }
}
