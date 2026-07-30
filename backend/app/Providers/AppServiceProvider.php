<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        VerifyEmail::toMailUsing(function ($notifiable) {
            $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
            $verifyUrl = $frontendUrl . '/verify-email?id=' . $notifiable->getKey()
                . '&hash=' . sha1($notifiable->getEmailForVerification());

            return (new MailMessage)
                ->subject('Verifikasi Alamat Email - Era Jahit')
                ->greeting('Halo, ' . $notifiable->name . '!')
                ->line('Terima kasih telah mendaftar di Era Jahit. Silakan klik tombol di bawah untuk memverifikasi alamat email Anda.')
                ->action('Verifikasi Email', $verifyUrl)
                ->line('Jika Anda tidak merasa membuat akun ini, abaikan email ini.');
        });

        ResetPassword::toMailUsing(function ($notifiable, $token) {
            $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
            $resetUrl = $frontendUrl . '/reset-password?token=' . $token
                . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

            return (new MailMessage)
                ->subject('Reset Kata Sandi - Era Jahit')
                ->greeting('Halo, ' . $notifiable->name . '!')
                ->line('Kami menerima permintaan untuk mereset kata sandi akun Anda. Klik tombol di bawah untuk membuat kata sandi baru.')
                ->action('Reset Kata Sandi', $resetUrl)
                ->line('Tautan ini akan kedaluwarsa dalam 60 menit.')
                ->line('Jika Anda tidak meminta reset kata sandi, abaikan email ini.');
        });
    }
}
