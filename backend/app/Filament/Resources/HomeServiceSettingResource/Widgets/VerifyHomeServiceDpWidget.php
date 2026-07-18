<?php

namespace App\Filament\Resources\HomeServiceSettingResource\Widgets;

use App\Models\Order;
use App\Services\WhatsAppService;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Filament\Notifications\Notification;
use Filament\Notifications\Actions\Action as NotificationAction;
use Carbon\Carbon;

class VerifyHomeServiceDpWidget extends BaseWidget
{
    protected int | string | array $columnSpan = 'full';

    protected static ?string $heading = '📋 Verifikasi Pembayaran DP — Home Service';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                // Tampilkan semua pesanan home_service yang sudah upload DP tapi belum diverifikasi
                Order::query()
                    ->where('method', 'home_service')
                    ->where(function ($q) {
                        // Pesanan dengan status dp_uploaded (DP sudah diupload, belum diverifikasi)
                        $q->where('status', 'dp_uploaded')
                            // ATAU pesanan yang punya payment dp dengan status pending
                            ->orWhereHas('payments', function ($pq) {
                                $pq->where('type', 'dp')
                                   ->where('status', 'pending');
                            });
                    })
                    // Jangan tampilkan yang sudah diverifikasi (payment dp verified)
                    ->whereDoesntHave('payments', function ($pq) {
                        $pq->where('type', 'dp')
                           ->where('status', 'verified');
                    })
            )
            ->defaultSort('updated_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->label('No. Pesanan')
                    ->sortable()
                    ->searchable()
                    ->weight('bold')
                    ->copyable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Pelanggan')
                    ->searchable()
                    ->icon('heroicon-m-user'),
                Tables\Columns\TextColumn::make('user.phone_wa')
                    ->label('No. WhatsApp')
                    ->searchable()
                    ->icon('heroicon-m-phone'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Status Pesanan')
                    ->badge()
                    ->color(fn ($state) => match($state) {
                        'dp_uploaded' => 'warning',
                        'pending'     => 'info',
                        default       => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'dp_uploaded' => '⏳ Menunggu Verifikasi DP',
                        'pending'     => '📌 Menunggu Konfirmasi',
                        default       => $state,
                    }),
                Tables\Columns\TextColumn::make('quota_date')
                    ->label('Tgl Janji Temu')
                    ->date('d M Y')
                    ->sortable()
                    ->icon('heroicon-m-calendar'),
                Tables\Columns\TextColumn::make('dp_amount')
                    ->label('Jumlah DP')
                    ->money('IDR', locale: 'id')
                    ->sortable()
                    ->color('primary'),
                Tables\Columns\ImageColumn::make('dp_proof_path')
                    ->label('Bukti Transfer DP')
                    ->disk('public')
                    ->height(80)
                    ->width(80)
                    ->defaultImageUrl(fn () => null),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Tgl Daftar')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\Action::make('lihat_bukti')
                    ->label('Lihat Bukti')
                    ->icon('heroicon-o-eye')
                    ->color('info')
                    ->url(fn (Order $record) => $record->dp_proof_path
                        ? asset('storage/' . $record->dp_proof_path)
                        : null
                    )
                    ->openUrlInNewTab()
                    ->visible(fn (Order $record) => !empty($record->dp_proof_path)),

                Tables\Actions\Action::make('verify_dp')
                    ->label('✅ Verifikasi DP')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Verifikasi Pembayaran DP')
                    ->modalDescription('Apakah Anda yakin ingin memverifikasi DP ini? Setelah diverifikasi, pesanan akan otomatis berubah ke status "Menunggu Konfirmasi Admin" dan pelanggan akan diberitahu via WhatsApp.')
                    ->modalSubmitActionLabel('Ya, Verifikasi Sekarang')
                    ->action(function (Order $record, $livewire) {
                        // 1. Verifikasi payment DP
                        $dp = $record->payments()->where('type', 'dp')->first();
                        if ($dp) {
                            $dp->update([
                                'status'      => 'verified',
                                'verified_at' => Carbon::now(),
                            ]);
                        } else {
                            // Buat payment record jika belum ada
                            $record->payments()->create([
                                'type'           => 'dp',
                                'amount'         => $record->dp_amount,
                                'payment_method' => 'transfer',
                                'proof_path'     => $record->dp_proof_path,
                                'status'         => 'verified',
                                'verified_at'    => Carbon::now(),
                            ]);
                        }

                        // 2. Update status pesanan ke confirmed (atau status baru 'dp_verified' jika sudah ditambahkan)
                        $record->update(['status' => 'confirmed']);
                        $record->refresh();
                        $record->load('user');

                        // 3. Generate WA link notifikasi ke pelanggan
                        $waUrl = null;
                        if ($record->user && $record->user->phone_wa) {
                            $waService = app(WhatsAppService::class);
                            $customerName = $record->user->name;
                            $dpFormatted = 'Rp ' . number_format((float)$record->dp_amount, 0, ',', '.');

                            $waMsg = "✅ *Halo {$customerName},*\n\n"
                                   . "Kabar baik! Pembayaran DP pesanan Anda di *Era Jahit Studio* telah berhasil diverifikasi oleh Admin:\n"
                                   . "━━━━━━━━━━━━━━━━━━━\n"
                                   . "📦 *Nomor Pesanan:* {$record->order_number}\n"
                                   . "💰 *Jumlah DP Diverifikasi:* {$dpFormatted}\n"
                                   . "📌 *Status Saat Ini:* *MENUNGGU KONFIRMASI ADMIN* ⏳\n"
                                   . "━━━━━━━━━━━━━━━━━━━\n"
                                   . "Pesan dari Admin:\n"
                                   . "_DP Anda sudah kami terima dan terverifikasi. Pesanan Anda kini sedang menunggu konfirmasi akhir dari Admin. Kami akan segera menghubungi Anda kembali setelah pesanan dikonfirmasi._ 🙏✨\n\n"
                                   . "Terima kasih telah memilih Era Jahit Studio!";

                            $waUrl = $waService->generateWaLink($record->user->phone_wa, $waMsg);
                            // Kirim otomatis via API
                            $waService->sendMessage($record->user->phone_wa, $waMsg);
                        }

                        if ($waUrl) {
                            $livewire->js("window.open('{$waUrl}', '_blank')");
                        }

                        Notification::make()
                            ->title('DP Berhasil Diverifikasi! ✅')
                            ->body('Pesanan ' . $record->order_number . ' telah diverifikasi dan dialihkan ke WhatsApp.')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\Action::make('tolak_dp')
                    ->label('❌ Tolak DP')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Tolak Pembayaran DP')
                    ->modalDescription('Apakah Anda yakin ingin menolak DP ini? Pesanan akan tetap di status "Menunggu Konfirmasi" dan pelanggan perlu mengupload ulang bukti transfer.')
                    ->modalSubmitActionLabel('Ya, Tolak DP')
                    ->form([
                        \Filament\Forms\Components\Textarea::make('alasan_tolak')
                            ->label('Alasan Penolakan')
                            ->placeholder('Contoh: Bukti transfer tidak jelas / nominal tidak sesuai...')
                            ->required()
                            ->rows(3),
                    ])
                    ->action(function (Order $record, array $data, $livewire) {
                        // 1. Tolak payment DP
                        $dp = $record->payments()->where('type', 'dp')->first();
                        if ($dp) {
                            $dp->update([
                                'status'          => 'rejected',
                                'rejected_reason' => $data['alasan_tolak'],
                                'verified_at'     => null,
                            ]);
                        }

                        // 2. Kembalikan status ke pending agar pelanggan bisa upload ulang
                        $record->update(['status' => 'pending']);
                        $record->refresh();
                        $record->load('user');

                        // 3. Generate WA link notifikasi penolakan ke pelanggan
                        $waUrl = null;
                        if ($record->user && $record->user->phone_wa) {
                            $waService = app(WhatsAppService::class);
                            $customerName = $record->user->name;

                            $waMsg = "❌ *Halo {$customerName},*\n\n"
                                   . "Mohon maaf, bukti pembayaran DP pesanan Anda di *Era Jahit Studio* tidak dapat kami verifikasi:\n"
                                   . "━━━━━━━━━━━━━━━━━━━\n"
                                   . "📦 *Nomor Pesanan:* {$record->order_number}\n"
                                   . "📌 *Status DP:* *DITOLAK* ❌\n"
                                   . "━━━━━━━━━━━━━━━━━━━\n"
                                   . "Alasan dari Admin:\n"
                                   . "_*{$data['alasan_tolak']}*_\n\n"
                                   . "Silakan upload ulang bukti transfer yang valid melalui aplikasi Era Jahit Studio. Jika ada pertanyaan, silakan hubungi kami langsung. Terima kasih. 🙏";

                            $waUrl = $waService->generateWaLink($record->user->phone_wa, $waMsg);
                            // Kirim otomatis via API
                            $waService->sendMessage($record->user->phone_wa, $waMsg);
                        }

                        if ($waUrl) {
                            $livewire->js("window.open('{$waUrl}', '_blank')");
                        }

                        Notification::make()
                            ->title('DP Ditolak ❌')
                            ->body('DP pesanan ' . $record->order_number . ' telah ditolak dan dialihkan ke WhatsApp.')
                            ->danger()
                            ->send();
                    }),
            ])
            ->emptyStateHeading('Tidak Ada DP yang Menunggu Verifikasi')
            ->emptyStateDescription('Semua pembayaran DP Home Service sudah terverifikasi, atau belum ada pesanan Home Service yang masuk.')
            ->emptyStateIcon('heroicon-o-check-circle');
    }
}
