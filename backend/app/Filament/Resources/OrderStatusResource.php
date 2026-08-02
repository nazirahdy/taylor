<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderStatusResource\Pages;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Filament\Notifications\Actions\Action as NotificationAction;
use Carbon\Carbon;

class OrderStatusResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $navigationIcon = 'heroicon-o-arrow-path';
    protected static ?string $navigationLabel = 'Kelola Status Pesanan';
    protected static ?string $modelLabel = 'Status Pesanan';
    protected static ?string $pluralModelLabel = 'Status Pesanan';
    protected static ?string $navigationGroup = 'Manajemen Pesanan';
    protected static ?int $navigationSort = 3;

    public static function canViewAny(): bool
    {
        return auth()->user()->role === 'admin';
    }

    public static function getNavigationBadge(): ?string
    {
        $count = Order::where('status', 'pending')->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Ubah Status Pesanan')
                    ->description('Ubah status pengerjaan pesanan. Setiap perubahan akan ditampilkan notifikasi dengan link WA langsung ke pelanggan.')
                    ->schema([
                        Forms\Components\TextInput::make('order_number')
                            ->label('Nomor Pesanan')
                            ->disabled()
                            ->dehydrated(false),
                        Forms\Components\Select::make('status')
                            ->label('Status Pesanan')
                            ->options(function (Order $record) {
                                $options = [
                                    'pending'              => 'Menunggu Konfirmasi',
                                    'confirmed'            => 'Dikonfirmasi',
                                    'pola_pemotongan'      => 'Pola dan Pemotongan',
                                    'pola_penjahitan'      => 'Pola Penjahitan',
                                    'proses_menjahit'      => 'Proses Menjahit',
                                    'finishing'            => 'Finishing',
                                    'selesai_penyerahan'   => 'Selesai & Penyerahan',
                                ];
                                if ($record->status === 'pending') {
                                    $options['rejected'] = 'Ditolak';
                                }
                                return $options;
                            })
                            ->required()
                            ->reactive(),
                        Forms\Components\Textarea::make('rejected_reason')
                            ->label('Alasan Penolakan')
                            ->placeholder('Tuliskan alasan penolakan di sini agar pelanggan mengetahuinya...')
                            ->visible(fn (callable $get) => $get('status') === 'rejected')
                            ->required(fn (callable $get) => $get('status') === 'rejected')
                            ->columnSpanFull(),
                    ])
                    ->columns(2)
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->label('No. Pesanan')
                    ->sortable()
                    ->searchable()
                    ->weight('bold')
                    ->copyable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Name')
                    ->searchable()
                    ->icon('heroicon-m-user'),
                Tables\Columns\TextColumn::make('user.phone_wa')
                    ->label('WhatsApp')
                    ->searchable()
                    ->icon('heroicon-m-phone'),
                Tables\Columns\TextColumn::make('method')
                    ->label('Layanan')
                    ->badge()
                    ->color(fn ($state) => match($state) {
                        'home_service' => 'primary',
                        'visit' => 'success',
                        default => 'gray',
                    })
                    ->icon(fn ($state) => $state === 'home_service' ? 'heroicon-m-home' : 'heroicon-m-building-storefront')
                    ->formatStateUsing(fn ($state) => $state === 'home_service' ? 'Home Service' : 'Booking ke Toko'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Status Pesanan')
                    ->badge()
                    ->color(fn ($state) => match($state) {
                        'pending'            => 'info',
                        'dp_uploaded'        => 'warning',
                        'confirmed'          => 'success',
                        'pola_pemotongan'    => 'warning',
                        'pola_penjahitan'    => 'warning',
                        'proses_menjahit'    => 'warning',
                        'finishing'          => 'primary',
                        'selesai_penyerahan' => 'success',
                        'rejected'           => 'danger',
                        default              => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'pending'            => 'Menunggu Konfirmasi',
                        'dp_uploaded'        => 'Menunggu Verifikasi DP',
                        'confirmed'          => 'Dikonfirmasi',
                        'pola_pemotongan'    => 'Pola dan Pemotongan',
                        'pola_penjahitan'    => 'Pola Penjahitan',
                        'proses_menjahit'    => 'Proses Menjahit',
                        'finishing'          => 'Finishing',
                        'selesai_penyerahan' => 'Selesai & Penyerahan',
                        'rejected'           => 'Ditolak',
                        default              => $state,
                    }),
                Tables\Columns\TextColumn::make('quota_date')
                    ->label('Tgl Janji')
                    ->date('d M Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Terakhir Update')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options([
                    'pending'            => 'Menunggu Konfirmasi',
                    'dp_uploaded'        => 'Menunggu Verifikasi DP',
                    'confirmed'          => 'Dikonfirmasi',
                    'pola_pemotongan'    => 'Pola dan Pemotongan',
                    'pola_penjahitan'    => 'Pola Penjahitan',
                    'proses_menjahit'    => 'Proses Menjahit',
                    'finishing'          => 'Finishing',
                    'selesai_penyerahan' => 'Selesai & Penyerahan',
                    'rejected'           => 'Ditolak',
                ]),
                Tables\Filters\SelectFilter::make('method')->options([
                    'home_service' => 'Home Service',
                    'visit'        => 'Booking ke Toko',
                ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Ubah Status')
                    ->icon('heroicon-o-pencil')
                    ->modalWidth('md')
                    ->disabled(fn (Order $record) => $record->status === 'selesai_penyerahan')
                    ->using(function (Order $record, array $data): Order {
                        $record->update([
                            'status'          => $data['status'],
                            'rejected_reason' => $data['rejected_reason'] ?? null,
                        ]);
                        return $record;
                    })
                    ->after(function (Order $record, array $data, $livewire) {
                        if (!$record->user?->phone_wa) {
                            Notification::make()->title('Status Diperbarui')->success()->send();
                            return;
                        }

                        $waService = app(\App\Services\WhatsAppService::class);
                        $message = '';

                        switch ($data['status']) {
                            case 'confirmed':
                                $message = $waService->getMessageConfirmed($record);
                                break;
                            case 'pola_pemotongan':
                                $message = $waService->getMessageProgressUpdate($record, 'Pola dan Pemotongan', 'Pesanan Anda masuk ke tahap pembuatan pola dan pemotongan bahan.');
                                break;
                            case 'pola_penjahitan':
                                $message = $waService->getMessageProgressUpdate($record, 'Pola Penjahitan', 'Pesanan Anda masuk ke tahap pola penjahitan.');
                                break;
                            case 'proses_menjahit':
                                $message = $waService->getMessageInProgress($record);
                                break;
                            case 'finishing':
                                $message = $waService->getMessageProgressUpdate($record, 'Finishing', 'Pesanan Anda masuk ke tahap finishing (penyelesaian akhir).');
                                break;
                            case 'selesai_penyerahan':
                                $message = $waService->getMessageCompleted($record);
                                break;
                            case 'rejected':
                                $message = $waService->getMessageRejected($record, $data['rejected_reason'] ?? 'Ketidaksesuaian detail');
                                break;
                        }

                        if ($message) {
                            $url = $waService->generateWaLink($record->user->phone_wa, $message);
                            $livewire->js("window.open('{$url}', '_blank')");

                            Notification::make()
                                ->title('Status Berhasil Diperbarui! ✅')
                                ->body('Pesan notifikasi sudah disiapkan dan dialihkan ke WhatsApp, silakan klik kirim.')
                                ->success()
                                ->send();
                        } else {
                            Notification::make()->title('Status Diperbarui')->success()->send();
                        }
                    }),

                Tables\Actions\Action::make('confirm_order')
                    ->label('Konfirmasi')
                    ->color('success')
                    ->icon('heroicon-o-check-circle')
                    ->visible(fn (Order $record) => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->modalHeading('Konfirmasi Pesanan')
                    ->modalDescription('Pesanan akan dikonfirmasi dan Anda akan dialihkan ke WhatsApp untuk mengirim pesan.')
                    ->action(function (Order $record, $livewire) {
                        $record->update(['status' => 'confirmed']);
                        $record->load('user');

                        if ($record->user?->phone_wa) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            $url = $waService->generateWaLink(
                                $record->user->phone_wa,
                                $waService->getMessageConfirmed($record)
                            );
                            
                            $livewire->js("window.open('{$url}', '_blank')");

                            Notification::make()
                                ->title('Pesanan Dikonfirmasi!')
                                ->body('Pesanan telah dikonfirmasi dan dialihkan ke WhatsApp.')
                                ->success()
                                ->send();
                        } else {
                            Notification::make()->title('Pesanan Dikonfirmasi!')->success()->send();
                        }
                    }),

                Tables\Actions\Action::make('start_cutting')
                    ->label('Pola & Potong')
                    ->color('warning')
                    ->icon('heroicon-o-scissors')
                    ->visible(fn (Order $record) => $record->status === 'confirmed')
                    ->requiresConfirmation()
                    ->modalHeading('Mulai Pembuatan Pola & Pemotongan')
                    ->modalDescription('Status akan diubah ke "Pola dan Pemotongan" dan Anda akan dialihkan ke WhatsApp.')
                    ->action(function (Order $record, $livewire) {
                        $record->update(['status' => 'pola_pemotongan']);
                        $record->load('user');

                        if ($record->user?->phone_wa) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            $url = $waService->generateWaLink(
                                $record->user->phone_wa,
                                $waService->getMessageProgressUpdate($record, 'Pola dan Pemotongan', 'Pesanan Anda masuk ke tahap pembuatan pola dan pemotongan bahan.')
                            );
                            
                            $livewire->js("window.open('{$url}', '_blank')");

                            Notification::make()
                                ->title('Status Diperbarui')
                                ->body('Pesanan berada di tahap Pola & Pemotongan.')
                                ->success()
                                ->send();
                        } else {
                            Notification::make()->title('Status Diperbarui')->success()->send();
                        }
                    }),

                Tables\Actions\Action::make('start_sewing_pattern')
                    ->label('Pola Jahit')
                    ->color('warning')
                    ->icon('heroicon-o-wrench-screwdriver')
                    ->visible(fn (Order $record) => $record->status === 'pola_pemotongan')
                    ->requiresConfirmation()
                    ->modalHeading('Mulai Pola Penjahitan')
                    ->modalDescription('Status akan diubah ke "Pola Penjahitan" dan Anda akan dialihkan ke WhatsApp.')
                    ->action(function (Order $record, $livewire) {
                        $record->update(['status' => 'pola_penjahitan']);
                        $record->load('user');

                        if ($record->user?->phone_wa) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            $url = $waService->generateWaLink(
                                $record->user->phone_wa,
                                $waService->getMessageProgressUpdate($record, 'Pola Penjahitan', 'Pesanan Anda masuk ke tahap pola penjahitan.')
                            );
                            
                            $livewire->js("window.open('{$url}', '_blank')");

                            Notification::make()
                                ->title('Status Diperbarui')
                                ->body('Pesanan berada di tahap Pola Penjahitan.')
                                ->success()
                                ->send();
                        } else {
                            Notification::make()->title('Status Diperbarui')->success()->send();
                        }
                    }),

                Tables\Actions\Action::make('start_sewing')
                    ->label('Proses Jahit')
                    ->color('primary')
                    ->icon('heroicon-o-scissors')
                    ->visible(fn (Order $record) => $record->status === 'pola_penjahitan')
                    ->requiresConfirmation()
                    ->modalHeading('Mulai Proses Jahit')
                    ->modalDescription('Status akan diubah ke "Proses Menjahit" dan Anda akan dialihkan ke WhatsApp.')
                    ->action(function (Order $record, $livewire) {
                        $record->update(['status' => 'proses_menjahit']);
                        $record->load('user');

                        if ($record->user?->phone_wa) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            $url = $waService->generateWaLink(
                                $record->user->phone_wa,
                                $waService->getMessageInProgress($record)
                            );
                            
                            $livewire->js("window.open('{$url}', '_blank')");

                            Notification::make()
                                ->title('Status Diperbarui: Proses Jahit')
                                ->body('Pesanan dalam proses jahit dan dialihkan ke WhatsApp.')
                                ->success()
                                ->send();
                        } else {
                            Notification::make()->title('Status Diperbarui')->success()->send();
                        }
                    }),

                Tables\Actions\Action::make('start_finishing')
                    ->label('Finishing')
                    ->color('info')
                    ->icon('heroicon-o-sparkles')
                    ->visible(fn (Order $record) => $record->status === 'proses_menjahit')
                    ->requiresConfirmation()
                    ->modalHeading('Mulai Finishing')
                    ->modalDescription('Status akan diubah ke "Finishing" dan Anda akan dialihkan ke WhatsApp.')
                    ->action(function (Order $record, $livewire) {
                        $record->update(['status' => 'finishing']);
                        $record->load('user');

                        if ($record->user?->phone_wa) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            $url = $waService->generateWaLink(
                                $record->user->phone_wa,
                                $waService->getMessageProgressUpdate($record, 'Finishing', 'Pesanan Anda masuk ke tahap finishing (penyelesaian akhir).')
                            );
                            
                            $livewire->js("window.open('{$url}', '_blank')");

                            Notification::make()
                                ->title('Status Diperbarui')
                                ->body('Pesanan berada di tahap Finishing.')
                                ->success()
                                ->send();
                        } else {
                            Notification::make()->title('Status Diperbarui')->success()->send();
                        }
                    }),

                Tables\Actions\Action::make('complete')
                    ->label('Selesaikan')
                    ->color('success')
                    ->icon('heroicon-o-check-badge')
                    ->visible(fn (Order $record) => $record->status === 'finishing')
                    ->requiresConfirmation()
                    ->modalHeading('Tandai Pesanan Selesai')
                    ->modalDescription('Pesanan akan ditandai selesai dan diserahkan, serta Anda akan dialihkan ke WhatsApp.')
                    ->action(function (Order $record, $livewire) {
                        $record->update(['status' => 'selesai_penyerahan']);
                        $record->load('user');

                        if ($record->user?->phone_wa) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            $url = $waService->generateWaLink(
                                $record->user->phone_wa,
                                $waService->getMessageCompleted($record)
                            );
                            
                            $livewire->js("window.open('{$url}', '_blank')");

                            Notification::make()
                                ->title('Pesanan Selesai!')
                                ->body('Pesanan telah ditandai selesai & penyerahan dan dialihkan ke WhatsApp.')
                                ->success()
                                ->send();
                        } else {
                            Notification::make()->title('Pesanan Selesai!')->success()->send();
                        }
                    }),

                Tables\Actions\Action::make('reject')
                    ->label('Tolak')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('rejected_reason')
                            ->required()
                            ->label('Alasan Penolakan')
                            ->placeholder('Tuliskan alasan penolakan...')
                            ->rows(3),
                    ])
                    ->visible(fn (Order $record) => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->modalHeading('Tolak Pesanan')
                    ->modalDescription('Pesanan akan ditolak dan Anda akan dialihkan ke WhatsApp.')
                    ->action(function (Order $record, array $data, $livewire) {
                        $record->update([
                            'status'          => 'rejected',
                            'rejected_reason' => $data['rejected_reason'],
                        ]);
                        $record->load('user');

                        if ($record->user?->phone_wa) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            $url = $waService->generateWaLink(
                                $record->user->phone_wa,
                                $waService->getMessageRejected($record, $data['rejected_reason'])
                            );
                            
                            $livewire->js("window.open('{$url}', '_blank')");

                            Notification::make()
                                ->title('Pesanan Ditolak')
                                ->body('Pesanan telah ditolak dan dialihkan ke WhatsApp.')
                                ->danger()
                                ->send();
                        } else {
                            Notification::make()->title('Pesanan Ditolak')->danger()->send();
                        }
                    }),
            ])
            ->bulkActions([])
            ->defaultSort('updated_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrderStatus::route('/'),
        ];
    }

    public static function canCreate(): bool { return false; }
    public static function canDelete(\Illuminate\Database\Eloquent\Model $record): bool { return false; }
}
