<?php

namespace App\Livewire\Owner;

use App\Models\Payment;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Livewire\Component;
use Illuminate\Database\Eloquent\Builder;
use Filament\Tables\Filters\Filter;
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
                TextColumn::make('order.order_number')->label('No. Pesanan')->searchable()->sortable(),
                TextColumn::make('order.user.name')->searchable()->label('Pelanggan'),
                TextColumn::make('amount')->money('IDR', locale: 'id')->label('Nominal DP')->sortable(),
                TextColumn::make('status')->badge()
                    ->color(fn ($state) => match($state) {
                        'pending' => 'warning', 'verified' => 'success', 'rejected' => 'danger', default => 'gray',
                    }),
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
                    })
            ])
            ->headerActions([
                TableAction::make('export_pdf')
                    ->label('Export PDF')
                    ->color('danger')
                    ->icon('heroicon-o-document-arrow-down')
                    ->form([
                        DatePicker::make('start_date')->label('Dari Tanggal'),
                        DatePicker::make('end_date')->label('Sampai Tanggal'),
                    ])
                    ->action(function (array $data, $livewire) {
                        $params = http_build_query(array_filter([
                            'type'       => 'dp',
                            'format'     => 'pdf',
                            'start_date' => $data['start_date'] ?? null,
                            'end_date'   => $data['end_date'] ?? null,
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
                    ])
                    ->action(function (array $data, $livewire) {
                        $params = http_build_query(array_filter([
                            'type'       => 'dp',
                            'format'     => 'excel',
                            'start_date' => $data['start_date'] ?? null,
                            'end_date'   => $data['end_date'] ?? null,
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
