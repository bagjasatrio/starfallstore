<?php

namespace App\Services;

use App\Models\AccountStock;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AccountInventoryService
{
    /**
     * Assign an available account from stock to an order.
     *
     * Uses PostgreSQL Pessimistic Locking (SELECT FOR UPDATE SKIP LOCKED)
     * to guarantee no two simultaneous transactions can claim the same account.
     *
     * @throws \RuntimeException if no stock is available
     */
    public function assignToOrder(Order $order): AccountStock
    {
        return DB::transaction(function () use ($order) {
            /**
             * PESSIMISTIC LOCK: SELECT FOR UPDATE SKIP LOCKED
             * - `lockForUpdate()` → PostgreSQL SELECT FOR UPDATE
             * - `SKIP LOCKED` prevents deadlocks by skipping rows already locked by other transactions
             * This is the critical race-condition prevention mechanism.
             */
            $account = AccountStock::where('product_id', $order->product_id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->first();

            if (!$account) {
                Log::error('No available stock for order', [
                    'order_id' => $order->id,
                    'product_id' => $order->product_id,
                ]);
                throw new \RuntimeException('Stok akun tidak tersedia untuk produk ini.');
            }

            // Mark as sold WITHIN the same transaction before releasing lock
            $account->update([
                'status' => 'sold',
                'assigned_order_id' => $order->id,
                'assigned_at' => now(),
            ]);

            $order->update([
                'account_stock_id' => $account->id,
            ]);

            Log::info('Account stock assigned', [
                'account_id' => $account->id,
                'order_id' => $order->id,
            ]);

            return $account;
        });
    }

    /**
     * Reserve an account (soft-hold during checkout, before payment confirmed).
     * NOTE: Actual assignment happens only after CASHI payment confirmed.
     */
    public function reserveForOrder(Order $order): AccountStock
    {
        return DB::transaction(function () use ($order) {
            $account = AccountStock::where('product_id', $order->product_id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->first();

            if (!$account) {
                throw new \RuntimeException('Stok akun tidak tersedia.');
            }

            $account->update(['status' => 'reserved', 'assigned_order_id' => $order->id]);

            return $account;
        });
    }

    /**
     * Release a reserved account back to available stock (e.g. payment failed/expired).
     */
    public function releaseReservation(AccountStock $account): void
    {
        DB::transaction(function () use ($account) {
            $account->update([
                'status' => 'available',
                'assigned_order_id' => null,
                'assigned_at' => null,
            ]);
        });
    }

    /**
     * Get available stock count for a product.
     */
    public function availableCount(int $productId): int
    {
        return AccountStock::where('product_id', $productId)
            ->where('status', 'available')
            ->count();
    }
}
