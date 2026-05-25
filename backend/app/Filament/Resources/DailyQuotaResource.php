<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DailyQuotaResource\Pages;
use App\Models\DailyQuota;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class DailyQuotaResource extends Resource
{
    protected static ?string $model = DailyQuota::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationLabel = 'Kuota';
    protected static ?string $pluralLabel = 'Kuota';
    protected static ?string $navigationGroup = 'Pengaturan Studio';
    protected static ?int $navigationSort = 2;

    public static function canCreate(): bool
    {
        return \App\Models\DailyQuota::count() === 0;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Pengaturan Kuota Mingguan')
                    ->description('Tentukan batas pesanan maksimal yang diperbolehkan dalam satu minggu (Senin - Minggu).')
                    ->schema([
                        Forms\Components\Hidden::make('type')
                            ->default('weekly'),
                        Forms\Components\TextInput::make('max_orders')
                            ->label('Batas Pesanan per Minggu')
                            ->required()
                            ->numeric()
                            ->default(5)
                            ->helperText('Jika total 5 pesanan tercapai dalam satu minggu, sistem akan otomatis menutup pemesanan untuk sisa hari di minggu tersebut.'),
                        Forms\Components\Toggle::make('is_open')
                            ->label('Status Pemesanan Dibuka')
                            ->default(true)
                            ->required(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('max_orders')
                    ->label('Batas Pesanan per Minggu'),
                Tables\Columns\IconColumn::make('is_open')
                    ->label('Status')
                    ->boolean(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Terakhir Diupdate')
                    ->dateTime(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDailyQuotas::route('/'),
            'create' => Pages\CreateDailyQuota::route('/create'),
            'edit' => Pages\EditDailyQuota::route('/{record}/edit'),
        ];
    }
}
