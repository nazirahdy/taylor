<?php

namespace App\Filament\Resources\DailyQuotaResource\Pages;

use App\Filament\Resources\DailyQuotaResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDailyQuotas extends ListRecords
{
    protected static string $resource = DailyQuotaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
