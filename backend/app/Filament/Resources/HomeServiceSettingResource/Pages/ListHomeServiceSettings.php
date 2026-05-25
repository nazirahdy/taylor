<?php

namespace App\Filament\Resources\HomeServiceSettingResource\Pages;

use App\Filament\Resources\HomeServiceSettingResource;
use Filament\Resources\Pages\ListRecords;

class ListHomeServiceSettings extends ListRecords
{
    protected static string $resource = HomeServiceSettingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // No create action needed
        ];
    }

    protected function getFooterWidgets(): array
    {
        return [
            HomeServiceSettingResource\Widgets\VerifyHomeServiceDpWidget::class,
        ];
    }
}
