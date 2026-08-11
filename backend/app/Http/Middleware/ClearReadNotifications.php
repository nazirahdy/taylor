<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClearReadNotifications
{
    /**
     * Secara otomatis menandai notifikasi Filament sebagai "dibaca" (read)
     * apabila admin mengunjungi halaman URL tujuan dari notifikasi tersebut.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $user = Auth::guard('web')->user() ?? Auth::guard('owner')->user();

        if ($user && method_exists($user, 'unreadNotifications')) {
            // Gunakan ->get() agar tidak melakukan caching pada relasi model User
            // yang dapat merusak fitur polling notifikasi bawaan Filament.
            $unread = $user->unreadNotifications()->get();

            if ($unread->isNotEmpty()) {
                $currentPath = $request->path(); 
                
                // Jangan jalankan pada request livewire (polling dsb)
                if ($currentPath === 'livewire/update') {
                    return $response;
                }
                
                foreach ($unread as $notification) {
                    $actions = $notification->data['actions'] ?? [];
                    foreach ($actions as $action) {
                        $actionUrl = $action['url'] ?? '';
                        if ($actionUrl) {
                            $parsedPath = parse_url($actionUrl, PHP_URL_PATH);
                            if ($parsedPath) {
                                $parsedPath = ltrim($parsedPath, '/');
                                // Jika URL tujuan pada notifikasi sama dengan URL halaman yang dibuka saat ini
                                if ($parsedPath === $currentPath) {
                                    $notification->markAsRead();
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        return $response;
    }
}
