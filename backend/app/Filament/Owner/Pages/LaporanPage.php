<?php

namespace App\Filament\Owner\Pages;

use Filament\Pages\Page;

class LaporanPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-document-chart-bar';
    protected static ?string $navigationGroup = 'Laporan';
    protected static ?string $navigationLabel = 'Semua Laporan';
    protected static ?string $title = 'Portal Laporan & Analisis';
    protected static string $view = 'filament.owner.pages.laporan-page';

    public $activeTab = 'transaksi';

    public function mount(): void
    {
        $this->activeTab = request()->query('tab', 'transaksi');
    }
}
