<?php

namespace App\Filament\Owner\Resources;

use App\Filament\Owner\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    
    protected static ?string $navigationLabel = 'User';
    protected static ?string $modelLabel = 'User';
    protected static ?string $pluralModelLabel = 'Daftar User';
    protected static ?string $navigationGroup = 'Manajemen Pengguna';
    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return auth('owner')->user()?->role === 'owner';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Pelanggan')
                    ->schema([
                        Forms\Components\TextInput::make('name')->required(),
                        Forms\Components\TextInput::make('email')->email()->required(),
                        Forms\Components\TextInput::make('phone_wa')
                            ->label('WhatsApp')
                            ->required()
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('role')->required(),
                        Forms\Components\Textarea::make('alamat')->label('Alamat Lengkap')->columnSpanFull(),
                    ])->columns(2),

                Forms\Components\Section::make('Data Ukuran Badan')
                    ->description('Ukuran badan pelanggan yang dikelola oleh admin penjahit.')
                    ->schema([
                        Forms\Components\Placeholder::make('lingkar_badan')->label('Lingkar Badan')
                            ->content(fn (User $record) => ($record->measurement?->lingkar_badan ?? '-') . ' cm'),
                        Forms\Components\Placeholder::make('lingkar_pinggang')->label('Lingkar Pinggang')
                            ->content(fn (User $record) => ($record->measurement?->lingkar_pinggang ?? '-') . ' cm'),
                        Forms\Components\Placeholder::make('lingkar_pinggul')->label('Lingkar Pinggul')
                            ->content(fn (User $record) => ($record->measurement?->lingkar_pinggul ?? '-') . ' cm'),
                        Forms\Components\Placeholder::make('panjang_baju')->label('Panjang Baju')
                            ->content(fn (User $record) => ($record->measurement?->panjang_baju ?? '-') . ' cm'),
                        Forms\Components\Placeholder::make('panjang_lengan')->label('Panjang Lengan')
                            ->content(fn (User $record) => ($record->measurement?->panjang_lengan ?? '-') . ' cm'),
                        Forms\Components\Placeholder::make('lebar_bahu')->label('Lebar Bahu')
                            ->content(fn (User $record) => ($record->measurement?->lebar_bahu ?? '-') . ' cm'),
                        Forms\Components\Placeholder::make('panjang_rok')->label('Panjang Rok / Celana')
                            ->content(fn (User $record) => ($record->measurement?->panjang_rok ?? '-') . ' cm'),
                        Forms\Components\Placeholder::make('tinggi_badan')->label('Tinggi Badan')
                            ->content(fn (User $record) => ($record->measurement?->tinggi_badan ?? '-') . ' cm'),
                        Forms\Components\Placeholder::make('notes')->label('Catatan Penjahit')
                            ->content(fn (User $record) => $record->measurement?->notes ?? '-')
                            ->columnSpanFull(),
                    ])->columns(4),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('phone_wa')
                    ->label('WhatsApp')
                    ->searchable(),
                Tables\Columns\TextColumn::make('role')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'admin' => 'danger',
                        'customer' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->options([
                        'admin' => 'Admin',
                        'customer' => 'Pelanggan',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageUsers::route('/'),
        ];
    }
    
    public static function canCreate(): bool
    {
        return false;
    }
}
