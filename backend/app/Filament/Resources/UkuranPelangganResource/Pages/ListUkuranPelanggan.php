<?php

namespace App\Filament\Resources\UkuranPelangganResource\Pages;

use App\Filament\Resources\UkuranPelangganResource;
use Filament\Resources\Pages\ListRecords;

class ListUkuranPelanggan extends ListRecords
{
    protected static string $resource = UkuranPelangganResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    public function getTitle(): string
    {
        return 'Manajemen Ukuran Badan Pelanggan';
    }
}
