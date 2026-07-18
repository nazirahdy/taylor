<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UkuranPelangganResource\Pages;
use App\Models\Measurement;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class UkuranPelangganResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-scissors';
    protected static ?string $navigationLabel = 'Ukuran Badan';
    protected static ?string $modelLabel = 'Ukuran Pelanggan';
    protected static ?string $pluralModelLabel = 'Ukuran Badan Pelanggan';
    protected static ?string $navigationGroup = 'Manajemen Pengguna';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return auth()->user()->role === 'admin';
    }
    protected static ?string $slug = 'ukuran-pelanggan';

    /**
     * Hanya tampilkan pelanggan (bukan admin)
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->where('role', 'customer')
            ->with('measurement');
    }

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Pelanggan')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('phone_wa')
                    ->label('WhatsApp')
                    ->searchable()
                    ->icon('heroicon-m-phone'),

                Tables\Columns\TextColumn::make('measurement.tinggi_badan')
                    ->label('Tinggi (cm)')
                    ->default('—')
                    ->badge()
                    ->color(fn ($state) => $state !== '—' ? 'success' : 'gray'),

                Tables\Columns\TextColumn::make('measurement.lingkar_badan')
                    ->label('L. Badan (cm)')
                    ->default('—')
                    ->badge()
                    ->color(fn ($state) => $state !== '—' ? 'success' : 'gray'),

                Tables\Columns\TextColumn::make('measurement.lingkar_pinggang')
                    ->label('L. Pinggang (cm)')
                    ->default('—')
                    ->badge()
                    ->color(fn ($state) => $state !== '—' ? 'success' : 'gray'),

                Tables\Columns\TextColumn::make('measurement.lingkar_pinggul')
                    ->label('L. Pinggul (cm)')
                    ->default('—')
                    ->badge()
                    ->color(fn ($state) => $state !== '—' ? 'success' : 'gray'),

                Tables\Columns\IconColumn::make('status_ukuran')
                    ->label('Status')
                    ->getStateUsing(fn (User $record): bool => (bool) $record->measurement)
                    ->icon(fn (bool $state): string => $state ? 'heroicon-o-check-circle' : 'heroicon-o-x-circle')
                    ->color(fn (bool $state): string => $state ? 'success' : 'danger')
                    ->tooltip(fn (bool $state): string => $state ? 'Data ukuran sudah lengkap' : 'Belum ada data ukuran')
                    ->sortable(false),
            ])
            ->defaultSort('name')
            ->filters([])
            ->actions([
                Tables\Actions\Action::make('input_ukuran')
                    ->label('Input / Edit Ukuran')
                    ->icon('heroicon-o-pencil-square')
                    ->color('warning')
                    ->modalHeading(fn (User $record) => '✏️ Ukuran Badan — ' . $record->name)
                    ->modalDescription('Masukkan atau perbarui data ukuran badan pelanggan. Data ini akan langsung tersinkron dan terlihat di halaman profil pelanggan.')
                    ->modalWidth('5xl')
                    ->fillForm(function (User $record): array {
                        $m = $record->measurement;
                        return [
                            'lingkar_badan'    => $m?->lingkar_badan,
                            'lingkar_pinggang' => $m?->lingkar_pinggang,
                            'lingkar_pinggul'  => $m?->lingkar_pinggul,
                            'panjang_baju'     => $m?->panjang_baju,
                            'panjang_lengan'   => $m?->panjang_lengan,
                            'lebar_bahu'       => $m?->lebar_bahu,
                            'panjang_rok'      => $m?->panjang_rok,
                            'tinggi_badan'     => $m?->tinggi_badan,
                            'notes'            => $m?->notes,
                        ];
                    })
                    ->form([
                        Forms\Components\Section::make('📏 Data Ukuran Tubuh')
                            ->description('Semua satuan dalam Centimeter (CM). Kosongkan jika belum diukur.')
                            ->schema([
                                Forms\Components\TextInput::make('tinggi_badan')
                                    ->label('Tinggi Badan')
                                    ->numeric()
                                    ->step(0.01)
                                    ->minValue(0)
                                    ->maxValue(999.99)
                                    ->suffix('cm')
                                    ->placeholder('cth: 160.00'),

                                Forms\Components\TextInput::make('lingkar_badan')
                                    ->label('Lingkar Badan')
                                    ->numeric()
                                    ->step(0.01)
                                    ->minValue(0)
                                    ->maxValue(999.99)
                                    ->suffix('cm')
                                    ->placeholder('cth: 85.50'),

                                Forms\Components\TextInput::make('lingkar_pinggang')
                                    ->label('Lingkar Pinggang')
                                    ->numeric()
                                    ->step(0.01)
                                    ->minValue(0)
                                    ->maxValue(999.99)
                                    ->suffix('cm')
                                    ->placeholder('cth: 70.00'),

                                Forms\Components\TextInput::make('lingkar_pinggul')
                                    ->label('Lingkar Pinggul')
                                    ->numeric()
                                    ->step(0.01)
                                    ->minValue(0)
                                    ->maxValue(999.99)
                                    ->suffix('cm')
                                    ->placeholder('cth: 92.00'),

                                Forms\Components\TextInput::make('panjang_baju')
                                    ->label('Panjang Baju')
                                    ->numeric()
                                    ->step(0.01)
                                    ->minValue(0)
                                    ->maxValue(999.99)
                                    ->suffix('cm')
                                    ->placeholder('cth: 60.00'),

                                Forms\Components\TextInput::make('panjang_lengan')
                                    ->label('Panjang Lengan')
                                    ->numeric()
                                    ->step(0.01)
                                    ->minValue(0)
                                    ->maxValue(999.99)
                                    ->suffix('cm')
                                    ->placeholder('cth: 55.00'),

                                Forms\Components\TextInput::make('lebar_bahu')
                                    ->label('Lebar Bahu')
                                    ->numeric()
                                    ->step(0.01)
                                    ->minValue(0)
                                    ->maxValue(999.99)
                                    ->suffix('cm')
                                    ->placeholder('cth: 38.00'),

                                Forms\Components\TextInput::make('panjang_rok')
                                    ->label('Panjang Rok / Celana')
                                    ->numeric()
                                    ->step(0.01)
                                    ->minValue(0)
                                    ->maxValue(999.99)
                                    ->suffix('cm')
                                    ->placeholder('cth: 100.00'),
                            ])->columns(2),

                        Forms\Components\Section::make('📝 Catatan Penjahit')
                            ->schema([
                                Forms\Components\Textarea::make('notes')
                                    ->label('Catatan & Referensi Desain')
                                    ->placeholder('Preferensi bahan, model khusus, catatan fitting, dll...')
                                    ->rows(4)
                                    ->maxLength(500)
                                    ->columnSpanFull(),
                            ]),
                    ])
                    ->action(function (User $record, array $data): void {
                        Measurement::updateOrCreate(
                            ['user_id' => $record->id],
                            [
                                'lingkar_badan'    => $data['lingkar_badan'] ?: null,
                                'lingkar_pinggang' => $data['lingkar_pinggang'] ?: null,
                                'lingkar_pinggul'  => $data['lingkar_pinggul'] ?: null,
                                'panjang_baju'     => $data['panjang_baju'] ?: null,
                                'panjang_lengan'   => $data['panjang_lengan'] ?: null,
                                'lebar_bahu'       => $data['lebar_bahu'] ?: null,
                                'panjang_rok'      => $data['panjang_rok'] ?: null,
                                'tinggi_badan'     => $data['tinggi_badan'] ?: null,
                                'notes'            => $data['notes'] ?: null,
                            ]
                        );

                        Notification::make()
                            ->success()
                            ->title('✅ Ukuran Berhasil Disimpan!')
                            ->body("Data ukuran badan {$record->name} telah disimpan dan tersinkron ke halaman profil pelanggan.")
                            ->send();
                    }),
            ])
            ->bulkActions([])
            ->emptyStateIcon('heroicon-o-scissors')
            ->emptyStateHeading('Belum ada pelanggan')
            ->emptyStateDescription('Pelanggan yang telah mendaftar akan muncul di sini.');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUkuranPelanggan::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
