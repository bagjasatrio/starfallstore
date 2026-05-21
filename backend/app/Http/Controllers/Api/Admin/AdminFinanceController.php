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
                ->selectRaw('COALESCE(SUM(amount), 0) as total_revenue, COALESCE(SUM(cost_price), 0) as total_cost')
                ->first();

            $totalRevenue = (float) $totals->total_revenue;
            $totalCost    = (float) $totals->total_cost;
            $netProfit    = $totalRevenue - $totalCost;
            $profitMargin = $totalRevenue > 0 ? ($netProfit / $totalRevenue) * 100 : 0;

            // Daily trends for the last 30 days
            $thirtyDaysAgo = now()->subDays(30)->startOfDay();
            
            // Note: date_trunc('day', completed_at) is for Postgres, DATE(completed_at) is standard.
            // Using a standard raw expression that works cleanly across connections.
            $dailyTrends = Order::where('status', 'completed')
                ->where('completed_at', '>=', $thirtyDaysAgo)
                ->selectRaw('DATE(completed_at) as date, COALESCE(SUM(amount), 0) as revenue, COALESCE(SUM(cost_price), 0) as cost')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->map(function ($item) {
                    $rev = (float) $item->revenue;
                    $cost = (float) $item->cost;
                    return [
                        'date'       => $item->date,
                        'revenue'    => $rev,
                        'net_profit' => $rev - $cost,
                    ];
                });

            // Recent profits log (latest 15 completed orders)
            $recentProfits = Order::with('product')
                ->where('status', 'completed')
                ->orderBy('completed_at', 'desc')
                ->limit(15)
                ->get()
                ->map(function ($order) {
                    $rev = (float) $order->amount;
                    $cost = (float) $order->cost_price;
                    return [
                        'invoice_id' => $order->uuid,
                        'product'    => $order->product->name ?? 'Produk',
                        'package'    => $order->package->name ?? 'Item',
                        'revenue'    => $rev,
                        'cost'       => $cost,
                        'profit'     => $rev - $cost,
                        'date'       => $order->completed_at->toIso8601String(),
                    ];
                });

            return [
                'total_revenue' => $totalRevenue,
                'total_cost'    => $totalCost,
                'net_profit'    => $netProfit,
                'profit_margin' => round($profitMargin, 2),
                'daily_trends'  => $dailyTrends,
                'recent_profits'=> $recentProfits,
            ];
        });

        return response()->json($data);
    }
}
