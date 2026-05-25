<?php
 
namespace App\Services;
 
class WhatsAppService
{
    const ADMIN_PHONE = '089673533620';
    
    protected static array $sentNotifications = [];

    protected function alreadySent(string $key): bool
    {
        if (in_array($key, self::$sentNotifications)) {
            return true;
        }
        self::$sentNotifications[] = $key;
        return false;
    }

    /**
     * Generate WhatsApp Link (wa.me) - Gratis & Tanpa API Gateway
     */
    public function generateWaLink(string $phoneWA, string $message): string
    {
        $formattedNumber = $this->formatNumber($phoneWA);
        $encodedMessage = urlencode($message);

        return "https://wa.me/{$formattedNumber}?text={$encodedMessage}";
    }

    public function getMessageConfirmed($order): string
    {
        return "Halo {$order->user->name} 👋\n"
             . "Pesanan Anda #{$order->id} telah *Dikonfirmasi*. Kami akan segera memprosesnya! 🙏";
    }

    public function getMessageInProgress($order): string
    {
        return "Halo {$order->user->name} 🧵\n"
             . "Pesanan Anda #{$order->id} saat ini *Sedang Dikerjakan* oleh tim kami. ✨";
    }

    public function getMessageCompleted($order): string
    {
        return "Halo {$order->user->name} 🎉\n"
             . "Pesanan Anda #{$order->id} telah *Selesai*! Silakan hubungi kami untuk pengambilan/pengiriman. ✨";
    }

    public function getMessageRejected($order, $reason): string
    {
        return "Halo {$order->user->name},\n"
             . "Mohon maaf, pesanan #{$order->id} tidak dapat kami proses.\n"
             . "❌ Alasan: {$reason}";
    }

    public function getMessageProgressUpdate($order, string $stage, string $description = ''): string
    {
        $descriptionStr = $description ? "\n📝 *Keterangan:* {$description}" : "";
        return "Halo {$order->user->name} 👋\n\n"
             . "Progres pesanan Anda #{$order->id} di *Era Jahit Studio* baru saja diperbarui oleh Admin:\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "📌 *Tahap Progres:* *{$stage}* 🪡\n"
             . "━━━━━━━━━━━━━━━━━━━\n"
             . "Pesan Progres:{$descriptionStr}\n\n"
             . "Terima kasih atas kepercayaan Anda! 🙏✨";
    }

    protected function sendMessage(string $phone, string $message): void
    {
        // Log saja untuk keperluan debugging / audit trail
        // Notifikasi ke pelanggan dikirim via wa.me link langsung dari Filament Admin
        \Illuminate\Support\Facades\Log::info("WhatsApp Notification [wa.me link] to {$phone}: {$message}");
    }

    public function notifyAdminNewOrder($order): void
    {
        $key = "admin-new-order-{$order->id}";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        $customerName = $order->user?->name ?? 'Pelanggan';
        
        $message = "🧵 *[PESANAN BARU]* 🧵\n\n"
                 . "Halo Admin Era Jahit,\n"
                 . "Ada pesanan baru masuk ke dalam sistem:\n\n"
                 . "📦 *Nomor Pesanan:* {$order->order_number}\n"
                 . "👤 *Pelanggan:* {$customerName}\n"
                 . "📞 *WA Pelanggan:* " . ($order->user?->phone_wa ?? '-') . "\n"
                 . "🏷️ *Metode:* " . ($order->metode === 'home_service' ? 'Home Service' : 'Studio / Datang ke Toko') . "\n"
                 . "📝 *Catatan:* " . ($order->catatan ?? '-') . "\n\n"
                 . "Silakan cek dashboard Filament Admin Anda untuk meninjau detail dan mengonfirmasi pesanan. ✨";

        $this->sendMessage(self::ADMIN_PHONE, $message);
    }

    public function notifyOrderConfirmed($order): void
    {
        $key = "order-{$order->id}-confirmed";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        if (!$order->user || !$order->user->phone_wa) return;

        $customerName = $order->user->name;
        $message = "👋 *Halo {$customerName},* \n\n"
                 . "Berikut adalah konfirmasi status pesanan Anda dari Admin *Era Jahit Studio*:\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "📦 *Nomor Pesanan:* {$order->order_number}\n"
                 . "📌 *Status Saat Ini:* *DIKONFIRMASI* ✅\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "Pesan dari Admin:\n"
                 . "_Pesanan Anda telah dikonfirmasi dan disetujui oleh Admin. Tim desainer dan penjahit kami akan segera memproses pembuatan busana Anda sesuai dengan detail desain & ukuran yang disepakati._ 🧵✨\n\n"
                 . "Terima kasih banyak atas kepercayaan Anda kepada Era Jahit Studio! 🙏";

        $this->sendMessage($order->user->phone_wa, $message);
    }

    public function notifyOrderCompleted($order): void
    {
        $key = "order-{$order->id}-completed";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        if (!$order->user || !$order->user->phone_wa) return;

        $customerName = $order->user->name;
        $message = "🎉 *Halo {$customerName},* \n\n"
                 . "Kabar gembira! Pesanan Anda dari Admin *Era Jahit Studio* telah selesai:\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "📦 *Nomor Pesanan:* {$order->order_number}\n"
                 . "📌 *Status Saat Ini:* *SELESAI / SIAP DIAMBIL* 🏆\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "Pesan dari Admin:\n"
                 . "_Busana Anda telah selesai dijahit dan telah lolos tahap Quality Control (QC) kami dengan hasil yang sangat baik. Silakan hubungi kami untuk koordinasi pengiriman atau silakan datang langsung ke studio untuk fitting/pengambilan._ ✨💼\n\n"
                 . "Terima kasih telah mempercayakan busana Anda kepada Era Jahit Studio! 🙏";

        $this->sendMessage($order->user->phone_wa, $message);
    }

    public function notifyOrderRejected($order, $reason): void
    {
        $key = "order-{$order->id}-rejected";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        if (!$order->user || !$order->user->phone_wa) return;

        $customerName = $order->user->name;
        $message = "📌 *Halo {$customerName},* \n\n"
                 . "Berikut adalah pembaruan status pesanan Anda dari Admin *Era Jahit Studio*:\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "📦 *Nomor Pesanan:* {$order->order_number}\n"
                 . "📌 *Status Saat Ini:* *DITOLAK / DIBATALKAN* ❌\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "Alasan dari Admin:\n"
                 . "_Mohon maaf sebesar-besarnya, pesanan Anda saat ini belum dapat kami proses karena: *{$reason}*._\n\n"
                 . "Jika ada hal yang ingin ditanyakan atau ingin mendiskusikan alternatif desain/jadwal lain, silakan langsung membalas pesan ini. Terima kasih. 🙏";

        $this->sendMessage($order->user->phone_wa, $message);
    }

    public function notifyOrderInProgress($order): void
    {
        $key = "order-{$order->id}-in-progress";
        if ($this->alreadySent($key)) return;

        $order->load('user');
        if (!$order->user || !$order->user->phone_wa) return;

        $customerName = $order->user->name;
        $message = "🧵 *Halo {$customerName},* \n\n"
                 . "Berikut adalah konfirmasi status pesanan Anda dari Admin *Era Jahit Studio*:\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "📦 *Nomor Pesanan:* {$order->order_number}\n"
                 . "📌 *Status Saat Ini:* *SEDANG DIKERJAKAN* ⏳\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "Pesan dari Admin:\n"
                 . "_Proses menjahit busana Anda resmi dimulai! Tim penjahit kami sedang mengerjakan pemotongan kain dan pola desain dengan teliti untuk menjamin kesempurnaan busana Anda._ ✨🪡\n\n"
                 . "Kami akan terus memperbarui progres pengerjaan di dashboard pesanan Anda. Terima kasih! 🙏";

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
        $descriptionStr = $log->description ? "\n📝 *Detail:* {$log->description}" : "";
        
        $message = "📈 *Halo {$customerName},* \n\n"
                 . "Progres pesanan Anda di *Era Jahit Studio* baru saja diperbarui oleh Admin:\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "📦 *Nomor Pesanan:* {$order->order_number}\n"
                 . "📌 *Tahap Progres:* *{$log->stage}* 🪡\n"
                 . "━━━━━━━━━━━━━━━━━━━\n"
                 . "Pesan Progres dari Admin:{$descriptionStr}\n\n"
                 . "Anda dapat memantau linimasa progres pesanan Anda secara lengkap di aplikasi Era Jahit. Terima kasih! 🙏✨";

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
