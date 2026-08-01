<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HomeServiceSettingResource\Pages;
use App\Models\HomeServiceSetting;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class HomeServiceSettingResource extends Resource
{
    protected static ?string $model = HomeServiceSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';
    protected static ?string $navigationLabel = 'Kelola DP Home Service';
    protected static ?string $modelLabel = 'Pengaturan DP';
    protected static ?string $pluralModelLabel = 'Pengaturan DP';
    protected static ?string $navigationGroup = 'Manajemen Pesanan';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return auth()->user()->role === 'admin';
    }

    public static function getNavigationBadge(): ?string
    {
        $count = Order::pendingHomeServiceDpQuery()->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Uang Muka (DP) Global Home Service')
                    ->description('Tentukan nominal flat DP jaminan yang wajib dibayar oleh seluruh pelanggan saat memesan layanan Home Service.')
                    ->schema([
                        Forms\Components\TextInput::make('dp_amount')
                            ->label('Nominal DP (Rupiah)')
                            ->required()
                            ->numeric()
                            ->stripCharacters(['.', ','])
                            ->formatStateUsing(fn ($state) => $state !== null && $state !== '' ? (int) round((float) $state) : null)
                            ->prefix('Rp')
                            ->helperText('Nominal ini akan otomatis tampil di halaman checkout/tahap akhir pemesanan pelanggan untuk layanan Home Service.'),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('dp_amount')
                    ->label('Nominal DP Home Service Saat Ini')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format((float) ($state ?? 0), 0, ',', '.'))
                    ->fontFamily('mono')
                    ->size('lg')
                    ->color('primary')
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Terakhir Diperbarui')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Ubah Nominal DP')
                    ->modalWidth('md'),
            ])
            ->bulkActions([
                //
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getWidgets(): array
    {
        return [
            HomeServiceSettingResource\Widgets\VerifyHomeServiceDpWidget::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListHomeServiceSettings::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDelete(\Illuminate\Database\Eloquent\Model $record): bool
    {
        return false;
    }
}
