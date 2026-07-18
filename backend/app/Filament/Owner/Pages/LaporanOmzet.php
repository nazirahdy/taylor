<?php

namespace App\Filament\Owner\Pages;

use App\Models\Order;
use App\Models\Payment;
use Filament\Pages\Page;

class LaporanOmzet extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-document-chart-bar';
    protected static ?string $navigationGroup = 'Laporan';
    protected static ?string $navigationLabel = 'Laporan Omzet';
    protected static ?string $title = 'Laporan Omzet';

    protected static string $view = 'filament.pages.laporan-omzet';

    public static function canAccess(): bool
    {
        return auth('owner')->user()?->role === 'owner';
    }

    public function getViewData(): array
    {
        $startDate = request()->input('start_date');
        $endDate = request()->input('end_date');
        $jenisLaporan = request()->input('jenis_laporan', 'pesanan');
        $status = request()->input('status', 'semua');

        $query = Order::query()->with(['user', 'payments']);

        if ($startDate) {
            $query->where('order_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('order_date', '<=', $endDate);
        }

        if ($jenisLaporan === 'pesanan') {
            if ($status && $status !== 'semua') {
                $query->where('status', $status);
            }
        } elseif ($jenisLaporan === 'pelunasan') {
            if ($status === 'lunas') {
                $query->whereRaw('estimated_price > 0 AND (select coalesce(sum(amount), 0) from payments where order_id = orders.id) >= estimated_price');
            } elseif ($status === 'belum_lunas') {
                $query->whereRaw('(select coalesce(sum(amount), 0) from payments where order_id = orders.id) < estimated_price');
            }
        }

        $orders = $query->get();

        // Calculate general statistics for header & stats block based on period
        $totalOmzetQuery = Order::whereIn('status', ['completed', 'finished', 'paid']);
        if ($startDate) {
            $totalOmzetQuery->where('order_date', '>=', $startDate);
        }
        if ($endDate) {
            $totalOmzetQuery->where('order_date', '<=', $endDate);
        }
        $totalOmzet = $totalOmzetQuery->sum('estimated_price');

        $transactionsQuery = Order::query();
        if ($startDate) {
            $transactionsQuery->where('order_date', '>=', $startDate);
        }
        if ($endDate) {
            $transactionsQuery->where('order_date', '<=', $endDate);
        }
        $transactionsCount = $transactionsQuery->count();

        $dpPaymentsQuery = Payment::where('type', 'dp')->with(['order.user']);
        if ($startDate) {
            $dpPaymentsQuery->where('created_at', '>=', $startDate . ' 00:00:00');
        }
        if ($endDate) {
            $dpPaymentsQuery->where('created_at', '<=', $endDate . ' 23:59:59');
        }
        $dpPayments = $dpPaymentsQuery->get();
        $dpTotal = $dpPayments->sum('amount');

        $finalPaymentsQuery = Payment::where('type', 'final')->with(['order.user']);
        if ($startDate) {
            $finalPaymentsQuery->where('created_at', '>=', $startDate . ' 00:00:00');
        }
        if ($endDate) {
            $finalPaymentsQuery->where('created_at', '<=', $endDate . ' 23:59:59');
        }
        $finalPayments = $finalPaymentsQuery->get();
        $finalTotal = $finalPayments->sum('amount');

        return [
            'orders' => $orders,
            'totalOmzet' => $totalOmzet,
            'transactionsCount' => $transactionsCount,
            'dpPayments' => $dpPayments,
            'dpTotal' => $dpTotal,
            'finalPayments' => $finalPayments,
            'finalTotal' => $finalTotal,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'jenisLaporan' => $jenisLaporan,
            'status' => $status,
        ];
    }
}
