<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\QuotaController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\MeasurementController;
use Illuminate\Support\Facades\Route;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Google OAuth
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Email Verification
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
Route::post('/email/resend-public', [AuthController::class, 'resendEmailVerificationPublic']);

// Forgot / Reset Password
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


Route::get('/gallery', [GalleryController::class, 'index']);


Route::get('/chat', [ChatController::class, 'guestIndex']);
Route::post('/chat', [ChatController::class, 'guestStore']);
Route::get('/chat/admin-status', [ChatController::class, 'adminStatus']);


Route::get('/quota', [QuotaController::class, 'index']);



Route::get('/home-service-settings', function () {
    $settings = \App\Models\HomeServiceSetting::first();
    return response()->json([
        'status' => 'success',
        'data' => $settings
    ]);
});


Route::get('/orders/{id}/track', [OrderController::class, 'track']);

// =====================
// PROTECTED ROUTES
// =====================
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'updatePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/resend', [AuthController::class, 'resendEmailVerification']);


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

