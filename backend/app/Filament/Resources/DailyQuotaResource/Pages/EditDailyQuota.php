<?php

namespace App\Filament\Resources\DailyQuotaResource\Pages;

use App\Filament\Resources\DailyQuotaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDailyQuota extends EditRecord
{
    protected static string $resource = DailyQuotaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
