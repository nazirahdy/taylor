<?php

namespace App\Filament\Resources\OrderResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use App\Models\ProgressLog;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class ProgressLogsRelationManager extends RelationManager
{
    protected static string $relationship = 'progressLogs';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('stage')
                    ->required()
                    ->label('Tahapan')
                    ->options(ProgressLog::STAGE_LABELS),
                Forms\Components\Textarea::make('description')
                    ->label('Keterangan')
                    ->maxLength(65535),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('stage')
            ->columns([
                Tables\Columns\TextColumn::make('stage')
                    ->formatStateUsing(fn (ProgressLog $record) => $record->stage_label),
                Tables\Columns\TextColumn::make('description')->limit(50),
                Tables\Columns\TextColumn::make('notified_at')
                    ->label('WA Terkirim')
                    ->dateTime(),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->mutateFormDataUsing(function (array $data): array {
                        $data['updated_by'] = Auth::id();
                        $data['notified_at'] = Carbon::now();
                        return $data;
                    })
                    ->after(function ($record, $livewire) {
                        // Sinkronkan status pesanan dengan tahap yang baru dicatat
                        $order = $record->order;
                        $order->update(['status' => $record->stage]);

                        if ($order->user?->phone_wa) {
                            $wa = new WhatsAppService();

                            $url = $wa->generateWaLink(
                                $order->user->phone_wa,
                                $wa->getMessageProgressUpdate($order, $record->stage_label, $record->description ?? '')
                            );
                            
                            $livewire->js("window.open('{$url}', '_blank')");

                            \Filament\Notifications\Notification::make()
                                ->title('Progres Tercatat! ✅')
                                ->body('Progres berhasil dicatat dan dialihkan ke WhatsApp, silakan klik kirim.')
                                ->success()
                                ->send();
                        }
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
