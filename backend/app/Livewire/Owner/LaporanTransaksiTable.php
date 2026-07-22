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
use Filament\Forms\Components\DatePicker;
use Filament\Actions\Action;
use Filament\Tables\Actions\Action as TableAction;
use Filament\Tables\Actions\HeaderActionsPosition;

class LaporanTransaksiTable extends Component implements HasForms, HasTable
{
    use InteractsWithTable;
    use InteractsWithForms;

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::query())
            ->columns([
                TextColumn::make('order_number')->label('No. Pesanan')->searchable()->sortable(),
                TextColumn::make('user.name')->searchable()->label('Pelanggan'),
                TextColumn::make('method')->badge()
                    ->color(fn ($state) => match($state) {
                        'home_service' => 'primary', 'visit' => 'success', default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => $state === 'home_service' ? 'Home Service' : 'Booking ke Toko'),
                TextColumn::make('status')->badge()
                    ->color(fn ($state) => match($state) {
                        'pending' => 'info', 'confirmed' => 'success', 'in_progress' => 'warning',
                        'completed' => 'success', 'rejected' => 'danger', 'cancelled' => 'gray', default => 'gray',
                    }),
                TextColumn::make('estimated_price')->money('IDR', locale: 'id')->label('Total Harga')->sortable(),
                TextColumn::make('order_date')->date()->sortable()->label('Tgl Pesan'),
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
                            'type'       => 'transaksi',
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
                            'type'       => 'transaksi',
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
