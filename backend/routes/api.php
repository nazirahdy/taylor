<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\QuotaController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\MeasurementController;
use Illuminate\Support\Facades\Route;

// =====================
// PUBLIC ROUTES
// =====================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public gallery
Route::get('/gallery', [GalleryController::class, 'index']);

// Public chat widget for guest messages
Route::get('/chat', [ChatController::class, 'guestIndex']);
Route::post('/chat', [ChatController::class, 'guestStore']);

// Quota availability (public so order form can check before auth)
Route::get('/quota', [QuotaController::class, 'index']);


// Global Home Service settings (DP amount)
Route::get('/home-service-settings', function () {
    $settings = \App\Models\HomeServiceSetting::first();
    return response()->json([
        'status' => 'success',
        'data' => $settings
    ]);
});

// Order tracking (public - accessible by order id)
Route::get('/orders/{id}/track', [OrderController::class, 'track']);

// =====================
// PROTECTED ROUTES
// =====================
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Measurements (CRUD)
    Route::get('/measurements', [MeasurementController::class, 'show']);
    Route::post('/measurements', [MeasurementController::class, 'store']);
    Route::put('/measurements', [MeasurementController::class, 'update']);
    Route::delete('/measurements', [MeasurementController::class, 'destroy']);

    // Orders
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/dp', [OrderController::class, 'uploadDp']);
    
    // Admin order management
    Route::middleware('role:admin')->group(function () {
        Route::post('/orders/{id}/confirm', [OrderController::class, 'confirm']);
        Route::post('/orders/{id}/reject', [OrderController::class, 'reject']);
        Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    });

    // Progress logs (admin adds, user views)
    Route::get('/orders/{orderId}/progress', [ProgressController::class, 'index']);
    Route::post('/orders/{orderId}/progress', [ProgressController::class, 'store']);
    
    // Admin complete order
    Route::middleware('role:admin')->group(function () {
        Route::post('/orders/{orderId}/complete', [ProgressController::class, 'complete']);
    });

    // Chat per order
    Route::get('/orders/{orderId}/chat', [ChatController::class, 'index']);
    Route::post('/orders/{orderId}/chat', [ChatController::class, 'store']);

    // Quota lock
    Route::post('/quotas/lock', [QuotaController::class, 'lock']);

    // Quota management
    Route::middleware('role:admin')->group(function () {
        Route::get('/quotas/{date}', [QuotaController::class, 'show']);
        Route::put('/quotas/{date}', [QuotaController::class, 'update']);
        Route::get('/quota-closures', [QuotaController::class, 'closures']);
        Route::post('/quota-closures', [QuotaController::class, 'storeClosure']);
        Route::put('/quota-closures/{id}', [QuotaController::class, 'updateClosure']);
        Route::delete('/quota-closures/{id}', [QuotaController::class, 'deleteClosure']);
    });
});

