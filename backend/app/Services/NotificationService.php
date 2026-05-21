<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    private Client $whatsappClient;
    private string $fonnte_token;

    public function __construct()
    {
        $this->fonnte_token = config('services.fonnte.token', '');
        $this->whatsappClient = new Client([
            'base_uri' => config('services.fonnte.base_url', 'https://api.fonnte.com'),
            'timeout' => 15,
        ]);
    }

    // ─── WhatsApp (Fonnte API) ────────────────────────────────────────────────

    /**
     * Send WhatsApp message via Fonnte API.
     */
    public function sendWhatsApp(string $phone, string $message): bool
    {
        if (empty($this->fonnte_token)) {
            Log::warning('Fonnte token not configured, skipping WhatsApp');
            return false;
        }

        try {
            $response = $this->whatsappClient->post('/send', [
                'headers' => [
                    'Authorization' => $this->fonnte_token,
                ],
                'form_params' => [
                    'target' => $this->formatPhone($phone),
                    'message' => $message,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if ($data['status'] ?? false) {
                Log::info('WhatsApp sent successfully', ['phone' => $phone]);
                return true;
            }

            Log::warning('WhatsApp send failed', ['phone' => $phone, 'response' => $data]);
            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp send exception', ['phone' => $phone, 'error' => $e->getMessage()]);
            return false;
        }
    }

    // ─── Order Notification Templates ─────────────────────────────────────────

    /**
     * Send payment invoice notification (after order created).
     */
    public function sendInvoiceNotification(
        string $phone,
        string $email,
        array $orderData
    ): void {
        $waMessage = $this->buildInvoiceMessage($orderData);

        // Primary: WhatsApp
        if (!empty($phone)) {
            $this->sendWhatsApp($phone, $waMessage);
        }

        // Secondary: Email
        if (!empty($email)) {
            try {
                Mail::to($email)->send(new \App\Mail\InvoiceMail($orderData));
            } catch (\Exception $e) {
                Log::error('Invoice email failed', ['email' => $email, 'error' => $e->getMessage()]);
            }
        }
    }

    /**
     * Send order completion / account delivery notification.
     */
    public function sendDeliveryNotification(
        string $phone,
        string $email,
        array $orderData,
        array $accountCredentials = []
    ): void {
        $waMessage = $this->buildDeliveryMessage($orderData, $accountCredentials);

        if (!empty($phone)) {
            $this->sendWhatsApp($phone, $waMessage);
        }

        if (!empty($email)) {
            try {
                Mail::to($email)->send(new \App\Mail\DeliveryMail($orderData, $accountCredentials));
            } catch (\Exception $e) {
                Log::error('Delivery email failed', ['email' => $email, 'error' => $e->getMessage()]);
            }
        }
    }

    /**
     * Send refund notification.
     */
    public function sendRefundNotification(string $phone, string $email, array $orderData): void
    {
        $message = "💰 *Refund StarfallStore*\n\n"
            . "Halo! Refund pesanan Anda telah diproses.\n\n"
            . "📋 Invoice: `{$orderData['uuid']}`\n"
            . "💵 Nominal: Rp " . number_format($orderData['total_amount'], 0, ',', '.') . "\n\n"
            . "Saldo akan dikembalikan dalam 1-3 hari kerja.\n"
            . "Terima kasih telah berbelanja di *StarfallStore* ⭐";

        if (!empty($phone)) {
            $this->sendWhatsApp($phone, $message);
        }
    }

    // ─── Message Builders ─────────────────────────────────────────────────────

    private function buildInvoiceMessage(array $order): string
    {
        $expiry = isset($order['expires_at'])
            ? date('d/m/Y H:i', strtotime($order['expires_at'])) . ' WIB'
            : '15 menit';

        return "🌟 *StarfallStore - Invoice Pembayaran*\n\n"
            . "Halo! Pesanan Anda telah dibuat.\n\n"
            . "📋 *Detail Pesanan:*\n"
            . "• Invoice: `{$order['uuid']}`\n"
            . "• Produk: {$order['product_name']}\n"
            . "• Paket: {$order['package_name']}\n"
            . "• Target: {$order['game_user_id']}" . (isset($order['game_nickname']) ? " ({$order['game_nickname']})" : '') . "\n"
            . "• Metode: " . strtoupper($order['payment_method']) . "\n"
            . "• Total: Rp " . number_format($order['total_amount'], 0, ',', '.') . "\n"
            . "• Batas Bayar: {$expiry}\n\n"
            . "💳 *Link Pembayaran:*\n{$order['payment_url']}\n\n"
            . "⚡ Proses otomatis dalam hitungan detik setelah pembayaran.\n"
            . "📞 CS: {$order['support_link']}\n\n"
            . "_Jangan balas pesan ini secara otomatis._";
    }

    private function buildDeliveryMessage(array $order, array $credentials): string
    {
        $msg = "✅ *StarfallStore - Pesanan Selesai!*\n\n"
            . "Top up berhasil! Item telah dikirim ke akun Anda.\n\n"
            . "📋 *Detail Transaksi:*\n"
            . "• Invoice: `{$order['uuid']}`\n"
            . "• Produk: {$order['product_name']}\n"
            . "• Paket: {$order['package_name']}\n";

        if (!empty($order['digiflazz_sn'])) {
            $msg .= "• Serial Number: `{$order['digiflazz_sn']}`\n";
        }

        if (!empty($credentials)) {
            $msg .= "\n🔑 *Data Akun:*\n";
            foreach ($credentials as $key => $value) {
                $msg .= "• " . ucfirst($key) . ": `{$value}`\n";
            }
        }

        $msg .= "\n⭐ Beri ulasan di: " . url("/order-delivered/{$order['uuid']}") . "\n\n"
            . "Terima kasih telah berbelanja di *StarfallStore*! 🎮";

        return $msg;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Normalize phone to international format (62xxx) for WhatsApp.
     */
    private function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        } elseif (!str_starts_with($phone, '62')) {
            $phone = '62' . $phone;
        }
        return $phone;
    }
}
