<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class DigiflazzService
{
    private Client $client;
    private string $username;
    private string $apiKey;
    private string $webhookSecret;

    public function __construct()
    {
        $this->username = config('services.digiflazz.username');
        $this->apiKey = config('services.digiflazz.api_key');
        $this->webhookSecret = config('services.digiflazz.webhook_secret');

        $this->client = new Client([
            'base_uri' => config('services.digiflazz.base_url', 'https://api.digiflazz.com/v1'),
            'timeout' => 30,
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);
    }

    // ─── Nickname Checker ─────────────────────────────────────────────────────

    /**
     * Check game nickname via Digiflazz nickname check API.
     * Returns the nickname string or null if not found.
     */
    public function checkNickname(string $gameCode, string $userId, ?string $serverId = null): ?string
    {
        if (config('services.digiflazz.mode') === 'development') {
            return "AERONNSHIKII [MOCK]";
        }

        $sign = md5($this->username . $this->apiKey . 'membership');

        try {
            $response = $this->client->post('/nickname-check', [
                'json' => [
                    'commands' => 'checkNickname',
                    'username' => $this->username,
                    'sign' => $sign,
                    'buyer_sku_code' => $gameCode,
                    'customer_no' => $serverId ? "{$userId}|{$serverId}" : $userId,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (isset($data['data']['buyer_last_status']['rc']) && $data['data']['buyer_last_status']['rc'] === '00') {
                return $data['data']['customer_name'] ?? null;
            }
        } catch (RequestException $e) {
            Log::warning('Digiflazz nickname check failed', [
                'game_code' => $gameCode,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    // ─── Transaction ──────────────────────────────────────────────────────────

    /**
     * Submit a top-up transaction to Digiflazz.
     * Returns the full API response array.
     */
    public function createTransaction(
        string $refId,
        string $sku,
        string $customerNo,
        ?string $serverId = null
    ): array {
        if (config('services.digiflazz.mode') === 'development') {
            return [
                'data' => [
                    'ref_id' => $refId,
                    'status' => 'Sukses',
                    'message' => 'Simulated successful transaction',
                    'sn' => 'MOCK_SN_' . rand(1000, 9999),
                    'price' => 8000,
                    'buyer_last_status' => 'Sukses',
                ]
            ];
        }

        $sign = md5($this->username . $this->apiKey . $refId);
        $customerTarget = $serverId ? "{$customerNo}|{$serverId}" : $customerNo;

        $response = $this->client->post('/transaction', [
            'json' => [
                'username' => $this->username,
                'buyer_sku_code' => $sku,
                'customer_no' => $customerTarget,
                'ref_id' => $refId,
                'sign' => $sign,
                'testing' => app()->environment('local'), // Use test mode in dev
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    /**
     * Query transaction status by ref_id.
     */
    public function getTransactionStatus(string $refId): array
    {
        $sign = md5($this->username . $this->apiKey . $refId);

        $response = $this->client->post('/transaction', [
            'json' => [
                'commands' => 'inq-balance',
                'username' => $this->username,
                'ref_id' => $refId,
                'sign' => $sign,
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    // ─── Signature Validation ─────────────────────────────────────────────────

    /**
     * Validate incoming Digiflazz webhook signature.
     * Digiflazz uses MD5(username + apiKey + refId).
     */
    public function validateWebhookSignature(array $payload): bool
    {
        $refId = $payload['data']['ref_id'] ?? '';
        $expectedSign = md5($this->username . $this->webhookSecret . $refId);
        $receivedSign = $payload['data']['sign'] ?? '';

        return hash_equals($expectedSign, $receivedSign);
    }

    // ─── Response Parsing ─────────────────────────────────────────────────────

    /**
     * Parse Digiflazz response status to our internal status.
     * Returns: 'success' | 'pending' | 'failed'
     */
    public function parseStatus(array $response): string
    {
        $rc = $response['data']['buyer_last_status']['rc'] ?? '';
        $status = strtolower($response['data']['status'] ?? '');

        if ($rc === '00' || $status === 'sukses') {
            return 'success';
        } elseif (in_array($status, ['pending', 'waiting'])) {
            return 'pending';
        } else {
            return 'failed';
        }
    }
}
