<?php

namespace App\Filament\Owner\Widgets;

use App\Models\Order;
use App\Models\Payment;
use Carbon\Carbon;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class OwnerStatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $now = Carbon::now();

        $omzetBulanIni = Payment::whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->sum('amount');

        $pesananBulanIni = Order::whereMonth('order_date', $now->month)
            ->whereYear('order_date', $now->year)
            ->count();

        $pesananLunas = Order::whereRaw('estimated_price > 0 AND (select coalesce(sum(amount), 0) from payments where order_id = orders.id) >= estimated_price')
            ->count();

        $pesananBelumLunas = Order::whereRaw('(select coalesce(sum(amount), 0) from payments where order_id = orders.id) < estimated_price')
            ->count();

        return [
            Stat::make('Omzet Bulan Ini', 'Rp ' . number_format((float) $omzetBulanIni, 0, ',', '.'))
                ->description('Total pembayaran masuk')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),
            Stat::make('Pesanan Bulan Ini', $pesananBulanIni)
                ->description('Pesanan baru bulan ini')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('primary'),
            Stat::make('Pesanan Lunas', $pesananLunas)
                ->description('Sudah dibayar penuh')
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('success'),
            Stat::make('Pesanan Belum Lunas', $pesananBelumLunas)
                ->description('Masih ada tagihan')
                ->descriptionIcon('heroicon-m-exclamation-circle')
                ->color('warning'),
        ];
    }
}
