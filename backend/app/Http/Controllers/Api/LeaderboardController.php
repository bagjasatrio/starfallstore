<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Cache leaderboard for 5 minutes to prevent expensive DB scans
        $leaderboard = Cache::remember('leaderboard', 300, function () {
            return [
                'today'     => $this->getLeaderboard('today'),
                'this_week' => $this->getLeaderboard('this_week'),
                'this_month'=> $this->getLeaderboard('this_month'),
            ];
        });

        return response()->json(['leaderboard' => $leaderboard]);
    }

    /**
     * Get top 10 users ranked by total spending (Rp) for a given period.
     */
    private function getLeaderboard(string $period): array
    {
        $dateFilter = match ($period) {
            'today'      => now()->startOfDay(),
            'this_week'  => now()->startOfWeek(),
            'this_month' => now()->startOfMonth(),
            default      => now()->startOfMonth(),
        };

        $results = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('orders.status', 'completed')
            ->where('orders.completed_at', '>=', $dateFilter)
            ->whereNotNull('orders.user_id')
            ->groupBy('users.id', 'users.name', 'users.username', 'users.avatar_url')
            ->select([
                'users.id',
                'users.name',
                'users.username',
                'users.avatar_url',
                DB::raw('SUM(orders.total_amount) as total_spending'),
                DB::raw('COUNT(orders.id) as transaction_count'),
            ])
            ->orderByDesc('total_spending')
            ->limit(10)
            ->get();

        return $results->map(function ($row, $index) {
            return [
                'rank'              => $index + 1,
                'name'              => $row->name,
                'username'          => $row->username,
                'avatar_url'        => $row->avatar_url,
                'total_spending'    => (float) $row->total_spending,
                'transaction_count' => (int) $row->transaction_count,
            ];
        })->all();
    }
}
