<?php
 
namespace App\Services;
 
class WhatsAppService
{
    const ADMIN_PHONE = '081267976080';
    const WEBSITE_NAME = 'Era Jahit Studio';
    const DASHBOARD_URL = 'https://www.erajahit.cloud/dashboard';

    protected static array $sentNotifications = [];

    public function messageFooter(): string
    {
        return "\n\n>> Cek riwayat & progres pesanan Anda kapan saja di *" . self::WEBSITE_NAME . "*:\n"
             . self::DASHBOARD_URL;
    }

    protected function alreadySent(string $key): bool
    {
        if (in_array($key, self::$sentNotifications)) {
            return true;
        }
        self::$sentNotifications[] = $key;
        return false;
    }


    public function generateWaLink(string $phoneWA, string $message): string
    {
        $formattedNumber = $this->formatNumber($phoneWA);
        $encodedMessage = rawurlencode($message);

        return "https://wa.me/{$formattedNumber}?text={$encodedMessage}";
    }

    public function getMessageConfirmed($order): string
    {
        $customerName = $order->user?->name ?? 'Pelanggan';
        $tanggal = $order->quota_date ? $order->quota_date->locale('id')->translatedFormat('d F Y') : 'yang telah dijadwalkan';

        if ($order->method === 'home_service') {
            $alamat = $order->visit_address ?: 'alamat yang telah Anda berikan saat pemesanan';
            $detailPesan = "Pesanan Anda telah dikonfirmasi dan disetujui oleh Admin. Tim penjahit kami akan *datang langsung ke lokasi Anda* pada tanggal *{$tanggal}* untuk konsultasi desain & pengukuran badan.\n\n"
                         . "*Alamat Kunjungan:* {$alamat}\n\n"
                         . "Mohon pastikan Anda berada di lokasi tersebut pada tanggal yang telah dijadwalkan ya. Terima kasih!";
        } else {
            $detailPesan = "Pesanan Anda telah dikonfirmasi dan disetujui oleh Admin. Silakan *datang langsung ke Studio Era Jahit* pada tanggal *{$tanggal}* untuk konsultasi desain & pengukuran badan.\n\n"
                         . "*Alamat Studio:* Jl. Sungai Balang, Cupak Tangah, Kec. Pauh, Kota Padang, Sumatera Barat\n\n"
                         . "Setelah sesi pengukuran selesai, Admin akan memperbarui status pesanan dan status pembayaran Anda. Terima kasih!";
        }

        return "*Halo {$customerName},* \n\n"
             . "Berikut adalah konfirmasi status pesanan Anda dari Admin *Era Jahit Studio*:\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "*Nomor Pesanan:* {$order->order_number}\n"
             . "*Status Saat Ini:* *DIKONFIRMASI* \n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "Pesan dari Admin:\n"
             . "{$detailPesan}\n\n"
             . "Terima kasih banyak atas kepercayaan Anda kepada Era Jahit Studio!"
             . $this->messageFooter();
    }

    public function getMessageInProgress($order): string
    {
        $customerName = $order->user?->name ?? 'Pelanggan';
        return "*Halo {$customerName},* \n\n"
             . "Berikut adalah konfirmasi status pesanan Anda dari Admin *Era Jahit Studio*:\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "*Nomor Pesanan:* {$order->order_number}\n"
             . "*Status Saat Ini:* *SEDANG DIKERJAKAN* \n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "Pesan dari Admin:\n"
             . "Proses menjahit busana Anda resmi dimulai! Tim penjahit kami sedang mengerjakan pemotongan kain dan pola desain dengan teliti untuk menjamin kesempurnaan busana Anda.\n\n"
             . "Kami akan terus memperbarui progres pengerjaan di dashboard pesanan Anda. Terima kasih!"
             . $this->messageFooter();
    }

    public function getMessageCompleted($order): string
    {
        $customerName = $order->user?->name ?? 'Pelanggan';
        return " *Halo {$customerName},* \n\n"
             . "Kabar gembira! Pesanan Anda dari Admin *Era Jahit Studio* telah selesai:\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "*Nomor Pesanan:* {$order->order_number}\n"
             . "*Status Saat Ini:* *SELESAI / SIAP DIAMBIL*\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "Pesan dari Admin:\n"
             . "Busana Anda telah selesai dijahit dan telah lolos tahap Quality Control (QC) kami dengan hasil yang sangat baik. Silakan hubungi kami untuk koordinasi pengiriman atau silakan datang langsung ke studio untuk fitting/pengambilan\n\n"
             . "Terima kasih telah mempercayakan busana Anda kepada Era Jahit Studio!"
             . $this->messageFooter();
    }

    public function getMessageRejected($order, $reason = 'Ketidaksesuaian detail'): string
    {
        $customerName = $order->user?->name ?? 'Pelanggan';
        return "*Halo {$customerName},* \n\n"
             . "Berikut adalah pembaruan status pesanan Anda dari Admin *Era Jahit Studio*:\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "*Nomor Pesanan:* {$order->order_number}\n"
             . "*Status Saat Ini:* *DITOLAK / DIBATALKAN*\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "Alasan dari Admin:\n"
             . "_Mohon maaf sebesar-besarnya, pesanan Anda saat ini belum dapat kami proses karena: *{$reason}*._\n\n"
             . "Jika ada hal yang ingin ditanyakan atau ingin mendiskusikan alternatif desain/jadwal lain, silakan langsung membalas pesan ini. Terima kasih"
             . $this->messageFooter();
    }

    public function getMessageProgressUpdate($order, string $stage, string $description = ''): string
    {
        $descriptionStr = $description ? "\n *Keterangan:* {$description}" : "";
        return "Halo {$order->user->name} \n\n"
             . "Progres pesanan Anda #{$order->id} di *Era Jahit Studio* baru saja diperbarui oleh Admin:\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "*Tahap Progres:* *{$stage}*\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "Pesan Progres:{$descriptionStr}\n\n"
             . "Terima kasih atas kepercayaan Anda!"
             . $this->messageFooter();
    }

    public function sendMessage(string $phone, string $message): void
    {
        $formattedPhone = $this->formatNumber($phone);

        \Illuminate\Support\Facades\Log::info("WhatsApp Notification [automatic send] to {$formattedPhone}: {$message}");

        $token = config('services.fonnte.token') ?? env('FONNTE_TOKEN');
        if (empty($token) || $token === 'your_fonnte_api_token_here') {
            \Illuminate\Support\Facades\Log::warning("Fonnte API Token belum dikonfigurasi secara benar. Mengabaikan pengiriman otomatis.");
            return;
        }

        try {
            // Jalankan job secara sinkron agar langsung terkirim tanpa perlu antrean queue worker di lokal
            \App\Jobs\SendWhatsAppNotification::dispatchSync($formattedPhone, $message);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim WhatsApp otomatis ke {$formattedPhone}: " . $e->getMessage());
        }
    }

    public function notifyAdminNewOrder($order): void
    {
        $key = "admin-new-order-{$order->id}";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        $customerName = $order->user?->name ?? 'Pelanggan';
        
        $message = "*[PESANAN BARU]*\n\n"
                 . "Halo Admin Era Jahit,\n"
                 . "Ada pesanan baru masuk ke dalam sistem:\n\n"
                 . "*Nomor Pesanan:* {$order->order_number}\n"
                 . "*Pelanggan:* {$customerName}\n"
                 . "*WA Pelanggan:* " . ($order->user?->phone_wa ?? '-') . "\n"
                 . "*Metode:* " . ($order->metode === 'home_service' ? 'Home Service' : 'Studio / Datang ke Toko') . "\n"
                 . "*Catatan:* " . ($order->catatan ?? '-') . "\n\n"
                 . "Silakan cek dashboard Filament Admin Anda untuk meninjau detail dan mengonfirmasi pesanan";

        $this->sendMessage(self::ADMIN_PHONE, $message);
    }

    public function notifyOrderConfirmed($order): void
    {
        $key = "order-{$order->id}-confirmed";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        if (!$order->user || !$order->user->phone_wa) return;

        $message = $this->getMessageConfirmed($order);
        $this->sendMessage($order->user->phone_wa, $message);
    }

    public function notifyOrderCompleted($order): void
    {
        $key = "order-{$order->id}-completed";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        if (!$order->user || !$order->user->phone_wa) return;

        $message = $this->getMessageCompleted($order);
        $this->sendMessage($order->user->phone_wa, $message);
    }

    public function notifyOrderRejected($order, $reason): void
    {
        $key = "order-{$order->id}-rejected";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        if (!$order->user || !$order->user->phone_wa) return;

        $message = $this->getMessageRejected($order, $reason);
        $this->sendMessage($order->user->phone_wa, $message);
    }

    public function notifyOrderInProgress($order): void
    {
        $key = "order-{$order->id}-in-progress";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        if (!$order->user || !$order->user->phone_wa) return;

        $message = $this->getMessageInProgress($order);
        $this->sendMessage($order->user->phone_wa, $message);
    }

    public function notifyProgressUpdate($log): void
    {
        $key = "progress-{$log->id}-updated";
        if ($this->alreadySent($key)) return;

        $order = $log->order;
        if (!$order) {
            $order = \App\Models\Order::with('user')->find($log->order_id);
        } else {
            $order->load('user');
        }

        if (!$order || !$order->user || !$order->user->phone_wa) return;

        $customerName = $order->user->name;
        $descriptionStr = $log->description ? "\n*Detail:* {$log->description}" : "";
        
        $message = "*Halo {$customerName},* \n\n"
                 . "Progres pesanan Anda di *Era Jahit Studio* baru saja diperbarui oleh Admin:\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "*Nomor Pesanan:* {$order->order_number}\n"
                 . "*Tahap Progres:* *{$log->stage_label}*\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "Pesan Progres dari Admin:{$descriptionStr}\n\n"
                 . "Anda dapat memantau linimasa progres pesanan Anda secara lengkap di aplikasi Era Jahit. Terima kasih!";

        $this->sendMessage($order->user->phone_wa, $message);
    }

    public function getMessagePaymentUpdated($order): string
    {
        $customerName = $order->user?->name ?? 'Pelanggan';
        $price = (float) $order->estimated_price;
        $dp = (float) $order->dp_amount;
        $final = (float) $order->final_payment_amount;
        $total = $dp + $final;
        $isLunas = $price > 0 && $total >= $price && $total > 0;
        $sisa = $isLunas ? 'Lunas' : 'Rp ' . number_format(max(0, $price - $total), 0, ',', '.');

        return "*Halo {$customerName},* \n\n"
             . "Berikut pembaruan status pembayaran pesanan Anda dari Admin *Era Jahit Studio*:\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "*Nomor Pesanan:* {$order->order_number}\n"
             . "*Estimasi Harga:* Rp " . number_format($price, 0, ',', '.') . "\n"
             . "*Jumlah DP:* Rp " . number_format($dp, 0, ',', '.') . "\n"
             . "*Jumlah Pelunasan:* Rp " . number_format($final, 0, ',', '.') . "\n"
             . "*Sisa Tagihan:* {$sisa}\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "Terima kasih atas kepercayaan Anda kepada Era Jahit Studio!"
             . $this->messageFooter();
    }

    public function notifyPaymentStatusUpdated($order): void
    {
        $order->load('user');
        if (!$order->user || !$order->user->phone_wa) return;

        $message = $this->getMessagePaymentUpdated($order);
        $this->sendMessage($order->user->phone_wa, $message);
    }

    private function formatNumber(string $number): string
    {
        $number = preg_replace('/[^0-9]/', '', $number);
        if (str_starts_with($number, '0')) {
            $number = '62' . substr($number, 1);
        }
        return $number;
    }
}
