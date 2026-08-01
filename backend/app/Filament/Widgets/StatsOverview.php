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
            Stat::make('Menunggu Konfirmasi', Order::where('status', 'pending')->count())
                ->description('Perlu tindakan segera')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning'),
            Stat::make('Sedang Dikerjakan', Order::whereIn('status', ['confirmed', 'pola_pemotongan', 'pola_penjahitan', 'proses_menjahit', 'finishing'])->count())
                ->description('Proses pengerjaan aktif')
                ->descriptionIcon('heroicon-m-wrench')
                ->color('info'),
            Stat::make('Selesai Bulan Ini', Order::where('status', 'selesai_penyerahan')->whereMonth('updated_at', $now->month)->count())
                ->description('Target produksi')
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('success'),
        ];
    }
}
