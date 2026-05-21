<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessTopupJob;
use App\Models\Order;
use App\Services\DigiflazzService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    // ─── CASHI.ID Webhook ─────────────────────────────────────────────────────

    /**
     * Called by CASHI.ID when payment status changes.
     * Middleware: ValidateCashiWebhook (handles signature + idempotency)
     */
    public function cashiWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $externalId = $payload['external_id'] ?? null;
        $paymentStatus = strtolower($payload['status'] ?? '');

        Log::info('CASHI webhook received', ['external_id' => $externalId, 'status' => $paymentStatus]);

        $order = Order::where('uuid', $externalId)->first();

        if (!$order) {
            Log::warning('CASHI webhook: order not found', ['external_id' => $externalId]);
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($paymentStatus === 'paid' || $paymentStatus === 'success') {
            DB::transaction(function () use ($order, $payload) {
                if ($order->isUnpaid()) {
                    $order->update([
                        'status'  => 'paid',
                        'paid_at' => now(),
                    ]);
                    $order->addLog('payment.received', $payload, 'cashi_webhook', 'Pembayaran dikonfirmasi CASHI.ID');

                    // Dispatch async job to Redis queue — DO NOT call Digiflazz synchronously
                    ProcessTopupJob::dispatch($order);

                    event(new OrderStatusUpdated($order->uuid, 'paid'));
                }
            });
        } elseif ($paymentStatus === 'expired' || $paymentStatus === 'failed') {
            if ($order->isUnpaid()) {
                $order->update(['status' => $paymentStatus === 'expired' ? 'expired' : 'failed']);
                $order->addLog("payment.{$paymentStatus}", $payload, 'cashi_webhook');
                event(new OrderStatusUpdated($order->uuid, $order->status));
            }
        }

        return response()->json(['message' => 'OK']);
    }

    // ─── Digiflazz Webhook ────────────────────────────────────────────────────

    /**
     * Called by Digiflazz for async transaction status updates.
     */
    public function digiflazzWebhook(Request $request, DigiflazzService $digiflazz): JsonResponse
    {
        $payload = $request->all();

        // Validate Digiflazz signature
        if (!$digiflazz->validateWebhookSignature($payload)) {
            Log::warning('Digiflazz webhook: invalid signature', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $trxData = $payload['data'] ?? [];
        $refId = $trxData['ref_id'] ?? null;
        $status = strtolower($trxData['status'] ?? '');

        $order = Order::where('digiflazz_ref_id', $refId)->first();

        if (!$order) {
            Log::warning('Digiflazz webhook: order not found by ref_id', ['ref_id' => $refId]);
            return response()->json(['message' => 'Order not found'], 404);
        }

        Log::info('Digiflazz webhook', ['ref_id' => $refId, 'status' => $status]);

        if ($status === 'sukses') {
            DB::transaction(function () use ($order, $trxData) {
                $order->update([
                    'status'       => 'completed',
                    'completed_at' => now(),
                    'digiflazz_sn' => $trxData['sn'] ?? null,
                ]);
                $order->addLog('topup.completed.webhook', $trxData, 'digiflazz_webhook');
            });
            event(new OrderStatusUpdated($order->uuid, 'completed'));
        } elseif ($status === 'gagal') {
            $order->update(['status' => 'failed']);
            $order->addLog('topup.failed.webhook', $trxData, 'digiflazz_webhook');
            event(new OrderStatusUpdated($order->uuid, 'failed'));
        }

        return response()->json(['message' => 'OK']);
    }
}
