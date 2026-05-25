<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Carbon\Carbon;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $now = Carbon::now();
        
        return [
            Stat::make('Total Pesanan Bulan Ini', Order::whereMonth('created_at', $now->month)->count())
                ->description('Semua status')
                ->descriptionIcon('heroicon-m-shopping-cart')
                ->color('primary'),
            Stat::make('Menunggu Konfirmasi', Order::whereIn('status', ['pending', 'dp_uploaded'])->count())
                ->description('Perlu tindakan segera')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning'),
            Stat::make('Sedang Dikerjakan', Order::where('status', 'in_progress')->count())
                ->description('Proses pengerjaan aktif')
                ->descriptionIcon('heroicon-m-wrench')
                ->color('info'),
            Stat::make('Selesai Bulan Ini', Order::where('status', 'completed')->whereMonth('updated_at', $now->month)->count())
                ->description('Target produksi')
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('success'),
        ];
    }
}
