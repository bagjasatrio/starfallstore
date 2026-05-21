<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderTrackingController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Middleware\ValidateCashiWebhook;
use App\Http\Middleware\ValidateTurnstileToken;
use Illuminate\Support\Facades\Route;

/*
|──────────────────────────────────────────────────────────────────────────────
| StarfallStore API Routes
|──────────────────────────────────────────────────────────────────────────────
*/

// ── Public Routes ─────────────────────────────────────────────────────────────

// Authentication (Turnstile + Rate Limiting)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware([ValidateTurnstileToken::class, 'throttle:3,1']);

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware([ValidateTurnstileToken::class, 'throttle:5,1']);
});

// Products (Public — no auth needed)
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/popular', [ProductController::class, 'popular']);
    Route::get('/{slug}', [ProductController::class, 'show']);
});

// Order Tracking (Guest access)
Route::get('/orders/{uuid}', [OrderController::class, 'show']);
Route::get('/orders/track/{invoice_id}', [OrderTrackingController::class, 'track']);

// Nickname Check (rate limited)
Route::post('/game/check-nickname', [OrderController::class, 'checkNickname'])
    ->middleware('throttle:30,1');

// Checkout (Turnstile + Rate Limiting)
Route::post('/orders', [OrderController::class, 'store'])
    ->middleware([ValidateTurnstileToken::class, 'throttle:10,1']);

// Voucher validation (Public)
Route::post('/vouchers/check', [\App\Http\Controllers\Api\VoucherCheckController::class, 'check'])
    ->middleware('throttle:30,1');

// Leaderboard (cached)
Route::get('/leaderboard', [LeaderboardController::class, 'index']);

// ── Webhooks (no auth, custom signature validation via middleware) ─────────────

Route::prefix('webhooks')->group(function () {
    Route::post('/cashi', [WebhookController::class, 'cashiWebhook'])
        ->middleware(ValidateCashiWebhook::class);

    Route::post('/digiflazz', [WebhookController::class, 'digiflazzWebhook']);
})->name('webhooks.');

// ── Authenticated Routes (Sanctum) ────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Buyer Routes
    Route::middleware('ability:role:buyer')->group(function () {
        Route::get('/my-orders', [OrderController::class, 'myOrders']);
    });

    // ── Admin Routes ──────────────────────────────────────────────────────────

    Route::prefix('admin')
        ->middleware('admin.role')
        ->name('admin.')
        ->group(function () {

        // Dashboard Stats
        Route::get('/stats', function () {
            return response()->json([
                'revenue_today'    => \App\Models\Order::where('status', 'completed')->whereDate('completed_at', today())->sum('total_amount'),
                'revenue_month'    => \App\Models\Order::where('status', 'completed')->whereMonth('completed_at', now()->month)->sum('total_amount'),
                'orders_today'     => \App\Models\Order::whereDate('created_at', today())->count(),
                'orders_pending'   => \App\Models\Order::whereIn('status', ['unpaid', 'paid', 'processing'])->count(),
                'total_users'      => \App\Models\User::whereIn('role', ['buyer', 'customer'])->count(),
            ]);
        });

        // Products CRUD
        Route::apiResource('/products', \App\Http\Controllers\Api\Admin\AdminProductController::class);

        // Orders Management
        Route::get('/orders', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'index']);
        Route::get('/orders/{uuid}', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'show']);
        Route::post('/orders/{uuid}/refund', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'refund']);
        Route::post('/orders/{uuid}/status', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'updateStatus']);
        Route::get('/audit-logs', [\App\Http\Controllers\Api\Admin\AdminAuditLogController::class, 'index']);

        // Stock Management
        Route::get('/stock', [\App\Http\Controllers\Api\Admin\AdminStockController::class, 'index']);
        Route::post('/stock', [\App\Http\Controllers\Api\Admin\AdminStockController::class, 'store']);
        Route::delete('/stock/{id}', [\App\Http\Controllers\Api\Admin\AdminStockController::class, 'destroy']);

        // Account Inventory (Stok Akun)
        Route::get('/inventory', [\App\Http\Controllers\Api\Admin\AdminInventoryController::class, 'index']);
        Route::post('/inventory', [\App\Http\Controllers\Api\Admin\AdminInventoryController::class, 'store']);
        Route::put('/inventory/{id}', [\App\Http\Controllers\Api\Admin\AdminInventoryController::class, 'update']);
        Route::delete('/inventory/{id}', [\App\Http\Controllers\Api\Admin\AdminInventoryController::class, 'destroy']);

        // User Management
        Route::get('/users', [\App\Http\Controllers\Api\Admin\AdminUserManagementController::class, 'index']);
        
        // Finance Analytics
        Route::get('/analytics/finance', [\App\Http\Controllers\Api\Admin\AdminFinanceController::class, 'index']);
        
        // Vouchers
        Route::apiResource('/vouchers', \App\Http\Controllers\Api\Admin\VoucherController::class);
        Route::post('/users', [\App\Http\Controllers\Api\Admin\AdminUserManagementController::class, 'store']);
        Route::get('/users/{id}', [\App\Http\Controllers\Api\Admin\AdminUserManagementController::class, 'show']);
        Route::put('/users/{id}', [\App\Http\Controllers\Api\Admin\AdminUserManagementController::class, 'update']);
        Route::post('/users/{id}/adjust-balance', [\App\Http\Controllers\Api\Admin\AdminUserManagementController::class, 'adjustBalance']);
        Route::post('/users/{id}/toggle-status', [\App\Http\Controllers\Api\Admin\AdminUserManagementController::class, 'toggleStatus']);
        Route::post('/users/{id}/reset-password', [\App\Http\Controllers\Api\Admin\AdminUserManagementController::class, 'resetPassword']);
    });
});
