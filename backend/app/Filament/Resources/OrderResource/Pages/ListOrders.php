<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Components\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('Semua Pesanan')
                ->badge(fn () => \App\Models\Order::count()),
            'home_service' => Tab::make('Home Service')
                ->badge(fn () => \App\Models\Order::where('method', 'home_service')->count())
                ->modifyQueryUsing(fn (Builder $query) => $query->where('method', 'home_service')),
            'visit' => Tab::make('Booking ke Toko')
                ->badge(fn () => \App\Models\Order::where('method', 'visit')->count())
                ->modifyQueryUsing(fn (Builder $query) => $query->where('method', 'visit')),
        ];
    }
}
