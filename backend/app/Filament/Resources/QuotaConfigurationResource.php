<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuotaConfigurationResource\Pages;
use App\Models\QuotaConfiguration;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class QuotaConfigurationResource extends Resource
{
    protected static ?string $model = QuotaConfiguration::class;
    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $navigationIcon = 'heroicon-o-scale';
    protected static ?string $navigationLabel = 'Pengaturan Kuota';
    protected static ?string $pluralLabel = 'Pengaturan Kuota';
    protected static ?string $navigationGroup = 'Pengaturan Studio';
    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return auth()->user()->role === 'admin';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Atur Kuota Global')
                    ->description('Pilih apakah kuota diatur per minggu atau per bulan, lalu tentukan jumlah maksimal pesanan.')
                    ->schema([
                        Forms\Components\Select::make('type')
                            ->label('Jenis Kuota')
                            ->options([
                                'weekly' => 'Per Minggu',
                                'monthly' => 'Per Bulan',
                            ])
                            ->required()
                            ->reactive(),

                        Forms\Components\TextInput::make('max_orders')
                            ->label(fn (callable $get) => $get('type') === 'weekly' ? 'Max pesanan per minggu' : 'Max pesanan per bulan')
                            ->required()
                            ->numeric()
                            ->minValue(1)
                            ->helperText(fn (callable $get) => $get('type') === 'weekly'
                                ? 'Kuota bulanan akan otomatis dihitung sebagai nilai minggu x 4.'
                                : 'Jika dipilih Per Bulan, sistem hanya membatasi total pesanan dalam satu bulan.')
                            ->default(10),

                        Forms\Components\TextInput::make('monthly_quota')
                            ->label('Kuota Bulanan Terkalkulasi')
                            ->disabled()
                            ->dehydrated(false)
                            ->default(fn (callable $get) => $get('type') === 'weekly'
                                ? ($get('max_orders') ? $get('max_orders') * 4 : 0)
                                : $get('max_orders')),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('type')
                    ->label('Jenis Kuota')
                    ->formatStateUsing(fn ($state) => $state === 'weekly' ? 'Per Minggu' : 'Per Bulan'),
                Tables\Columns\TextColumn::make('max_orders')
                    ->label('Max Orders'),
                Tables\Columns\TextColumn::make('monthly_quota')
                    ->label('Kuota Bulanan')
                    ->formatStateUsing(fn ($record) => $record->monthly_quota),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Terakhir Diperbarui')
                    ->dateTime()
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Ubah'),
            ])
            ->bulkActions([]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListQuotaConfigurations::route('/'),
            'create' => Pages\CreateQuotaConfiguration::route('/create'),
            'edit' => Pages\EditQuotaConfiguration::route('/{record}/edit'),
        ];
    }
}
