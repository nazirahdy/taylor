<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Carbon\Carbon;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationLabel = 'Semua Pesanan';
    protected static ?string $modelLabel = 'Pesanan';
    protected static ?string $pluralModelLabel = 'Pesanan';
    protected static ?string $navigationGroup = 'Manajemen Pesanan';
    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        $count = Order::where('is_read', false)->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Informasi Pesanan')->schema([
                Forms\Components\TextInput::make('order_number')
                    ->label('Nomor Pesanan')->disabled()->dehydrated(false),
                Forms\Components\TextInput::make('id')
                    ->label('ID Pesanan')->disabled()->dehydrated(false),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')->searchable()->preload()->required(),
                Forms\Components\Select::make('method')
                    ->options(['home_service' => 'Home Service', 'visit' => 'Booking ke Toko'])
                    ->required(),

                Forms\Components\DatePicker::make('order_date')->label('Tanggal Pesan')->disabled(),
                Forms\Components\DatePicker::make('quota_date')->label('Tanggal Janji Temu'),
            ])->columns(3),

            Forms\Components\Section::make('Alamat & Lokasi Pelanggan / Kunjungan')->schema([
                Forms\Components\Placeholder::make('alamat_profil')
                    ->label('Alamat Utama Pelanggan (Profil)')
                    ->content(fn (?Order $record) => $record?->user?->alamat ?? '-'),
                Forms\Components\Placeholder::make('visit_address')
                    ->label('Alamat Kunjungan Home Service (Order)')
                    ->content(fn (?Order $record) => $record?->visit_address ?? $record?->alamat_kunjungan ?? $record?->user?->alamat ?? '-'),
                Forms\Components\Placeholder::make('gps_coordinates')
                    ->label('Lokasi Peta')
                    ->content(function (?Order $record) {
                        if (!$record || !$record->latitude || !$record->longitude) {
                            return 'Belum tersemat titik peta';
                        }
                        $lat = $record->latitude;
                        $lng = $record->longitude;
                        $mapsUrl = "https://www.google.com/maps/search/?api=1&query={$lat},{$lng}";
                        return new \Illuminate\Support\HtmlString("
                            <div>
                                <a href='{$mapsUrl}' target='_blank' class='inline-flex items-center gap-1.5 text-primary-600 hover:underline font-bold text-sm'>
                                    📍 Buka Titik Lokasi di Google Maps
                                </a>
                            </div>
                        ");
                    }),
            ])->columns(3),

            Forms\Components\Section::make('Detail Desain')->schema([
                Forms\Components\Textarea::make('design_notes')->label('Catatan Desain')->columnSpanFull(),
                Forms\Components\FileUpload::make('design_image_path')
                    ->label('Gambar Referensi')->image()->directory('designs')->disabled(),
            ]),

            Forms\Components\Section::make('Data Ukuran')
                ->description('Data ukuran badan pelanggan')
                ->schema([
                    Forms\Components\Placeholder::make('lingkar_badan')->label('Lingkar Badan')
                        ->content(fn (Order $record) => ($record->measurement?->lingkar_badan ?? '-') . ' cm'),
                    Forms\Components\Placeholder::make('lingkar_pinggang')->label('Lingkar Pinggang')
                        ->content(fn (Order $record) => ($record->measurement?->lingkar_pinggang ?? '-') . ' cm'),
                    Forms\Components\Placeholder::make('lingkar_pinggul')->label('Lingkar Pinggul')
                        ->content(fn (Order $record) => ($record->measurement?->lingkar_pinggul ?? '-') . ' cm'),
                    Forms\Components\Placeholder::make('panjang_baju')->label('Panjang Baju')
                        ->content(fn (Order $record) => ($record->measurement?->panjang_baju ?? '-') . ' cm'),
                    Forms\Components\Placeholder::make('panjang_lengan')->label('Panjang Lengan')
                        ->content(fn (Order $record) => ($record->measurement?->panjang_lengan ?? '-') . ' cm'),
                    Forms\Components\Placeholder::make('lebar_bahu')->label('Lebar Bahu')
                        ->content(fn (Order $record) => ($record->measurement?->lebar_bahu ?? '-') . ' cm'),
                    Forms\Components\Placeholder::make('tinggi_badan')->label('Tinggi Badan')
                        ->content(fn (Order $record) => ($record->measurement?->tinggi_badan ?? '-') . ' cm'),
                ])->columns(4)->visible(fn (Order $record) => $record->measurement_id !== null),

            Forms\Components\Section::make('Bukti Pembayaran (DP)')->schema([
                Forms\Components\Placeholder::make('dp_proof_path')
                    ->label('File Bukti Transfer')
                    ->content(fn (?Order $record) => $record?->dp_proof_path ? new \Illuminate\Support\HtmlString('<a href="/storage/'.$record->dp_proof_path.'" target="_blank" class="text-primary-600 underline font-bold">Lihat Bukti</a>') : '-'),
                Forms\Components\Placeholder::make('dp_verified_at')
                    ->label('Diverifikasi Pada')
                    ->content(fn (?Order $record) => ($dp = $record?->payments()->where('type', 'dp')->first()) && $dp->verified_at ? $dp->verified_at->format('d M Y H:i') : '-'),
            ])->columns(2),

            Forms\Components\Section::make('Harga & Status')->schema([
                Forms\Components\TextInput::make('estimated_price')
                    ->label('Estimasi Harga/Total Biaya')
                    ->numeric()
                    ->stripCharacters(['.', ','])
                    ->formatStateUsing(fn ($state) => $state !== null && $state !== '' ? (int) round((float) $state) : null)
                    ->helperText('Tanpa titik/koma')
                    ->prefix('Rp')
                    ->live(),
                Forms\Components\TextInput::make('dp_amount')
                    ->label('Jumlah DP')
                    ->numeric()
                    ->stripCharacters(['.', ','])
                    ->formatStateUsing(fn ($state) => $state !== null && $state !== '' ? (int) round((float) $state) : null)
                    ->helperText('Tanpa titik/koma')
                    ->prefix('Rp')
                    ->live(),
                Forms\Components\TextInput::make('final_payment_amount')
                    ->label('Jumlah Pelunasan')
                    ->numeric()
                    ->stripCharacters(['.', ','])
                    ->formatStateUsing(fn ($state) => $state !== null && $state !== '' ? (int) round((float) $state) : null)
                    ->prefix('Rp')
                    ->live(onBlur: true),
                Forms\Components\Placeholder::make('sisa_tagihan')
                    ->label('Sisa Tagihan')
                    ->content(function (callable $get) {
                        $price = (float)($get('estimated_price') ?? 0);
                        $dp = (float)($get('dp_amount') ?? 0);
                        $final = (float)($get('final_payment_amount') ?? 0);
                        $total = $dp + $final;

                        if ($price > 0 && $total >= $price && $total > 0) {
                            return 'Lunas ✅';
                        }

                        return 'Rp ' . number_format(max(0, $price - $total), 0, ',', '.');
                    }),
                Forms\Components\Placeholder::make('is_fully_paid')
                    ->label('Status Lunas')
                    ->content(function (callable $get) {
                        $price = (float)($get('estimated_price') ?? 0);
                        $dp = (float)($get('dp_amount') ?? 0);
                        $final = (float)($get('final_payment_amount') ?? 0);
                        $total = $dp + $final;

                        if ($price > 0 && $total >= $price && $total > 0) return '✅ Lunas';
                        if ($final > 0) return '❌ Belum Lunas (Ada Sisa)';
                        return '❌ Belum Lunas';
                    }),
                Forms\Components\Select::make('status')->options([
                    'pending'              => 'Menunggu Konfirmasi',
                    'confirmed'            => 'Dikonfirmasi',
                    'pola_pemotongan'      => 'Pola dan Pemotongan',
                    'pola_penjahitan'      => 'Pola Penjahitan',
                    'proses_menjahit'      => 'Proses Menjahit',
                    'finishing'            => 'Finishing',
                    'selesai_penyerahan'   => 'Selesai & Penyerahan',
                    'rejected'             => 'Ditolak',
                ])->default('pending')->disabled()->dehydrated(false)->required(),
                Forms\Components\Textarea::make('rejected_reason')->label('Alasan Penolakan')
                    ->visible(fn (Order $record) => $record->status === 'rejected')->disabled()->dehydrated(false),
                Forms\Components\Repeater::make('financial_breakdown')
                    ->label('Rincian Estimasi Keuangan')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Nama Komponen Biaya')
                            ->placeholder('Contoh: Jasa Jahit Baju, Bahan Satin, Kancing Hias')
                            ->required(),
                        Forms\Components\TextInput::make('amount')
                            ->label('Jumlah Biaya')
                            ->numeric()
                            ->stripCharacters(['.', ','])
                            ->formatStateUsing(fn ($state) => $state !== null && $state !== '' ? (int) round((float) $state) : null)
                            ->prefix('Rp')
                            ->required()
                    ])
                    ->columnSpanFull()
                    ->columns(2)
                    ->createItemButtonLabel('Tambah Komponen Biaya'),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->recordUrl(
                fn (Order $record): string => Pages\ViewOrder::getUrl([$record->id])
            )
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->label('No. Pesanan')->sortable(),
                Tables\Columns\TextColumn::make('id')->label('ID')->sortable(),
                Tables\Columns\TextColumn::make('user.name')->searchable()->label('Name'),

                Tables\Columns\TextColumn::make('user.phone_wa')->label('WhatsApp')->searchable(),
                Tables\Columns\TextColumn::make('visit_address')
                    ->label('Alamat Kunjungan / Pelanggan')
                    ->searchable()
                    ->wrap()
                    ->limit(50)
                    ->getStateUsing(fn (Order $record) => $record->visit_address ?? $record->user?->alamat ?? '-'),
                Tables\Columns\TextColumn::make('method')->badge()
                    ->color(fn ($state) => match($state) {
                        'home_service' => 'primary', 'visit' => 'success', default => 'gray',
                    })
                    ->icon(fn ($state) => $state === 'home_service' ? 'heroicon-m-home' : 'heroicon-m-building-storefront')
                    ->formatStateUsing(fn ($state) => $state === 'home_service' ? 'Home Service' : 'Booking ke Toko'),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->color(fn ($state) => match($state) {
                        'pending'            => 'info',
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
                        'confirmed'          => 'Dikonfirmasi',
                        'pola_pemotongan'    => 'Pola dan Pemotongan',
                        'pola_penjahitan'    => 'Pola Penjahitan',
                        'proses_menjahit'    => 'Proses Menjahit',
                        'finishing'          => 'Finishing',
                        'selesai_penyerahan' => 'Selesai & Penyerahan',
                        'rejected'           => 'Ditolak',
                        default              => $state,
                    }),
                Tables\Columns\TextColumn::make('dp_amount')
                    ->label('Total DP')
                    ->getStateUsing(fn (Order $record) => $record->dp_amount)
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format((float) ($state ?? 0), 0, ',', '.'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('final_payment_amount')
                    ->label('Pelunasan')
                    ->getStateUsing(fn (Order $record) => $record->final_payment_amount)
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format((float) ($state ?? 0), 0, ',', '.'))
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\IconColumn::make('is_fully_paid')
                    ->label('Lunas')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\ImageColumn::make('dp_proof_path')
                    ->label('Bukti DP')
                    ->getStateUsing(fn (Order $record) => $record->dp_proof_path)
                    ->defaultImageUrl(fn (Order $record) => $record->method === 'visit' && !$record->dp_proof_path ? null : '')
                    ->visible(fn ($livewire) => !isset($livewire->activeTab) || $livewire->activeTab !== 'visit')
                    ->disk('public')
                    ->rounded(),
                Tables\Columns\TextColumn::make('quota_date')->date()->sortable()->label('Tgl Janji'),
                Tables\Columns\TextColumn::make('dp_verified_at')
                    ->label('DP Diverifikasi')
                    ->getStateUsing(fn (Order $record) => ($dp = $record->payments()->where('type', 'dp')->first()) ? $dp->verified_at : null)
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options([
                    'pending'            => 'Menunggu Konfirmasi',
                    'confirmed'          => 'Dikonfirmasi',
                    'pola_pemotongan'    => 'Pola dan Pemotongan',
                    'pola_penjahitan'    => 'Pola Penjahitan',
                    'proses_menjahit'    => 'Proses Menjahit',
                    'finishing'          => 'Finishing',
                    'selesai_penyerahan' => 'Selesai & Penyerahan',
                    'rejected'           => 'Ditolak',
                ])
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\Action::make('terima_pesanan')
                    ->label('Terima Pesanan')->icon('heroicon-o-check-circle')->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Terima Pesanan')
                    ->modalDescription('Pesanan In-Store akan dikonfirmasi dan Anda akan dialihkan ke WhatsApp untuk mengirim pesan.')
                    ->visible(fn (Order $record) => $record->status === 'pending' && $record->method !== 'home_service')
                    ->action(function (Order $record, $livewire) {
                        $record->update(['status' => 'confirmed']);
                        $record->refresh();
                        $record->load('user');

                        if ($record->user && $record->user->phone_wa) {
                            $whatsAppService = app(\App\Services\WhatsAppService::class);
                            $url = $whatsAppService->generateWaLink(
                                $record->user->phone_wa,
                                $whatsAppService->getMessageConfirmed($record)
                            );
                            $livewire->js("window.open('{$url}', '_blank')");
                        }

                        Notification::make()->title('Pesanan diterima & dikonfirmasi!')->success()->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Tolak')->icon('heroicon-o-x-circle')->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('rejected_reason')->required()->label('Alasan Penolakan'),
                    ])
                    ->visible(fn (Order $record) => $record->status === 'pending')
                    ->action(function (Order $record, array $data) {
                        $record->update(['status' => 'rejected', 'rejected_reason' => $data['rejected_reason']]);
                        Notification::make()->title('Pesanan ditolak')->danger()->send();
                    }),
                Tables\Actions\Action::make('complete')
                    ->label('Tandai Selesai & Penyerahan')->icon('heroicon-o-check-circle')->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (Order $record) => $record->status === 'finishing')
                    ->action(function (Order $record) {
                        $record->update(['status' => 'selesai_penyerahan']);
                        Notification::make()->title('Pesanan selesai & siap diserahkan!')->success()->send();
                    }),
                
                Tables\Actions\Action::make('terima_pelunasan')
                    ->label('Catat Pelunasan')
                    ->icon('heroicon-o-banknotes')
                    ->color('success')
                    ->modalHeading('Catat Pembayaran Pelunasan')
                    ->modalDescription('Masukkan nominal pelunasan yang dibayarkan oleh pelanggan.')
                    ->modalWidth('md')
                    ->visible(fn (Order $record) => !$record->is_fully_paid && $record->estimated_price > 0 && in_array($record->status, ['in_progress', 'completed']))
                    ->form([
                        Forms\Components\TextInput::make('final_payment_amount')
                            ->label('Nominal Pelunasan')
                            ->numeric()
                            ->stripCharacters(['.', ','])
                            ->helperText('Tanpa titik/koma')
                            ->required()
                            ->prefix('Rp')
                            ->default(fn (Order $record) => $record->estimated_price - $record->dp_amount),
                        Forms\Components\FileUpload::make('final_payment_proof_path')
                            ->label('Bukti Pembayaran (Opsional)')
                            ->image()
                            ->directory('final_payments'),
                    ])
                    ->action(function (Order $record, array $data) {
                        $record->payments()->create([
                            'type' => 'final',
                            'amount' => $data['final_payment_amount'],
                            'payment_method' => 'manual',
                            'proof_path' => $data['final_payment_proof_path'] ?? null,
                            'status' => 'verified',
                            'verified_at' => Carbon::now(),
                        ]);
                        
                        $record->refresh();
                        // Siapkan link WhatsApp Kwitansi Pelunasan
                        if ($record->user && $record->user->phone_wa) {
                            $whatsAppService = app(\App\Services\WhatsAppService::class);
                            $nomPelunasan = number_format($data['final_payment_amount'], 0, ',', '.');
                            $msg = "Halo {$record->user->name}\n"
                                 . "Terima kasih, pembayaran pelunasan sebesar *Rp {$nomPelunasan}* untuk pesanan #{$record->id} telah kami terima.\n";

                            if ($record->is_fully_paid) {
                                $msg .= "Pesanan Anda kini berstatus LUNAS. Terima kasih!";
                            } else {
                                $sisa = max(0, $record->estimated_price - $record->dp_amount - $record->final_payment_amount);
                                $nomSisa = number_format($sisa, 0, ',', '.');
                                $msg .= "Sisa tagihan Anda saat ini adalah *Rp {$nomSisa}*. Terima kasih!";
                            }
                            $msg .= $whatsAppService->messageFooter();

                            $url = $whatsAppService->generateWaLink($record->user->phone_wa, $msg);
                            Notification::make()
                                ->title('Pelunasan dicatat!')
                                ->body('Klik untuk kirim bukti ke WhatsApp.')
                                ->actions([
                                    \Filament\Notifications\Actions\Action::make('send_wa')
                                        ->label('Kirim WA')
                                        ->url($url, shouldOpenInNewTab: true)
                                        ->button(),
                                ])
                                ->success()
                                ->send();
                        } else {
                            Notification::make()->title('Pelunasan berhasil dicatat!')->success()->send();
                        }
                    }),
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\Action::make('send_wa_estimation')
                        ->label('Kirim Notifikasi Harga')
                        ->icon('heroicon-o-chat-bubble-left-right')
                        ->color('info')
                        ->requiresConfirmation()
                        ->visible(fn (Order $record) => $record->estimated_price > 0)
                        ->action(function (Order $record) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            
                            $estimatedPrice = number_format($record->estimated_price, 0, ',', '.');
                            $dpAmount = number_format($record->dp_amount, 0, ',', '.');
                            $msg = "Halo {$record->user->name}\n"
                                 . "Tim Era Jahit telah meninjau pesanan Anda #{$record->id}.\n\n"
                                 . "*Estimasi Total*: Rp {$estimatedPrice}\n"
                                 . "*Uang Muka (DP)*: Rp {$dpAmount}\n\n"
                                 . "Silakan bayar DP agar pesanan segera kami proses!"
                                 . $waService->messageFooter();

                            $url = $waService->generateWaLink($record->user->phone_wa, $msg);
                            Notification::make()
                                ->title('Pesan WA Siap!')
                                ->body('Klik tombol di bawah untuk membuka WhatsApp')
                                ->actions([
                                    \Filament\Notifications\Actions\Action::make('send_wa')
                                        ->label('Kirim Sekarang')
                                        ->url($url, shouldOpenInNewTab: true)
                                        ->button(),
                                ])
                                ->success()
                                ->send();
                        }),
                    Tables\Actions\Action::make('send_wa_confirmed')
                        ->label('Kirim Ulang Konfirmasi')
                        ->icon('heroicon-o-check-badge')
                        ->requiresConfirmation()
                        ->action(function (Order $record) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            $url = $waService->generateWaLink($record->user->phone_wa, $waService->getMessageConfirmed($record));
                            Notification::make()
                                ->title('Pesan WA Siap!')
                                ->body('Klik tombol di bawah untuk membuka WhatsApp')
                                ->actions([
                                    \Filament\Notifications\Actions\Action::make('send_wa')
                                        ->label('Kirim Sekarang')
                                        ->url($url, shouldOpenInNewTab: true)
                                        ->button(),
                                ])
                                ->success()
                                ->send();
                        }),
                ])->label('WhatsApp')->icon('heroicon-m-chat-bubble-bottom-center-text')->button(),
            ])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ProgressLogsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'view'   => Pages\ViewOrder::route('/{record}'),
            'edit'   => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
