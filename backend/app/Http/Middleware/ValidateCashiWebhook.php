<?php

namespace App\Http\Middleware;

use App\Services\CashiService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class ValidateCashiWebhook
{
    public function __construct(private CashiService $cashiService) {}

    public function handle(Request $request, Closure $next): Response
    {
        // ── 1. Signature Validation (HMAC-SHA256) ──────────────────────────────
        $rawBody = $request->getContent();
        $signature = $request->header('X-CASHI-Signature', '');

        if (empty($signature) || !$this->cashiService->validateSignature($rawBody, $signature)) {
            Log::warning('CASHI webhook: invalid signature', [
                'ip' => $request->ip(),
                'signature' => substr($signature, 0, 20),
            ]);
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        // ── 2. Idempotency Check (Redis — TTL 24h) ─────────────────────────────
        $payload = $request->all();
        $invoiceId = $payload['invoice_id'] ?? $payload['external_id'] ?? null;

        if (!$invoiceId) {
            return response()->json(['message' => 'Missing invoice ID'], 400);
        }

        $idempotencyKey = "webhook:cashi:{$invoiceId}";
        $alreadyProcessed = Cache::get($idempotencyKey);

        if ($alreadyProcessed) {
            Log::info('CASHI webhook: duplicate request ignored', ['invoice_id' => $invoiceId]);
            // Return 200 to prevent CASHI from retrying
            return response()->json(['message' => 'Already processed', 'status' => 'ok']);
        }

        // Store idempotency key with 24h TTL
        Cache::put($idempotencyKey, '1', 86400);

        return $next($request);
    }
}
