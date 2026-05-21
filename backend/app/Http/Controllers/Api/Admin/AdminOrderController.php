<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\AccountStock;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'product', 'package']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('uuid', 'like', $search)
                  ->orWhere('buyer_phone', 'like', $search)
                  ->orWhere('buyer_email', 'like', $search)
                  ->orWhere('game_nickname', 'like', $search)
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', $search)
                         ->orWhere('username', 'like', $search);
                  });
            });
        }

        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }

        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($orders);
    }

    public function show(string $uuid): JsonResponse
    {
        $order = Order::with(['user', 'product', 'package', 'accountStock', 'logs' => function ($q) {
            $q->orderBy('created_at', 'asc');
        }])->where('uuid', $uuid)->firstOrFail();

        return response()->json($order);
    }

    public function refund(string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)->firstOrFail();

        if (in_array($order->status, ['refunded', 'expired'])) {
            return response()->json(['message' => 'Pesanan tidak dapat direfund dalam status ini.'], 422);
        }

        DB::transaction(function () use ($order) {
            // If it had a reserved/sold account stock, release it
            if ($order->account_stock_id) {
                $stock = AccountStock::find($order->account_stock_id);
                if ($stock) {
                    $stock->update([
                        'status'            => 'available',
                        'assigned_order_id' => null,
                        'assigned_at'       => null,
                        'notes'             => $stock->notes . "\n[System: Released due to refund of order " . $order->uuid . "]",
                    ]);
                }
                $order->account_stock_id = null;
            }

            // Refund wallet balance if user paid using wallet (if balance logic applies)
            // (Assuming standard PG payments, but we can refund to user's wallet if they are logged in)
            if ($order->user_id && $order->user) {
                $order->user->increment('wallet_balance', $order->total_amount);
            }

            $order->status = 'refunded';
            $order->save();

            $order->addLog('order.refunded', [], 'admin', 'Pesanan direfund secara manual oleh Administrator.');

            AuditLog::create([
                'admin_id' => request()->user() ? request()->user()->id : 1,
                'action' => 'refund_order',
                'target_table' => 'orders',
                'metadata_json' => ['order_uuid' => $order->uuid],
                'ip_address' => request()->ip(),
            ]);
        });

        return response()->json([
            'message' => 'Pesanan berhasil direfund! Saldo pembeli telah dikembalikan (jika terdaftar).',
            'order'   => $order->load(['user', 'product', 'package', 'accountStock']),
        ]);
    }
    public function updateStatus(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:processing,completed,failed,unpaid,paid',
        ]);

        $order = Order::where('uuid', $uuid)->firstOrFail();
        $oldStatus = $order->status;
        $order->status = $request->status;
        $order->save();

        $order->addLog('order.status_updated', ['old' => $oldStatus, 'new' => $request->status], 'admin', "Status diubah dari {$oldStatus} ke {$request->status} secara manual.");

        AuditLog::create([
            'admin_id' => $request->user() ? $request->user()->id : 1,
            'action' => 'update_order_status',
            'target_table' => 'orders',
            'metadata_json' => ['order_uuid' => $order->uuid, 'old_status' => $oldStatus, 'new_status' => $request->status],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Status pesanan berhasil diubah!',
            'order'   => $order->load(['user', 'product', 'package', 'accountStock']),
        ]);
    }
}
