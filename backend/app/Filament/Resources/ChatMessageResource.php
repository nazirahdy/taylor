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
                        ->groupByRaw('COALESCE(order_id, 0), COALESCE(session_id, "0")');
                })
                ->with(['order.user', 'sender'])
            )
            ->columns([
                Tables\Columns\TextColumn::make('nama_pelanggan')
                    ->label('Name')
                    ->state(function (ChatMessage $record) {
                        if ($record->sender && $record->sender->role !== 'admin') {
                            return $record->sender->name;
                        }
                        if ($record->order && $record->order->user) {
                            return $record->order->user->name;
                        }
                        if ($record->sender_name && strtolower($record->sender_name) !== 'admin') {
                            return $record->sender_name;
                        }
                        return 'Pelanggan';
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
                    ->state(fn (ChatMessage $record) => $record->is_read ? 'Sudah Dibaca' : 'Belum Dibaca')
                    ->badge()
                    ->color(fn ($state) => $state === 'Belum Dibaca' ? 'danger' : 'success'),
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
                        $name = null;
                        if ($record->sender && $record->sender->role !== 'admin') {
                            $name = $record->sender->name;
                        } elseif ($record->order && $record->order->user) {
                            $name = $record->order->user->name;
                        } elseif ($record->sender_name && strtolower($record->sender_name) !== 'admin') {
                            $name = $record->sender_name;
                        }

                        if (!$name && $record->order_id) {
                            $order = \App\Models\Order::with('user')->find($record->order_id);
                            if ($order?->user) {
                                $name = $order->user->name;
                            }
                        }

                        if (!$name && $record->session_id) {
                            $customerMsg = ChatMessage::where('session_id', $record->session_id)
                                ->where(function ($q) {
                                    $q->whereHas('sender', fn ($sq) => $sq->where('role', '!=', 'admin'))
                                      ->orWhereNull('sender_id');
                                })
                                ->with('sender')
                                ->first();

                            if ($customerMsg?->sender) {
                                $name = $customerMsg->sender->name;
                            } elseif ($customerMsg?->sender_name && strtolower($customerMsg->sender_name) !== 'admin') {
                                $name = $customerMsg->sender_name;
                            }
                        }

                        if (!$name) {
                            $name = 'Pelanggan';
                        }

                        $initial = strtoupper(substr($name, 0, 1));

                        return new \Illuminate\Support\HtmlString("
                            <div class=\"flex items-center gap-3\">
                                <div class=\"w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0\" style=\"background-color: #79D12A;\">
                                    {$initial}
                                </div>
                                <div class=\"flex flex-col text-left\">
                                    <span class=\"font-bold text-base text-gray-900 leading-tight\">{$name}</span>
                                    <span class=\"text-[10px] text-gray-500 font-normal uppercase tracking-wider\">Pelanggan</span>
                                </div>
                            </div>
                        ");
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
        $count = ChatMessage::unreadFromCustomersCount();

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
