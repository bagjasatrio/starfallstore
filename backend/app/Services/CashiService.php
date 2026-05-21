<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class CashiService
{
    private Client $client;
    private string $merchantId;
    private string $apiKey;
    private string $webhookSecret;

    public function __construct()
    {
        $this->merchantId = config('services.cashi.merchant_id');
        $this->apiKey = config('services.cashi.api_key');
        $this->webhookSecret = config('services.cashi.webhook_secret');

        $this->client = new Client([
            'base_uri' => config('services.cashi.base_url', 'https://api.cashi.id/v1'),
            'timeout' => 30,
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $this->apiKey,
                'X-Merchant-ID' => $this->merchantId,
            ],
        ]);
    }

    // ─── Invoice Creation ─────────────────────────────────────────────────────

    /**
     * Create a new payment invoice on CASHI.ID.
     *
     * @param  array  $params {
     *   'order_id'       => string   (our internal UUID),
     *   'amount'         => float,
     *   'method'         => string   (qris|va|ovo|dana|gopay|shopeepay),
     *   'channel'        => string|null (e.g. BCA for VA),
     *   'customer_name'  => string,
     *   'customer_email' => string|null,
     *   'customer_phone' => string|null,
     *   'description'    => string,
     *   'expired_at'     => int   (Unix timestamp),
     * }
     */
    public function createInvoice(array $params): array
    {
        try {
            $response = $this->client->post('/invoice/create', [
                'json' => [
                    'merchant_id'    => $this->merchantId,
                    'external_id'    => $params['order_id'],
                    'amount'         => (int) $params['amount'],
                    'payment_method' => strtoupper($params['method']),
                    'payment_channel'=> $params['channel'] ?? null,
                    'customer'       => [
                        'name'  => $params['customer_name'],
                        'email' => $params['customer_email'] ?? null,
                        'phone' => $params['customer_phone'] ?? null,
                    ],
                    'description'    => $params['description'],
                    'expired_at'     => $params['expired_at'],
                    'callback_url'   => route('webhooks.cashi'),
                    'success_redirect_url' => url("/payment-success/{$params['order_id']}"),
                    'failure_redirect_url' => url("/invoice/{$params['order_id']}"),
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            Log::info('CASHI invoice created', ['external_id' => $params['order_id'], 'response' => $data]);

            return $data;
        } catch (RequestException $e) {
            Log::error('CASHI create invoice failed', [
                'order_id' => $params['order_id'],
                'error' => $e->getMessage(),
                'body' => $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : null,
            ]);
            throw $e;
        }
    }

    /**
     * Get invoice status from CASHI.ID.
     */
    public function getInvoiceStatus(string $cashiInvoiceId): array
    {
        $response = $this->client->get("/invoice/{$cashiInvoiceId}");
        return json_decode($response->getBody()->getContents(), true);
    }

    // ─── Refund ───────────────────────────────────────────────────────────────

    /**
     * Initiate a refund for a paid invoice.
     */
    public function createRefund(string $cashiInvoiceId, float $amount, string $reason): array
    {
        $response = $this->client->post('/refund/create', [
            'json' => [
                'invoice_id' => $cashiInvoiceId,
                'amount'     => (int) $amount,
                'reason'     => $reason,
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    // ─── Webhook Signature Validation ─────────────────────────────────────────

    /**
     * Validate CASHI.ID webhook HMAC-SHA256 signature.
     * Header: X-CASHI-Signature: sha256=<hash>
     */
    public function validateSignature(string $rawBody, string $receivedSignature): bool
    {
        $expectedHash = 'sha256=' . hash_hmac('sha256', $rawBody, $this->webhookSecret);
        return hash_equals($expectedHash, $receivedSignature);
    }

    // ─── Admin Fee Calculation ────────────────────────────────────────────────

    /**
     * Calculate admin fee based on payment method.
     */
    public function calculateAdminFee(string $method, float $amount): float
    {
        return match ($method) {
            'qris'                          => max(500, round($amount * 0.007)),   // 0.7%, min 500
            'va'                            => 4000,                                // flat fee
            'ovo', 'dana', 'gopay', 'shopeepay' => max(1000, round($amount * 0.01)), // 1%
            default                         => 0,
        };
    }
}
