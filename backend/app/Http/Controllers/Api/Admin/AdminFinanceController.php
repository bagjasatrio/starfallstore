<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminFinanceController extends Controller
{
    public function index(): JsonResponse
    {
        // Cache the analytics data for 5 minutes (300 seconds)
        $data = Cache::remember('admin_finance_stats', 300, function () {
            // Aggregate totals for 'completed' orders
            $totals = Order::where('status', 'completed')
                ->selectRaw('
                    SUM(COALESCE(selling_price, amount + COALESCE(discount_amount, 0))) as total_revenue, 
                    SUM(COALESCE(supplier_price, cost_price)) as total_cost,
                    SUM(COALESCE(discount_amount, 0)) as total_discount,
                    SUM(COALESCE(net_profit, amount - COALESCE(cost_price, 0))) as total_net_profit
                ')
                ->first();

            $totalRevenue  = (float) $totals->total_revenue;
            $totalCost     = (float) $totals->total_cost;
            $totalDiscount = (float) $totals->total_discount;
            $netProfit     = (float) $totals->total_net_profit;
            $profitMargin  = $totalRevenue > 0 ? ($netProfit / $totalRevenue) * 100 : 0;

            // Daily trends for the last 30 days
            $thirtyDaysAgo = now()->subDays(30)->startOfDay();
            
            // Note: date_trunc('day', completed_at) is for Postgres, DATE(completed_at) is standard.
            // Using a standard raw expression that works cleanly across connections.
            $dailyTrends = Order::where('status', 'completed')
                ->where('completed_at', '>=', $thirtyDaysAgo)
                ->selectRaw('
                    DATE(completed_at) as date, 
                    SUM(COALESCE(selling_price, amount + COALESCE(discount_amount, 0))) as revenue, 
                    SUM(COALESCE(supplier_price, cost_price)) as cost,
                    SUM(COALESCE(discount_amount, 0)) as discount,
                    SUM(COALESCE(net_profit, amount - COALESCE(cost_price, 0))) as net_profit
                ')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'date'       => $item->date,
                        'revenue'    => (float) $item->revenue,
                        'discount'   => (float) $item->discount,
                        'net_profit' => (float) $item->net_profit,
                    ];
                });

            // Recent profits log (latest 15 completed orders)
            $recentProfits = Order::with('product')
                ->where('status', 'completed')
                ->orderBy('completed_at', 'desc')
                ->limit(15)
                ->get()
                ->map(function ($order) {
                    $rev = (float) ($order->selling_price ?? ($order->amount + $order->discount_amount));
                    $cost = (float) ($order->supplier_price ?? $order->cost_price);
                    $disc = (float) $order->discount_amount;
                    $prof = (float) ($order->net_profit ?? ($order->amount - $order->cost_price));
                    return [
                        'invoice_id' => $order->uuid,
                        'product'    => $order->product->name ?? 'Produk',
                        'package'    => $order->package->name ?? 'Item',
                        'revenue'    => $rev,
                        'cost'       => $cost,
                        'discount'   => $disc,
                        'profit'     => $prof,
                        'date'       => $order->completed_at->toIso8601String(),
                    ];
                });

            return [
                'total_revenue'  => $totalRevenue,
                'total_cost'     => $totalCost,
                'total_discount' => $totalDiscount,
                'net_profit'     => $netProfit,
                'profit_margin'  => round($profitMargin, 2),
                'daily_trends'   => $dailyTrends,
                'recent_profits' => $recentProfits,
            ];
        });

        return response()->json($data);
    }
}
