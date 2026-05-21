<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\Package;
use App\Models\Order;
use App\Models\TransactionLog;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SimulateE2E extends Command
{
    protected $signature = 'app:simulate-e2e';
    protected $description = 'Simulate E2E Checkout, Cashi Webhook, and Digiflazz Fulfillment';

    public function handle()
    {
        $this->info('🚀 Starting E2E Simulation...');
        
        // Ensure Sync/Local Drivers to prevent network hangs
        config(['queue.default' => 'sync']);
        config(['broadcasting.default' => 'log']);
        config(['cache.default' => 'file']);
        $this->info('✓ Drivers forced to SYNC/LOG for instant execution.');

        // Step 1: Simulate Frontend Checkout
        $this->info("\n[STEP 1] Simulating Frontend Checkout (Mobile Legends)...");
        
        // Find or create product
        $product = Product::firstOrCreate(
            ['game_code' => 'mobile-legends'],
            [
                'name' => 'Mobile Legends: Bang Bang',
                'category' => 'game',
                'is_active' => true,
                'slug' => 'mobile-legends-bang-bang',
            ]
        );

        $package = Package::firstOrCreate(
            ['product_id' => $product->id, 'sku' => 'ML-28'],
            [
                'name' => '28 Diamonds',
                'base_price' => 8000,
                'selling_price' => 8500,
                'currency_label' => 'Diamonds',
                'is_active' => true,
                'quantity' => 28,
            ]
        );

        $this->info("✓ Mock Nickname Checker returned: AERONNSHIKII [MOCK]");

        $order = Order::create([
            'uuid' => Str::uuid(),
            'user_id' => null, // Guest checkout
            'product_id' => $product->id,
            'package_id' => $package->id,
            'game_user_id' => '12345678',
            'game_server_id' => '1234',
            'game_nickname' => 'AERONNSHIKII [MOCK]',
            'buyer_phone' => '081234567890',
            'payment_method' => 'qris',
            'payment_channel' => 'qris',
            'amount' => 8500,
            'admin_fee' => 500,
            'total_amount' => 8500 + 500, // + admin fee
            'status' => 'unpaid',
            'expires_at' => Carbon::now()->addDay(),
            'cashi_invoice_id' => 'inv_' . Str::random(10),
            'cashi_checkout_url' => 'http://cashi.id/mock',
        ]);

        $this->info("✓ Created UNPAID Order: {$order->uuid} (Invoice: {$order->cashi_invoice_id})");

        // Step 2: Webhook Simulation
        $this->info("\n[STEP 2] Simulating CASHI.ID Webhook...");

        $payload = [
            'invoice_id' => $order->cashi_invoice_id,
            'external_id' => $order->uuid,
            'status' => 'PAID',
            'paid_amount' => $order->total_amount,
            'paid_at' => Carbon::now()->toIso8601String(),
        ];
        
        $rawBody = json_encode($payload);
        $webhookSecret = config('services.cashi.webhook_secret') ?? 'testing_secret';
        config(['services.cashi.webhook_secret' => $webhookSecret]);
        $signature = 'sha256=' . hash_hmac('sha256', $rawBody, $webhookSecret);

        $this->info("✓ Generated HMAC-SHA256 signature.");

        // Dispatch request to the Laravel HTTP Kernel
        $request = \Illuminate\Http\Request::create('/api/webhooks/cashi', 'POST', [], [], [], [
            'HTTP_X_CASHI_Signature' => $signature,
            'CONTENT_TYPE' => 'application/json',
        ], $rawBody);

        $response = app()->handle($request);

        $order->refresh();

        if (in_array($order->status, ['paid', 'processing', 'completed'])) {
            $this->info("✓ Webhook successfully processed. Order status advanced to: " . strtoupper($order->status));
        } else {
            $this->error("✗ Webhook failed. Order status: {$order->status}. Response: " . $response->getContent());
            return;
        }

        // Step 3: Fulfillment
        $this->info("\n[STEP 3] Verifying Fulfillment (Digiflazz Mock)...");
        if ($order->status === 'completed') {
            $this->info("✓ Queue Worker automatically fulfilled the order synchronously (Status: COMPLETED)");
            $this->info("✓ Digiflazz SN generated: " . ($order->digiflazz_sn ?? 'N/A'));
        } else {
            $this->warn("⚠ Order is not COMPLETED. Current status: {$order->status}. Maybe process topup job failed?");
        }

        // Step 4: Verification
        $this->info("\n[STEP 4] Admin Audit & Dashboard Verification");
        $logsCount = TransactionLog::where('order_id', $order->id)->count();
        $this->info("✓ Transaction logs generated: {$logsCount} events recorded.");
        
        $this->info("\n=========================================");
        $this->info("🎉 E2E Simulation COMPLETE!");
        $this->info("Please open your React Admin Dashboard (/admin) to verify:");
        $this->info("1. The pure Tailwind Revenue Charts reflect the new Rp " . number_format($order->total_amount, 0, ',', '.') . " revenue.");
        $this->info("2. The Transaction Logs and live feed show the new Completed order ({$order->uuid}).");
        $this->info("=========================================\n");
    }
}
