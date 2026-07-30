<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $target;
    protected $message;
    

    public $tries = 3;

    /**
     * Create a new job instance.
     *
     * @param string $target Nomor HP Pelanggan
     * @param string $message Isi Pesan
     */
    public function __construct(string $target, string $message)
    {
        $this->target = $target;
        $this->message = $message;
    }

    
    public function handle()
    {
        $token = env('FONNTE_TOKEN');

        if (empty($token)) {
            Log::error('Fonnte API Token belum terisi. Konfigurasi ulang .env Anda.');
            return;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token
            ])->post('https://api.fonnte.com/send', [
                'target'      => $this->target,
                'message'     => $this->message,
                'countryCode' => '62',
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp berhasil dikirim ke {$this->target}", ['response' => $response->json()]);
            } else 
            {
                Log::error("Fonnte API Gagal. Response error:", ['body' => $response->body()]);
                 throw new \Exception("Request Failed: " . $response->body());
            }

        } catch (Throwable $e)
            {
            Log::error('Koneksi Queue ke Fonnte terputus.', ['error' => $e->getMessage()]);
              throw $e;
            }
    }
}
