<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TrackAdminActivity
{
    /**
     * Catat waktu aktivitas terakhir admin/owner, dipakai untuk status "Online" di chat widget.
     * Hanya update tiap 1 menit sekali (bukan tiap request) supaya tidak membebani database.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user() ?? Auth::guard('owner')->user();

        if ($user && (!$user->last_active_at || $user->last_active_at->lt(now()->subMinute()))) {
            $user->forceFill(['last_active_at' => now()])->saveQuietly();
        }

        return $next($request);
    }
}
