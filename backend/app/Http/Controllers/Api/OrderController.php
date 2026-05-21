<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Package;
use App\Models\Product;
use App\Models\Voucher;
use App\Services\CashiService;
use App\Services\DigiflazzService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function __construct(
        private CashiService $cashi,
        private DigiflazzService $digiflazz,
        private NotificationService $notification,
    ) {}

    // ─── Nickname Check ───────────────────────────────────────────────────────

    public function checkNickname(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'user_id'    => ['required', 'string', 'max:50'],
            'server_id'  => ['nullable', 'string', 'max:20'],
        ]);

        $product = Product::findOrFail($data['product_id']);
        $nickname = $this->digiflazz->checkNickname(
            gameCode: $product->game_code ?? '',
            userId: $data['user_id'],
            serverId: $data['server_id'] ?? null,
        );

        if ($nickname) {
            return response()->json(['nickname' => $nickname]);
        }

        return response()->json(['message' => 'Nickname tidak ditemukan atau ID salah.'], 404);
    }

    // ─── Create Order (Checkout) ──────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id'     => ['required', 'integer', 'exists:products,id'],
            'package_id'     => ['required', 'integer', 'exists:packages,id'],
            'game_user_id'   => ['required', 'string', 'max:100'],
            'game_server_id' => ['nullable', 'string', 'max:50'],
            'game_nickname'  => ['nullable', 'string', 'max:100'],
            'payment_method' => ['required', 'string', 'in:qris,va,ovo,dana,gopay,shopeepay'],
            'payment_channel'=> ['nullable', 'string', 'max:20'],
            'buyer_phone'    => ['required_without_all:user_id', 'nullable', 'string', 'max:20', 'regex:/^[0-9]+$/'],
            'buyer_email'    => ['nullable', 'email', 'max:255'],
            'voucher_code'   => ['nullable', 'string', 'max:50'],
        ]);

        $package = Package::with('product')->findOrFail($data['package_id']);

        if ($package->product_id !== (int) $data['product_id']) {
            return response()->json(['message' => 'Paket tidak sesuai produk.'], 422);
        }

        $supplierPrice = (float) $package->cost_price;
        $sellingPrice = (float) $package->selling_price;
        
        $discountAmount = 0;
        $voucher = null;

        if (!empty($data['voucher_code'])) {
            $voucher = Voucher::where('code', $data['voucher_code'])
                ->where('is_active', true)
                ->where(function($q) {
                    $q->whereNull('valid_until')->orWhere('valid_until', '>=', now());
                })
                ->where(function($q) {
                    $q->whereNull('max_uses')->orWhereColumn('uses_count', '<', 'max_uses');
                })
                ->first();

            if ($voucher) {
                if ($voucher->discount_type === 'percentage') {
                    $discountAmount = $sellingPrice * ((float) $voucher->discount_value / 100);
                } else {
                    $discountAmount = (float) $voucher->discount_value;
                }
                
                if ($discountAmount > $sellingPrice) {
                    $discountAmount = $sellingPrice;
                }
            }
        }

        $finalAmount = $sellingPrice - $discountAmount;
        $adminFee = $this->cashi->calculateAdminFee($data['payment_method'], $finalAmount);
        $totalAmount = $finalAmount + $adminFee;
        $netProfit = $sellingPrice - $supplierPrice - $discountAmount;

        $order = DB::transaction(function () use ($data, $package, $adminFee, $totalAmount, $finalAmount, $supplierPrice, $sellingPrice, $discountAmount, $netProfit, $voucher, $request) {
            $order = Order::create([
                'user_id'        => $request->user()?->id,
                'product_id'     => $data['product_id'],
                'package_id'     => $data['package_id'],
                'game_user_id'   => $data['game_user_id'],
                'game_server_id' => $data['game_server_id'] ?? null,
                'game_nickname'  => $data['game_nickname'] ?? null,
                'buyer_phone'    => $data['buyer_phone'] ?? $request->user()?->phone,
                'buyer_email'    => $data['buyer_email'] ?? $request->user()?->email,
                'payment_method' => $data['payment_method'],
                'payment_channel'=> $data['payment_channel'] ?? null,
                'voucher_id'     => $voucher?->id,
                'discount_amount'=> $discountAmount,
                'supplier_price' => $supplierPrice,
                'selling_price'  => $sellingPrice,
                'net_profit'     => $netProfit,
                'amount'         => $finalAmount,
                'admin_fee'      => $adminFee,
                'total_amount'   => $totalAmount,
                'status'         => 'unpaid',
                'expires_at'     => now()->addMinutes(15),
            ]);

            if ($voucher) {
                $voucher->increment('uses_count');
            }

            $order->addLog('order.created', ['package_sku' => $package->sku]);

            return $order;
        });

        // Create CASHI invoice
        try {
            $cashiResponse = $this->cashi->createInvoice([
                'order_id'       => $order->uuid,
                'amount'         => $totalAmount,
                'method'         => $data['payment_method'],
                'channel'        => $data['payment_channel'] ?? null,
                'customer_name'  => $order->user?->name ?? 'Guest',
                'customer_email' => $order->buyer_email,
                'customer_phone' => $order->buyer_phone,
                'description'    => "{$package->product->name} — {$package->name}",
                'expired_at'     => $order->expires_at->timestamp,
            ]);

            $order->update([
                'cashi_invoice_id' => $cashiResponse['data']['invoice_id'] ?? null,
                'cashi_payment_url'=> $cashiResponse['data']['payment_url'] ?? null,
                'cashi_qris_url'   => $cashiResponse['data']['qris_url'] ?? null,
                'cashi_va_number'  => $cashiResponse['data']['va_number'] ?? null,
            ]);
        } catch (\Exception $e) {
            $order->update(['status' => 'failed']);
            return response()->json(['message' => 'Gagal membuat invoice pembayaran. Coba lagi.'], 502);
        }

        // Send invoice notification
        $this->notification->sendInvoiceNotification(
            phone: $order->buyer_phone ?? '',
            email: $order->buyer_email ?? '',
            orderData: [
                'uuid'         => $order->uuid,
                'product_name' => $package->product->name,
                'package_name' => $package->name,
                'game_user_id' => $order->game_user_id,
                'game_nickname'=> $order->game_nickname,
                'payment_method' => $order->payment_method,
                'total_amount' => $totalAmount,
                'payment_url'  => $order->cashi_payment_url,
                'expires_at'   => $order->expires_at->toIso8601String(),
                'support_link' => config('app.url') . '/dukungan',
            ]
        );

        return response()->json([
            'message'      => 'Pesanan berhasil dibuat!',
            'order'        => [
                'uuid'          => $order->uuid,
                'status'        => $order->status,
                'total_amount'  => $totalAmount,
                'payment_method'=> $order->payment_method,
                'payment_url'   => $order->cashi_payment_url,
                'qris_url'      => $order->cashi_qris_url,
                'va_number'     => $order->cashi_va_number,
                'expires_at'    => $order->expires_at->toIso8601String(),
            ],
        ], 201);
    }

    // ─── Get Order ────────────────────────────────────────────────────────────

    public function show(string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)
            ->with(['product', 'package', 'logs'])
            ->firstOrFail();

        return response()->json(['order' => $this->formatOrder($order)]);
    }

    // ─── Track by Invoice / Phone ─────────────────────────────────────────────

    public function track(Request $request): JsonResponse
    {
        $data = $request->validate([
            'query' => ['required', 'string', 'min:5', 'max:100'],
        ]);

        $q = trim($data['query']);
        $order = Order::with(['product', 'package'])
            ->where('uuid', 'ILIKE', "%{$q}%")
            ->orWhere('buyer_phone', 'LIKE', "%{$q}%")
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        return response()->json(['order' => $this->formatOrder($order)]);
    }

    // ─── User Order History ───────────────────────────────────────────────────

    public function myOrders(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['product', 'package'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($orders);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatOrder(Order $order): array
    {
        return [
            'uuid'            => $order->uuid,
            'status'          => $order->status,
            'product'         => ['name' => $order->product->name, 'banner_url' => $order->product->banner_url],
            'package'         => ['name' => $order->package->name, 'quantity' => $order->package->quantity, 'currency_label' => $order->package->currency_label],
            'game_user_id'    => $order->game_user_id,
            'game_server_id'  => $order->game_server_id,
            'game_nickname'   => $order->game_nickname,
            'payment_method'  => $order->payment_method,
            'payment_channel' => $order->payment_channel,
            'discount_amount' => (float) $order->discount_amount,
            'amount'          => (float) $order->amount,
            'admin_fee'       => (float) $order->admin_fee,
            'total_amount'    => (float) $order->total_amount,
            'payment_url'     => $order->cashi_payment_url,
            'qris_url'        => $order->cashi_qris_url,
            'va_number'       => $order->cashi_va_number,
            'digiflazz_sn'    => $order->digiflazz_sn,
            'expires_at'      => $order->expires_at?->toIso8601String(),
            'paid_at'         => $order->paid_at?->toIso8601String(),
            'completed_at'    => $order->completed_at?->toIso8601String(),
            'created_at'      => $order->created_at->toIso8601String(),
            'logs'            => $order->logs->map(fn($l) => ['event' => $l->event, 'message' => $l->message, 'created_at' => $l->created_at->toIso8601String()])->all(),
        ];
    }
}
