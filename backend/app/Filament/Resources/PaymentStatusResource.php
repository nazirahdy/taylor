<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentStatusResource\Pages;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Carbon\Carbon;

class PaymentStatusResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationLabel = 'Kelola Status Pelunasan';
    protected static ?string $modelLabel = 'Pelunasan';
    protected static ?string $pluralModelLabel = 'Pelunasan Pesanan';
    protected static ?string $navigationGroup = 'Manajemen Pesanan';
    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Informasi Pesanan')
                ->description('Data utama pesanan yang bisa dilihat saat mengelola status pelunasan.')
                ->schema([
                    Forms\Components\TextInput::make('order_number')
                        ->label('No. Pesanan')
                        ->disabled()
                        ->dehydrated(false),
                    Forms\Components\Placeholder::make('method')
                        ->label('Metode Layanan')
                        ->content(fn (?Order $record) => $record?->method === 'home_service' ? 'Home Service' : 'Booking ke Toko'),
                    Forms\Components\Placeholder::make('customer_name')
                        ->label('Pelanggan')
                        ->content(fn (?Order $record) => $record?->user?->name ?? '-'),
                ])
                ->columns(3),

            Forms\Components\Section::make('Bukti Pembayaran')
                ->description('Lihat bukti DP atau pelunasan yang sudah diunggah pelanggan.')
                ->schema([
                    Forms\Components\Placeholder::make('dp_proof_path')
                        ->label('Bukti DP')
                        ->content(fn (?Order $record) => $record?->dp_proof_path ? new \Illuminate\Support\HtmlString('<a href="/storage/'.$record->dp_proof_path.'" target="_blank" class="text-primary-600 underline font-bold">Lihat Bukti DP</a>') : '-'),
                    Forms\Components\Placeholder::make('final_payment_proof_path')
                        ->label('Bukti Pelunasan')
                        ->content(fn (?Order $record) => $record?->final_payment_proof_path ? new \Illuminate\Support\HtmlString('<a href="/storage/'.$record->final_payment_proof_path.'" target="_blank" class="text-primary-600 underline font-bold">Lihat Bukti Pelunasan</a>') : '-'),
                ])
                ->columns(2),

            Forms\Components\Section::make('Harga & Status')
                ->description('Atur ulang estimasi harga, pembayaran DP, pelunasan, dan status pesanan.')
                ->schema([
                    Forms\Components\TextInput::make('estimated_price')
                        ->label('Estimasi Harga/Total Biaya')
                        ->numeric()
                        ->prefix('Rp')
                        ->required(),
                    Forms\Components\TextInput::make('dp_amount')
                        ->label('Jumlah DP')
                        ->numeric()
                        ->prefix('Rp'),
                    Forms\Components\TextInput::make('final_payment_amount')
                        ->label('Jumlah Pelunasan')
                        ->numeric()
                        ->prefix('Rp'),
                    Forms\Components\Placeholder::make('sisa_tagihan')
                        ->label('Sisa Tagihan')
                        ->content(fn (?Order $record) => 'Rp ' . number_format(max(0, ($record?->estimated_price ?? 0) - ($record?->dp_amount ?? 0) - ($record?->final_payment_amount ?? 0)), 0, ',', '.')),
                    Forms\Components\Placeholder::make('status_lunas')
                        ->label('Status Pelunasan')
                        ->content(fn (?Order $record) => $record?->payment_status_label ?? '-'),
                    Forms\Components\Select::make('status')
                        ->label('Status Pesanan')
                        ->options([
                            'pending'     => 'Menunggu Konfirmasi',
                            'dp_uploaded' => 'DP Diupload',
                            'confirmed'   => 'Dikonfirmasi',
                            'in_progress' => 'Sedang Diproses',
                            'completed'   => 'Selesai',
                            'cancelled'   => 'Dibatalkan',
                            'rejected'    => 'Ditolak',
                        ])
                        ->required()
                        ->reactive(),
                    Forms\Components\Textarea::make('rejected_reason')
                        ->label('Alasan Penolakan')
                        ->visible(fn (callable $get) => $get('status') === 'rejected')
                        ->required(fn (callable $get) => $get('status') === 'rejected')
                        ->columnSpanFull(),
                ])
                ->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->label('No. Pesanan')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Pelanggan')
                    ->searchable(),
                Tables\Columns\TextColumn::make('method')
                    ->label('Layanan')
                    ->badge()
                    ->color(fn ($state) => match($state) {
                        'home_service' => 'primary',
                        'visit'        => 'success',
                        default        => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => $state === 'home_service' ? 'Home Service' : 'Booking ke Toko'),
                Tables\Columns\TextColumn::make('estimated_price')
                    ->label('Total Biaya')
                    ->money('IDR', locale: 'id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('dp_amount')
                    ->label('Jumlah DP')
                    ->money('IDR', locale: 'id')
                    ->getStateUsing(fn (Order $record) => $record->dp_amount),
                Tables\Columns\TextColumn::make('final_payment_amount')
                    ->label('Pelunasan')
                    ->money('IDR', locale: 'id')
                    ->getStateUsing(fn (Order $record) => $record->final_payment_amount),
                Tables\Columns\TextColumn::make('sisa_tagihan')
                    ->label('Sisa Tagihan')
                    ->getStateUsing(fn (Order $record) => max(0, $record->estimated_price - $record->dp_amount - $record->final_payment_amount))
                    ->money('IDR', locale: 'id'),
                Tables\Columns\BadgeColumn::make('payment_status')
                    ->label('Status Pelunasan')
                    ->getStateUsing(fn (Order $record) => $record->payment_status)
                    ->colors([
                        'gray'    => 'belum_ada',
                        'warning' => 'dp_diunggah',
                        'info'    => 'belum_lunas',
                        'success' => 'lunas',
                    ])
                    ->formatStateUsing(fn ($state) => match($state) {
                        'belum_ada'   => 'Belum Ada Pembayaran',
                        'dp_diunggah' => 'DP Diunggah',
                        'belum_lunas' => 'Belum Lunas (Ada Sisa)',
                        'lunas'       => 'Lunas ✅',
                        default       => $state,
                    }),
                Tables\Columns\ImageColumn::make('dp_proof_path')
                    ->label('Bukti DP')
                    ->getStateUsing(fn (Order $record) => $record->payments->where('type', 'dp')->first()?->proof_path ?? $record->dp_proof_path)
                    ->disk('public')
                    ->rounded(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('payment_status_filter')
                    ->label('Status Pelunasan')
                    ->options([
                        'belum_ada'   => 'Belum Ada Pembayaran',
                        'dp_diunggah' => 'DP Diunggah',
                        'belum_lunas' => 'Belum Lunas',
                        'lunas'       => 'Lunas',
                    ])
                    ->query(function ($query, array $data) {
                        if (empty($data['value'])) return $query;
                        return match($data['value']) {
                            'belum_ada'   => $query->whereDoesntHave('payments'),
                            'dp_diunggah' => $query->whereHas('payments', fn($q) => $q->where('type', 'dp'))->whereDoesntHave('payments', fn($q) => $q->where('type', 'final')),
                            'belum_lunas' => $query->whereHas('payments', fn($q) => $q->where('type', 'final'))->whereRaw('estimated_price > 0')->whereRaw('(SELECT COALESCE(SUM(amount),0) FROM payments WHERE order_id=orders.id) < estimated_price'),
                            'lunas'       => $query->whereHas('payments', fn($q) => $q->where('type', 'final'))->whereRaw('(SELECT COALESCE(SUM(amount),0) FROM payments WHERE order_id=orders.id) >= estimated_price'),
                            default       => $query,
                        };
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Ubah Status')
                    ->icon('heroicon-o-pencil')
                    ->modalWidth('xl')
                    ->using(function (Order $record, array $data): Order {
                        $record->update([
                            'status' => $data['status'],
                            'estimated_price' => $data['estimated_price'] ?? $record->estimated_price,
                            'rejected_reason' => $data['status'] === 'rejected' ? $data['rejected_reason'] : null,
                        ]);

                        if (array_key_exists('dp_amount', $data) && $data['dp_amount'] !== null) {
                            $dp = $record->payments()->where('type', 'dp')->first();
                            if ($dp) {
                                $dp->update(['amount' => $data['dp_amount']]);
                            } elseif ($data['dp_amount'] > 0) {
                                $record->payments()->create([
                                    'type' => 'dp',
                                    'amount' => $data['dp_amount'],
                                    'payment_method' => 'manual',
                                    'status' => 'verified',
                                    'verified_at' => Carbon::now(),
                                ]);
                            }
                        }

                        if (array_key_exists('dp_proof_path', $data) && $data['dp_proof_path']) {
                            $dp = $record->payments()->where('type', 'dp')->first();
                            if ($dp) {
                                $dp->update(['proof_path' => $data['dp_proof_path']]);
                            } else {
                                $record->payments()->create([
                                    'type' => 'dp',
                                    'amount' => $data['dp_amount'] ?? 0,
                                    'payment_method' => 'manual',
                                    'proof_path' => $data['dp_proof_path'],
                                    'status' => 'verified',
                                    'verified_at' => Carbon::now(),
                                ]);
                            }
                        }

                        if (array_key_exists('final_payment_amount', $data) && $data['final_payment_amount'] !== null) {
                            $final = $record->payments()->where('type', 'final')->first();
                            if ($final) {
                                $final->update(['amount' => $data['final_payment_amount']]);
                            } elseif ($data['final_payment_amount'] > 0) {
                                $record->payments()->create([
                                    'type' => 'final',
                                    'amount' => $data['final_payment_amount'],
                                    'payment_method' => 'manual',
                                    'status' => 'verified',
                                    'verified_at' => Carbon::now(),
                                ]);
                            }
                        }

                        return $record->refresh();
                    }),

                // Catat DP Manual (untuk Booking ke Toko atau jika admin mau input langsung)
                Tables\Actions\Action::make('catat_dp')
                    ->label('Catat DP')
                    ->icon('heroicon-o-plus-circle')
                    ->color('warning')
                    ->modalHeading('Catat Pembayaran DP')
                    ->modalDescription('Input nominal DP yang diterima dari pelanggan.')
                    ->modalWidth('md')
                    ->visible(fn (Order $record) => $record->payment_status === 'belum_ada')
                    ->form([
                        Forms\Components\TextInput::make('dp_amount')
                            ->label('Nominal DP')
                            ->numeric()
                            ->prefix('Rp')
                            ->required(),
                        Forms\Components\FileUpload::make('proof_path')
                            ->label('Bukti Pembayaran (Opsional)')
                            ->image()
                            ->directory('dp_proofs'),
                    ])
                    ->action(function (Order $record, array $data) {
                        $record->payments()->create([
                            'type'           => 'dp',
                            'amount'         => $data['dp_amount'],
                            'payment_method' => 'manual',
                            'proof_path'     => $data['proof_path'] ?? null,
                            'status'         => 'verified',
                            'verified_at'    => Carbon::now(),
                        ]);
                        if ($record->status === 'pending') {
                            $record->update(['status' => 'dp_uploaded']);
                        }
                        Notification::make()->title('DP berhasil dicatat!')->success()->send();
                    }),

                // Catat Pelunasan
                Tables\Actions\Action::make('catat_pelunasan')
                    ->label('Catat Pelunasan')
                    ->icon('heroicon-o-banknotes')
                    ->color('success')
                    ->modalHeading('Catat Pembayaran Pelunasan')
                    ->modalWidth('md')
                    ->visible(fn (Order $record) => in_array($record->payment_status, ['dp_diunggah', 'belum_lunas']) && $record->estimated_price > 0)
                    ->form(function (Order $record) {
                        $sisa = max(0, $record->estimated_price - $record->dp_amount - $record->final_payment_amount);
                        return [
                            Forms\Components\Placeholder::make('info_sisa')
                                ->label('Sisa Tagihan')
                                ->content('Rp ' . number_format($sisa, 0, ',', '.')),
                            Forms\Components\TextInput::make('final_payment_amount')
                                ->label('Nominal Pelunasan')
                                ->numeric()
                                ->required()
                                ->prefix('Rp')
                                ->default($sisa),
                            Forms\Components\FileUpload::make('final_payment_proof_path')
                                ->label('Bukti Pembayaran (Opsional)')
                                ->image()
                                ->directory('final_payments'),
                        ];
                    })
                    ->action(function (Order $record, array $data) {
                        $existing = $record->payments()->where('type', 'final')->first();
                        if ($existing) {
                            $existing->update([
                                'amount'     => $existing->amount + $data['final_payment_amount'],
                                'proof_path' => $data['final_payment_proof_path'] ?? $existing->proof_path,
                                'status'     => 'verified',
                                'verified_at' => Carbon::now(),
                            ]);
                        } else {
                            $record->payments()->create([
                                'type'           => 'final',
                                'amount'         => $data['final_payment_amount'],
                                'payment_method' => 'manual',
                                'proof_path'     => $data['final_payment_proof_path'] ?? null,
                                'status'         => 'verified',
                                'verified_at'    => Carbon::now(),
                            ]);
                        }

                        // Siapkan Link WhatsApp jika lunas
                        $record->refresh();
                        if ($record->is_fully_paid && $record->user?->phone_wa) {
                            $waService = app(\App\Services\WhatsAppService::class);
                            $nom = number_format($data['final_payment_amount'], 0, ',', '.');
                            $msg = "Halo {$record->user->name} 💵\n"
                                 . "Terima kasih, pembayaran pelunasan sebesar *Rp {$nom}* untuk pesanan #{$record->id} telah kami terima.\n"
                                 . "Pesanan Anda kini berstatus LUNAS. Terima kasih! ✨";
                            
                            $url = $waService->generateWaLink($record->user->phone_wa, $msg);
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
                            Notification::make()
                                ->title($record->is_fully_paid ? 'Pelunasan berhasil! Pesanan kini LUNAS ✅' : 'Pembayaran sebagian dicatat.')
                                ->success()
                                ->send();
                        }
                    }),
            ])
            ->bulkActions([])
            ->defaultSort('updated_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPaymentStatus::route('/'),
        ];
    }

    public static function canCreate(): bool { return false; }
    public static function canDelete(\Illuminate\Database\Eloquent\Model $record): bool { return false; }
}
