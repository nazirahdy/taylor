<?php

namespace App\Livewire\Owner;

use App\Models\Order;
use App\Models\Payment;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Tables\Columns\Summarizers\Summarizer;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Livewire\Component;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Forms\Components\DatePicker;
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
                TextColumn::make('estimated_price')
                    ->label('Estimasi Harga')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format((float) ($state ?? 0), 0, ',', '.'))
                    ->sortable(),
                TextColumn::make('dp_amount')
                    ->label('Total DP')
                    ->getStateUsing(fn (Order $record) => $record->dp_amount)
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format((float) ($state ?? 0), 0, ',', '.')),
                TextColumn::make('final_payment_amount')
                    ->label('Pelunasan')
                    ->getStateUsing(fn (Order $record) => $record->final_payment_amount)
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format((float) ($state ?? 0), 0, ',', '.')),
                TextColumn::make('total_paid')
                    ->label('Total Dibayar')
                    ->getStateUsing(fn (Order $record) => $record->dp_amount + $record->final_payment_amount)
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format((float) ($state ?? 0), 0, ',', '.'))
                    ->summarize(
                        Summarizer::make()
                            ->label('Total Omzet')
                            ->using(function (QueryBuilder $query) {
                                $orderIds = (clone $query)->pluck('id');
                                $total = Payment::whereIn('order_id', $orderIds)->sum('amount');

                                return 'Rp ' . number_format((float) $total, 0, ',', '.');
                            })
                    ),
                TextColumn::make('remaining_bill')
                    ->label('Sisa Tagihan')
                    ->getStateUsing(fn (Order $record) => max(0, (float) $record->estimated_price - ($record->dp_amount + $record->final_payment_amount)))
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format((float) ($state ?? 0), 0, ',', '.')),
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
                        'lunas'       => 'Lunas',
                        'belum_lunas' => 'Belum Lunas',
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        if (empty($data['value']) || $data['value'] === 'semua') return $query;
                        if ($data['value'] === 'lunas') {
                            return $query->whereRaw('estimated_price > 0 AND (select coalesce(sum(amount), 0) from payments where order_id = orders.id) >= estimated_price');
                        }
                        if ($data['value'] === 'belum_lunas') {
                            return $query->whereRaw('estimated_price <= 0 OR (select coalesce(sum(amount), 0) from payments where order_id = orders.id) < estimated_price');
                        }
                        return $query;
                    }),
            ])
            ->filtersTriggerAction(
                fn (TableAction $action) => $action
                    ->label('Filter')
                    ->icon('heroicon-o-funnel')
            )
            ->headerActions([
                TableAction::make('export_pdf')
                    ->label('Export PDF')
                    ->color('danger')
                    ->icon('heroicon-o-document-arrow-down')
                    ->action(function ($livewire) {
                        $filters = $livewire->tableFilters ?? [];
                        $params = http_build_query(array_filter([
                            'type'       => 'pelunasan',
                            'format'     => 'pdf',
                            'start_date' => $filters['created_at']['created_from'] ?? null,
                            'end_date'   => $filters['created_at']['created_until'] ?? null,
                            'status'     => $filters['payment_status_filter']['value'] ?? 'semua',
                        ]));
                        $url = route('export.reports') . '?' . $params;
                        $livewire->js("window.open('{$url}', '_blank')");
                    }),
                TableAction::make('export_excel')
                    ->label('Export Excel')
                    ->color('success')
                    ->icon('heroicon-o-document-arrow-down')
                    ->action(function ($livewire) {
                        $filters = $livewire->tableFilters ?? [];
                        $params = http_build_query(array_filter([
                            'type'       => 'pelunasan',
                            'format'     => 'excel',
                            'start_date' => $filters['created_at']['created_from'] ?? null,
                            'end_date'   => $filters['created_at']['created_until'] ?? null,
                            'status'     => $filters['payment_status_filter']['value'] ?? 'semua',
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

