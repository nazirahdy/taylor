<?php

namespace App\Filament\Resources\StoreClosureResource\Pages;

use App\Filament\Resources\StoreClosureResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListStoreClosures extends ListRecords
{
    protected static string $resource = StoreClosureResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
