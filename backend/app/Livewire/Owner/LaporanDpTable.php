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

class LaporanDpTable extends Component implements HasForms, HasTable
{
    use InteractsWithTable;
    use InteractsWithForms;

    public function table(Table $table): Table
    {
        return $table
            ->query(Payment::query()->where('type', 'dp')->with(['order.user']))
            ->columns([
                TextColumn::make('order.order_number')->label('No. Pesanan')->searchable()->sortable()
                    ->summarize(
                        Summarizer::make()
                            ->label('Rangkuman DP')
                            ->using(fn () => '')
                    ),
                TextColumn::make('order.user.name')->searchable()->label('Pelanggan'),
                TextColumn::make('amount')->money('IDR', locale: 'id')->label('Nominal DP')->sortable()
                    ->summarize(
                        Summarizer::make()
                            ->label('Sudah Bayar DP')
                            ->using(function (QueryBuilder $query) {
                                $ids = (clone $query)->pluck('id');
                                return (string) Payment::whereIn('id', $ids)->where('status', 'verified')->count();
                            })
                    ),
                TextColumn::make('status')->badge()
                    ->color(fn ($state) => match($state) {
                        'pending' => 'warning', 'verified' => 'success', 'rejected' => 'danger', default => 'gray',
                    })
                    ->summarize(
                        Summarizer::make()
                            ->label('Belum Bayar DP')
                            ->using(function (QueryBuilder $query) {
                                $ids = (clone $query)->pluck('id');
                                return (string) Payment::whereIn('id', $ids)->where('status', '!=', 'verified')->count();
                            })
                    ),
                TextColumn::make('verified_at')->dateTime()->sortable()->label('Tgl Verifikasi'),
                TextColumn::make('created_at')->dateTime()->sortable()->label('Tgl Upload'),
            ])
            ->filters([
                Filter::make('created_at')
                    ->form([
                        DatePicker::make('created_from')->label('Dari Tanggal'),
                        DatePicker::make('created_until')->label('Sampai Tanggal'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['created_from'], fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date))
                            ->when($data['created_until'], fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date));
                    }),
                SelectFilter::make('dp_status_filter')
                    ->label('Status DP')
                    ->options([
                        'verified' => 'Sudah Bayar DP (Terverifikasi)',
                        'pending'  => 'Belum Bayar DP (Menunggu / Ditolak)',
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        if (empty($data['value']) || $data['value'] === 'semua') return $query;
                        if ($data['value'] === 'verified') {
                            return $query->where('status', 'verified');
                        }
                        if ($data['value'] === 'pending') {
                            return $query->where('status', '!=', 'verified');
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
                            'type'       => 'dp',
                            'format'     => 'pdf',
                            'start_date' => $filters['created_at']['created_from'] ?? null,
                            'end_date'   => $filters['created_at']['created_until'] ?? null,
                            'status'     => $filters['dp_status_filter']['value'] ?? 'semua',
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
                            'type'       => 'dp',
                            'format'     => 'excel',
                            'start_date' => $filters['created_at']['created_from'] ?? null,
                            'end_date'   => $filters['created_at']['created_until'] ?? null,
                            'status'     => $filters['dp_status_filter']['value'] ?? 'semua',
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
