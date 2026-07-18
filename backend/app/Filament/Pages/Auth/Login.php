<?php

namespace App\Filament\Pages\Auth;

use Filament\Pages\Auth\Login as BaseLogin;
use Filament\Http\Responses\Auth\Contracts\LoginResponse;
use DanHarrin\LivewireRateLimiting\Exceptions\TooManyRequestsException;
use Filament\Facades\Filament;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Auth;

class Login extends BaseLogin
{
    /**
     * Override authenticate:
     * - Jika login sebagai OWNER di /admin/login:
     *   1. Auth via web guard sementara
     *   2. Redirect ke /owner-bridge (route biasa, bukan Livewire)
     *      yang akan switch ke guard 'owner' secara reliable, lalu ke /owner
     * - Jika login sebagai ADMIN, proses normal ke /admin.
     */
    public function authenticate(): ?LoginResponse
    {
        try {
            $this->rateLimit(5);
        } catch (TooManyRequestsException $exception) {
            Notification::make()
                ->title(__('filament-panels::pages/auth/login.notifications.throttled.title', [
                    'seconds' => $exception->secondsUntilAvailable,
                    'minutes' => ceil($exception->secondsUntilAvailable / 60),
                ]))
                ->danger()
                ->send();

            return null;
        }

        $data = $this->form->getState();
        $credentials = $this->getCredentialsFromFormData($data);
        $remember = $data['remember'] ?? false;

        // --- Cek apakah credentials milik OWNER ---
        // Coba auth via web guard dulu untuk verifikasi
        if (Auth::guard('web')->attempt($credentials, $remember)) {
            $user = Auth::guard('web')->user();

            if ($user->role === 'owner') {
                // Session sudah tersimpan via web guard.
                // Arahkan ke /owner-bridge yang akan switch guard & redirect ke /owner
                session()->regenerate();
                $this->redirect(route('owner.bridge'));
                return null;
            }

            // Bukan owner — cek akses admin
            $panel = Filament::getCurrentPanel();
            if ($panel && !$user->canAccessPanel($panel)) {
                Auth::guard('web')->logout();
                $this->throwFailureValidationException();
            }

            // Admin valid → login normal
            session()->regenerate();
            return app(LoginResponse::class);
        }

        // Credentials salah → tampil error
        $this->throwFailureValidationException();
    }
}
