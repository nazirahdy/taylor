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

    public static function canViewAny(): bool
    {
        return auth()->user()->role === 'admin';
    }

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
            ->modifyQueryUsing(fn (Builder $query) => $query
                ->whereIn('id', function ($sub) {
                    $sub->selectRaw('MAX(id)')
                        ->from('chat_messages')
                        ->groupByRaw('IFNULL(order_id, 0), IFNULL(session_id, "0")');
                })
                ->with('order', 'sender')
            )
            ->columns([
                Tables\Columns\TextColumn::make('nama_pelanggan')
                    ->label('Nama Pelanggan')
                    ->state(function (ChatMessage $record) {
                        // Cari pesan dari non-admin dalam sesi yang sama
                        $customerMsg = ChatMessage::where(function ($q) use ($record) {
                                if ($record->order_id) {
                                    $q->where('order_id', $record->order_id);
                                } else {
                                    $q->where('session_id', $record->session_id);
                                }
                            })
                            ->where(function ($q) {
                                $q->whereNull('sender_id')
                                  ->orWhereHas('sender', fn ($sq) => $sq->where('role', '!=', 'admin'));
                            })
                            ->whereRaw("LOWER(COALESCE(sender_name, '')) != 'admin'")
                            ->select('sender_id', 'sender_name')
                            ->first();

                        if ($customerMsg) {
                            if ($customerMsg->sender_id) {
                                return $customerMsg->sender->name ?? $customerMsg->sender_name;
                            }
                            return $customerMsg->sender_name ?: 'Tamu';
                        }

                        return 'Tamu';
                    })
                    ->searchable(query: function (Builder $query, string $search) {
                        $query->whereHas('sender', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                              ->orWhere('sender_name', 'like', "%{$search}%");
                    }),
                Tables\Columns\TextColumn::make('message')
                    ->label('Pesan')
                    ->limit(50)
                    ->wrap(),
                Tables\Columns\TextColumn::make('read_status')
                    ->label('Status Baca')
                    ->state(function (ChatMessage $record) {
                        // Count unread messages from non-admin senders in the same conversation
                        $unread = ChatMessage::where(function ($q) use ($record) {
                                if ($record->order_id) {
                                    $q->where('order_id', $record->order_id);
                                } else {
                                    $q->where('session_id', $record->session_id);
                                }
                            })
                            ->where('is_read', false)
                            ->where(function ($q) {
                                $q->whereNull('sender_id')
                                  ->orWhereHas('sender', fn ($sq) => $sq->where('role', '!=', 'admin'));
                            })
                            ->whereRaw("LOWER(COALESCE(sender_name, '')) != 'admin'")
                            ->count();

                        return $unread > 0 ? "Belum Dibaca ($unread)" : 'Sudah Dibaca';
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
                    ->modalHeading(function (ChatMessage $record) {
                        $customerMsg = ChatMessage::where(function ($q) use ($record) {
                                if ($record->order_id) {
                                    $q->where('order_id', $record->order_id);
                                } else {
                                    $q->where('session_id', $record->session_id);
                                }
                            })
                            ->where(function ($q) {
                                $q->whereNull('sender_id')
                                  ->orWhereHas('sender', fn ($sq) => $sq->where('role', '!=', 'admin'));
                            })
                            ->whereRaw("LOWER(COALESCE(sender_name, '')) != 'admin'")
                            ->select('sender_id', 'sender_name')
                            ->first();

                        if ($customerMsg) {
                            if ($customerMsg->sender_id) {
                                return 'Chat - ' . ($customerMsg->sender->name ?? $customerMsg->sender_name ?? 'Tamu');
                            }
                            return 'Chat - ' . ($customerMsg->sender_name ?: 'Tamu');
                        }

                        return 'Chat - Tamu';
                    })
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
