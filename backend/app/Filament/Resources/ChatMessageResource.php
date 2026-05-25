<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ChatMessageResource\Pages;
use App\Models\ChatMessage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ChatMessageResource extends Resource
{
    protected static ?string $model = ChatMessage::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationLabel = 'Semua Chat';
    protected static ?string $pluralLabel = 'Semua Chat';
    protected static ?string $navigationGroup = 'Komunikasi';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('order_id')
                    ->relationship('order', 'id')
                    ->label('ID Pesanan')
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('sender_id')
                    ->relationship('sender', 'name')
                    ->label('Pengirim')
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\Textarea::make('message')
                    ->label('Isi Pesan')
                    ->required()
                    ->columnSpanFull(),
                Forms\Components\Toggle::make('is_read')
                    ->label('Sudah Dibaca')
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->whereIn('id', function ($sub) {
                $sub->selectRaw('MAX(id)')
                    ->from('chat_messages')
                    ->groupByRaw('IFNULL(order_id, 0), IFNULL(session_id, "0")');
            }))
            ->columns([
                Tables\Columns\TextColumn::make('order.id')
                    ->label('Order ID')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('sender.name')
                    ->label('Pengirim')
                    ->sortable()
                    ->searchable()
                    ->formatStateUsing(fn ($state, $record) => $state ?: $record->sender_name),
                Tables\Columns\TextColumn::make('message')
                    ->label('Pesan')
                    ->limit(50)
                    ->wrap(),
                Tables\Columns\TextColumn::make('read_status')
                    ->label('Status Baca')
                    ->state(function (ChatMessage $record) {
                        $unread = ChatMessage::where(function($q) use ($record) {
                                if ($record->order_id) $q->where('order_id', $record->order_id);
                                else $q->where('session_id', $record->session_id);
                            })
                            ->where('is_read', false)
                            ->get()
                            ->filter(fn($msg) => !$msg->is_admin)
                            ->count();
                            
                        if ($unread > 0) {
                            return "Belum Dibaca ($unread)";
                        }
                        return 'Sudah Dibaca';
                    })
                    ->badge()
                    ->color(fn ($state) => str_contains($state, 'Belum Dibaca') ? 'danger' : 'success'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Waktu')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_read')
                    ->label('Status Baca'),
            ])
            ->actions([
                Action::make('view')
                    ->label('Lihat Chat')
                    ->icon('heroicon-o-chat-bubble-left-ellipsis')
                    ->modalContent(function (ChatMessage $record) {
                        return view('filament.chat-modal-wrapper', [
                            'record' => $record,
                        ]);
                    })
                    ->modalHeading(fn (ChatMessage $record) => 'Sesi - ' . ($record->order_id ?: $record->session_id))
                    ->modalSubmitAction(false)
                    ->modalCancelAction(false)
                    ->modalWidth('3xl'),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::where('is_read', false)
            ->where(function ($query) {
                $query->whereNull('sender_id')
                      ->orWhereHas('sender', function ($q) {
                          $q->where('role', '!=', 'admin');
                      });
            })
            ->count();
            
        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListChatMessages::route('/'),
        ];
    }
}
