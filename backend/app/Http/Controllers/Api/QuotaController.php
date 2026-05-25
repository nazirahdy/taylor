<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyQuota;
use App\Models\StoreClosure;
use Illuminate\Http\Request;
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
            $isSunday = $current->isSunday();
            $isPast = $current < $today;
            $closure = $closures->first(fn (StoreClosure $closure) => $closure->containsDate($current));

            $maxOrders = $defaultMax;
            
            $remaining = $this->getWeeklyRemainingFromOrders($current, $maxOrders);
            
            $isOpen = !$isSunday && !$isPast && $globalIsOpen && $remaining > 0;

            if ($closure) {
                $isOpen = false;
            }

            $availableSlots = $isOpen ? $remaining : 0;

            $statusLabel = 'Buka';
            if ($isPast) {
                $statusLabel = 'Lampau';
            } elseif (($closure !== null) || $isSunday) {
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
                'is_closure' => ($closure !== null) || $isSunday,
                'status_label' => $statusLabel,
                'disabled' => !$isOpen,
                'quota_type' => 'weekly',
                'max_orders' => $maxOrders,
                'current_orders' => $maxOrders - $remaining,
                'available_slots' => $availableSlots,
                'is_sunday' => $isSunday,
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

        return max(0, $weeklyMaxOrders - $usedThisWeek);
    }
}
