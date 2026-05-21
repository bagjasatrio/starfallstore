<?php

namespace App\Jobs;

use App\Events\OrderStatusUpdated;
use App\Models\Order;
use App\Services\AccountInventoryService;
use App\Services\CashiService;
use App\Services\DigiflazzService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProcessTopupJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Max retry attempts before marking as failed.
     */
    public int $tries = 3;

    /**
     * Retry delay in seconds (5 minutes between retries).
     */
    public int $backoff = 300;

    /**
     * Unique key to prevent duplicate jobs for same order.
     */
    public function uniqueId(): string
    {
        return 'topup_' . $this->order->uuid;
    }

    public function __construct(public Order $order)
    {
        $this->onQueue('topup');
    }

    public function handle(
        DigiflazzService $digiflazz,
        CashiService $cashi,
        NotificationService $notification,
        AccountInventoryService $inventory,
    ): void {
        Log::info('ProcessTopupJob started', ['order_uuid' => $this->order->uuid, 'attempt' => $this->attempts()]);

        // Reload order to get latest status
        $order = Order::findOrFail($this->order->id);

        // Safety check: only process if status is 'paid'
        if (!in_array($order->status, ['paid', 'processing'])) {
            Log::warning('ProcessTopupJob: order not in paid/processing state', [
                'order_uuid' => $order->uuid,
                'status' => $order->status,
            ]);
            return;
        }

        // Determine workflow: Top-up (Digiflazz) or Account Delivery
        $productCategory = $order->product->category;

        if ($productCategory === 'game' && $order->package->sku !== 'ACCOUNT') {
            $this->processTopup($order, $digiflazz, $notification);
        } else {
            $this->processAccountDelivery($order, $inventory, $notification);
        }
    }

    // ─── Workflow A: Digiflazz Top-Up ─────────────────────────────────────────

    private function processTopup(Order $order, DigiflazzService $digiflazz, NotificationService $notification): void
    {
        $order->update(['status' => 'processing']);
        $order->addLog('topup.processing', ['attempt' => $this->attempts()]);

        // Broadcast real-time status update
        event(new OrderStatusUpdated($order->uuid, 'processing'));

        // Generate unique Digiflazz ref_id if not set
        if (empty($order->digiflazz_ref_id)) {
            $order->update(['digiflazz_ref_id' => Str::upper(Str::random(12))]);
        }

        try {
            $response = $digiflazz->createTransaction(
                refId: $order->digiflazz_ref_id,
                sku: $order->package->sku,
                customerNo: $order->game_user_id,
                serverId: $order->game_server_id,
            );

            $digiStatus = $digiflazz->parseStatus($response);
            $trxData = $response['data'] ?? [];

            $order->update([
                'digiflazz_trx_id' => $trxData['trx_id'] ?? null,
                'digiflazz_sn' => $trxData['sn'] ?? null,
            ]);

            if ($digiStatus === 'success') {
                // ✅ SUCCESS
                DB::transaction(function () use ($order, $trxData) {
                    $order->update([
                        'status' => 'completed',
                        'completed_at' => now(),
                        'digiflazz_sn' => $trxData['sn'] ?? $order->digiflazz_sn,
                    ]);
                    $order->addLog('topup.completed', $trxData, 'digiflazz');
                });

                event(new OrderStatusUpdated($order->uuid, 'completed'));
                $this->sendSuccessNotification($order, $notification);

            } elseif ($digiStatus === 'pending') {
                // ⏳ PENDING — re-queue for retry
                $order->addLog('topup.pending', $trxData, 'digiflazz', "Attempt {$this->attempts()} — akan dicoba ulang");
                $this->release($this->backoff);

            } else {
                // ❌ FAILED
                $this->handleTopupFailed($order, $response, $notification);
            }
        } catch (\Exception $e) {
            Log::error('ProcessTopupJob exception', ['order_uuid' => $order->uuid, 'error' => $e->getMessage()]);
            $order->addLog('topup.error', ['error' => $e->getMessage()], 'system');

            if ($this->attempts() >= $this->tries) {
                $this->handleTopupFailed($order, ['error' => $e->getMessage()], $notification);
            } else {
                $this->release($this->backoff);
            }
        }
    }

    private function handleTopupFailed(Order $order, array $response, NotificationService $notification): void
    {
        DB::transaction(function () use ($order, $response) {
            $order->update(['status' => 'failed']);
            $order->addLog('topup.failed', $response, 'digiflazz', 'Top-up gagal setelah maks. retries');
        });

        event(new OrderStatusUpdated($order->uuid, 'failed'));

        // Trigger refund via store credit (wallet top-up)
        $this->issueStoreCredit($order, $notification);

        Log::error('Top-up permanently failed — store credit issued', ['order_uuid' => $order->uuid]);
        $this->fail(new \RuntimeException("Top-up failed for order {$order->uuid}"));
    }

    // ─── Workflow B: Account Delivery ─────────────────────────────────────────

    private function processAccountDelivery(Order $order, AccountInventoryService $inventory, NotificationService $notification): void
    {
        try {
            $account = $inventory->assignToOrder($order);
            $credentials = $account->getCredentials();

            $order->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
            $order->addLog('account.delivered', ['account_id' => $account->id]);

            event(new OrderStatusUpdated($order->uuid, 'completed'));
            $this->sendDeliveryNotification($order, $credentials, $notification);
        } catch (\RuntimeException $e) {
            // No stock — fail and refund
            $order->update(['status' => 'failed']);
            $order->addLog('account.no_stock', [], 'system', $e->getMessage());
            event(new OrderStatusUpdated($order->uuid, 'failed'));
            $this->issueStoreCredit($order, $notification);
        }
    }

    // ─── Notifications ────────────────────────────────────────────────────────

    private function sendSuccessNotification(Order $order, NotificationService $notification): void
    {
        $phone = $order->buyer_phone ?? $order->user?->phone;
        $email = $order->buyer_email ?? $order->user?->email;

        if ($phone || $email) {
            $notification->sendDeliveryNotification($phone ?? '', $email ?? '', [
                'uuid' => $order->uuid,
                'product_name' => $order->product->name,
                'package_name' => $order->package->name,
                'total_amount' => $order->total_amount,
                'digiflazz_sn' => $order->digiflazz_sn,
                'game_user_id' => $order->game_user_id,
            ]);
        }
    }

    private function sendDeliveryNotification(Order $order, array $credentials, NotificationService $notification): void
    {
        $phone = $order->buyer_phone ?? $order->user?->phone;
        $email = $order->buyer_email ?? $order->user?->email;

        if ($phone || $email) {
            $notification->sendDeliveryNotification($phone ?? '', $email ?? '', [
                'uuid' => $order->uuid,
                'product_name' => $order->product->name,
                'package_name' => $order->package->name,
                'total_amount' => $order->total_amount,
                'game_user_id' => $order->game_user_id,
            ], $credentials);
        }
    }

    // ─── Store Credit (Refund Fallback) ───────────────────────────────────────

    private function issueStoreCredit(Order $order, NotificationService $notification): void
    {
        if ($order->user_id) {
            DB::transaction(function () use ($order) {
                $user = $order->user;
                $user->increment('wallet_balance', $order->total_amount);
                $order->update(['status' => 'refunded']);
                $order->addLog('refund.wallet_credited', [
                    'amount' => $order->total_amount,
                    'user_id' => $order->user_id,
                ]);
            });
        }

        $phone = $order->buyer_phone ?? $order->user?->phone;
        if ($phone) {
            $notification->sendRefundNotification($phone, $order->buyer_email ?? '', [
                'uuid' => $order->uuid,
                'total_amount' => $order->total_amount,
            ]);
        }
    }
}
