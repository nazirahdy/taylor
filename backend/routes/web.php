<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/export/reports', [\App\Http\Controllers\ReportExportController::class, 'exportReport'])->name('export.reports')->middleware('auth:owner');

Route::get('/admin/activity-count', [\App\Http\Controllers\Admin\AdminActivityController::class, 'count'])
    ->middleware('auth:web')
    ->name('admin.activity-count');

/**
 * Route perantara: dipanggil setelah owner sukses auth via web guard.
 * Tugas route ini: switch ke owner guard, lalu redirect ke /owner dashboard.
 */
Route::get('/owner-bridge', function () {
    // Ambil user yang sudah login via web guard
    $user = Auth::guard('web')->user();

    if (!$user || $user->role !== 'owner') {
        Auth::guard('web')->logout();
        return redirect('/admin/login');
    }

    // Login ke guard 'owner'
    Auth::guard('owner')->login($user, true);

    // Logout dari guard 'web' supaya tidak bentrok
    Auth::guard('web')->logout();

    session()->regenerate();

    return redirect('/owner');
})->middleware('auth:web')->name('owner.bridge');
