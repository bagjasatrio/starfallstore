<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class OrderTrackingController extends Controller
{
    /**
     * Track an order publicly via invoice ID.
     */
    public function track(string $invoice_id): JsonResponse
    {
        $order = Order::with(['product', 'package'])
            ->where('uuid', $invoice_id)
            ->first();

        if (!$order) {
            return response()->json([
                'message' => 'Pesanan tidak ditemukan. Periksa kembali Nomor Invoice Anda.'
            ], 404);
        }

        return response()->json([
            'order' => $this->formatPublicOrder($order)
        ]);
    }

    /**
     * Format the order to only include safe, public fields.
     */
    private function formatPublicOrder(Order $order): array
    {
        return [
            'uuid'            => $order->uuid,
            'status'          => $order->status,
            'product'         => [
                'name'       => $order->product->name ?? 'Produk',
                'banner_url' => $order->product->banner_url ?? null,
            ],
            'package'         => [
                'name'           => $order->package->name ?? 'Item',
                'quantity'       => $order->package->quantity ?? 1,
                'currency_label' => $order->package->currency_label ?? '',
            ],
            'game_user_id'    => $order->game_user_id,
            'game_server_id'  => $order->game_server_id,
            'game_nickname'   => $order->game_nickname,
            'payment_method'  => $order->payment_method,
            'created_at'      => $order->created_at->toIso8601String(),
            'paid_at'         => $order->paid_at?->toIso8601String(),
            'completed_at'    => $order->completed_at?->toIso8601String(),
            // Ensure no sensitive data is leaked here.
        ];
    }
}
