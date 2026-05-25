<?php

namespace App\Filament\Resources;

use App\Filament\Resources\StoreClosureResource\Pages;
use App\Models\StoreClosure;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class StoreClosureResource extends Resource
{
    protected static ?string $model = StoreClosure::class;
    protected static ?string $navigationIcon = 'heroicon-o-lock-closed';
    protected static ?string $navigationLabel = 'Tutup Toko';
    protected static ?string $pluralModelLabel = 'Tutup Toko';
    protected static ?string $navigationGroup = 'Pengaturan Studio';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Periode Tutup Toko')
                ->schema([
                    Forms\Components\DatePicker::make('start_date')
                        ->label('Mulai Tutup')
                        ->required(),
                    Forms\Components\DatePicker::make('end_date')
                        ->label('Selesai Tutup')
                        ->required(),
                    Forms\Components\TextInput::make('notes')
                        ->label('Catatan')
                        ->maxLength(255),
                    Forms\Components\Toggle::make('is_active')
                        ->label('Aktifkan Tutup Toko')
                        ->default(true),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('start_date')
                    ->label('Mulai')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('end_date')
                    ->label('Selesai')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('notes')
                    ->label('Catatan')
                    ->wrap(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListStoreClosures::route('/'),
            'create' => Pages\CreateStoreClosure::route('/create'),
            'edit' => Pages\EditStoreClosure::route('/{record}/edit'),
        ];
    }
}
