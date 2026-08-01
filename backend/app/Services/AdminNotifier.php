<?php

namespace App\Services;

use App\Models\User;
use Filament\Notifications\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Notification as NotificationFacade;

class AdminNotifier
{
    public static function notify(string $title, ?string $body = null, ?string $url = null, string $icon = 'heroicon-o-bell', string $status = 'info'): void
    {
        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            return;
        }

        $notification = Notification::make()
            ->title($title)
            ->icon($icon)
            ->status($status);

        if ($body) {
            $notification->body($body);
        }

        if ($url) {
            $notification->actions([
                // ->close() removes the notification (same mechanism as the dismiss
                // button), so once admin clicks through, it disappears from the list.
                Action::make('view')
                    ->label('Lihat')
                    ->url($url)
                    ->close()
                    ->button(),
            ]);
        }

        // sendToDatabase() would queue via ShouldQueue; sendNow() bypasses that so it
        // shows up immediately without needing a queue worker running.
        NotificationFacade::sendNow($admins, $notification->toDatabase());
    }
}
