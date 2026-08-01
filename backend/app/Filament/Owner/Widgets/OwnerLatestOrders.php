<?php

namespace App\Filament\Owner\Widgets;

use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class OwnerLatestOrders extends BaseWidget
{
    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 2;

    protected static ?string $heading = 'Pesanan Terbaru';

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::query()->with('user'))
            ->defaultPaginationPageOption(5)
            ->defaultSort('order_date', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->label('No. Pesanan'),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Pelanggan')
                    ->default('-'),
                Tables\Columns\TextColumn::make('estimated_price')
                    ->label('Estimasi Harga')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format((float) ($state ?? 0), 0, ',', '.')),
                Tables\Columns\TextColumn::make('payment_status_label')
                    ->label('Status Pelunasan')
                    ->badge()
                    ->color(fn (Order $record) => match ($record->payment_status) {
                        'lunas' => 'success',
                        'belum_lunas' => 'info',
                        'dp_diunggah' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('order_date')
                    ->label('Tanggal Pesanan')
                    ->date('d M Y'),
            ]);
    }
}
