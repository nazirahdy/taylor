<?php

namespace App\Livewire\Owner;

use App\Models\Order;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Livewire\Component;
use Illuminate\Database\Eloquent\Builder;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Tables\Actions\Action as TableAction;

class LaporanPelunasanTable extends Component implements HasForms, HasTable
{
    use InteractsWithTable;
    use InteractsWithForms;

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::query()->with(['user', 'payments']))
            ->defaultSort('order_date', 'desc')
            ->columns([
                TextColumn::make('order_number')->label('No. Pesanan')->searchable()->sortable(),
                TextColumn::make('user.name')->searchable()->label('Pelanggan'),
                TextColumn::make('user.phone_wa')->searchable()->label('WhatsApp')->default('-'),
                TextColumn::make('estimated_price')->money('IDR', locale: 'id')->label('Estimasi Harga')->sortable(),
                TextColumn::make('dp_amount')
                    ->label('Total DP')
                    ->money('IDR', locale: 'id')
                    ->getStateUsing(fn (Order $record) => $record->dp_amount),
                TextColumn::make('final_payment_amount')
                    ->label('Pelunasan')
                    ->money('IDR', locale: 'id')
                    ->getStateUsing(fn (Order $record) => $record->final_payment_amount),
                TextColumn::make('total_paid')
                    ->label('Total Dibayar')
                    ->money('IDR', locale: 'id')
                    ->getStateUsing(fn (Order $record) => $record->dp_amount + $record->final_payment_amount),
                TextColumn::make('remaining_bill')
                    ->label('Sisa Tagihan')
                    ->money('IDR', locale: 'id')
                    ->getStateUsing(fn (Order $record) => max(0, (float) $record->estimated_price - ($record->dp_amount + $record->final_payment_amount))),
                TextColumn::make('payment_status')
                    ->label('Status Pelunasan')
                    ->badge()
                    ->color(fn (Order $record) => match($record->payment_status) {
                        'lunas'       => 'success',
                        'belum_lunas' => 'info',
                        'dp_diunggah' => 'warning',
                        default       => 'gray',
                    })
                    ->formatStateUsing(fn (Order $record) => $record->payment_status_label),
            ])
            ->filters([
                Filter::make('created_at')
                    ->form([
                        DatePicker::make('created_from')->label('Dari Tanggal'),
                        DatePicker::make('created_until')->label('Sampai Tanggal'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['created_from'], fn (Builder $query, $date): Builder => $query->whereDate('order_date', '>=', $date))
                            ->when($data['created_until'], fn (Builder $query, $date): Builder => $query->whereDate('order_date', '<=', $date));
                    }),
                SelectFilter::make('payment_status_filter')
                    ->label('Status Pelunasan')
                    ->options([
                        'semua'       => 'Semua Status',
                        'lunas'       => 'Lunas',
                        'belum_lunas' => 'Belum Lunas',
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        if (empty($data['value']) || $data['value'] === 'semua') return $query;
                        if ($data['value'] === 'lunas') {
                            return $query->whereRaw('estimated_price > 0 AND (select coalesce(sum(amount), 0) from payments where order_id = orders.id) >= estimated_price');
                        }
                        if ($data['value'] === 'belum_lunas') {
                            return $query->whereRaw('(select coalesce(sum(amount), 0) from payments where order_id = orders.id) < estimated_price');
                        }
                        return $query;
                    }),
            ])
            ->headerActions([
                TableAction::make('export_pdf')
                    ->label('Export PDF')
                    ->color('danger')
                    ->icon('heroicon-o-document-arrow-down')
                    ->form([
                        DatePicker::make('start_date')->label('Dari Tanggal'),
                        DatePicker::make('end_date')->label('Sampai Tanggal'),
                        Select::make('status')
                            ->label('Status Pelunasan')
                            ->options([
                                'semua'       => 'Semua',
                                'lunas'       => 'Lunas',
                                'belum_lunas' => 'Belum Lunas',
                            ])
                            ->default('semua'),
                    ])
                    ->action(function (array $data, $livewire) {
                        $params = http_build_query(array_filter([
                            'type'       => 'pelunasan',
                            'format'     => 'pdf',
                            'start_date' => $data['start_date'] ?? null,
                            'end_date'   => $data['end_date'] ?? null,
                            'status'     => $data['status'] ?? 'semua',
                        ]));
                        $url = route('export.reports') . '?' . $params;
                        $livewire->js("window.open('{$url}', '_blank')");
                    }),
                TableAction::make('export_excel')
                    ->label('Export Excel')
                    ->color('success')
                    ->icon('heroicon-o-document-arrow-down')
                    ->form([
                        DatePicker::make('start_date')->label('Dari Tanggal'),
                        DatePicker::make('end_date')->label('Sampai Tanggal'),
                        Select::make('status')
                            ->label('Status Pelunasan')
                            ->options([
                                'semua'       => 'Semua',
                                'lunas'       => 'Lunas',
                                'belum_lunas' => 'Belum Lunas',
                            ])
                            ->default('semua'),
                    ])
                    ->action(function (array $data, $livewire) {
                        $params = http_build_query(array_filter([
                            'type'       => 'pelunasan',
                            'format'     => 'excel',
                            'start_date' => $data['start_date'] ?? null,
                            'end_date'   => $data['end_date'] ?? null,
                            'status'     => $data['status'] ?? 'semua',
                        ]));
                        $url = route('export.reports') . '?' . $params;
                        $livewire->js("window.open('{$url}', '_blank')");
                    }),
            ]);
    }

    public function render()
    {
        return <<<'HTML'
        <div>
            {{ $this->table }}
        </div>
        HTML;
    }
}

