<?php

namespace App\Filament\Resources\OrderResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class ChatMessagesRelationManager extends RelationManager
{
    protected static string $relationship = 'chatMessages';

    protected static ?string $title = 'Diskusi Chat';

    protected static ?string $modelLabel = 'Pesan';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Textarea::make('message')
                    ->label('Pesan')
                    ->required()
                    ->placeholder('Tulis pesan balasan untuk pelanggan...')
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('message')
            ->columns([
                Tables\Columns\TextColumn::make('sender.name')
                    ->label('Pengirim')
                    ->badge()
                    ->color(fn ($record) => $record->sender->role === 'admin' ? 'primary' : 'gray'),
                Tables\Columns\TextColumn::make('message')
                    ->label('Isi Pesan')
                    ->wrap(),
                Tables\Columns\IconColumn::make('is_read')
                    ->label('Dibaca')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Waktu')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Kirim Pesan')
                    ->modalHeading('Kirim Pesan ke Pelanggan')
                    ->icon('heroicon-o-paper-airplane')
                    ->createAnother(false)
                    ->mutateFormDataUsing(function (array $data): array {
                        $data['sender_id'] = Auth::id();
                        $data['is_read'] = false;
                        return $data;
                    })
                    ->after(function () {
                        // Mark customer messages as read when admin opens the chat/replies
                        $this->getOwnerRecord()->chatMessages()
                            ->where('sender_id', '!=', Auth::id())
                            ->update(['is_read' => true]);
                    }),
            ])
            ->actions([
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
