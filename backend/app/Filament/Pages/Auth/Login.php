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


        if (Auth::guard('web')->attempt($credentials, $remember)) {
            $user = Auth::guard('web')->user();

            if ($user->role === 'owner') {
                session()->regenerate();
                $this->redirect(route('owner.bridge'));
                return null;
            }

            if ($user->role === 'admin') {
                $panel = Filament::getCurrentPanel();
                if ($panel && $panel->getId() === 'owner') {
                    session()->regenerate();
                    $this->redirect('/admin');
                    return null;
                }
            }

            $panel = Filament::getCurrentPanel();
            if ($panel && !$user->canAccessPanel($panel)) {
                Auth::guard('web')->logout();
                $this->throwFailureValidationException();
            }

            session()->regenerate();
            return app(LoginResponse::class);
        }

        
        $this->throwFailureValidationException();
    }
}
