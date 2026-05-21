<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Search filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('account_status', $request->input('status'));
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        // Fetch overall stats for buyer management
        $totalUsers = User::count();
        $activeUsers = User::where('account_status', 'active')->count();
        $suspendedUsers = User::where('account_status', 'suspended')->count();
        $totalBalance = User::sum('wallet_balance');

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'stats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'suspended_users' => $suspendedUsers,
                'total_balance' => $totalBalance,
            ]
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Fetch recent orders
        $recentOrders = Order::where('user_id', $user->id)
            ->with(['product'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Calculate user spending
        $totalSpending = $user->totalSpending();

        // Security Info
        $securityInfo = [
            'has_verified_email' => !is_null($user->email_verified_at),
            'has_verified_phone' => !is_null($user->phone_verified_at),
            'two_factor_enabled' => false, // Placeholder or config dependent
            'joined_at' => $user->created_at->toIso8601String(),
        ];

        return response()->json([
            'user' => $user,
            'stats' => [
                'total_spending' => $totalSpending,
                'order_count' => Order::where('user_id', $user->id)->count(),
            ],
            'recent_orders' => $recentOrders,
            'security_info' => $securityInfo,
        ]);
    }

    public function adjustBalance(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'action' => ['required', 'in:topup,deduct'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'notes'  => ['nullable', 'string', 'max:255'],
        ]);

        $oldBalance = $user->wallet_balance;

        DB::transaction(function () use ($user, $data, $oldBalance, $request) {
            if ($data['action'] === 'topup') {
                $user->increment('wallet_balance', $data['amount']);
            } else {
                if ($user->wallet_balance < $data['amount']) {
                    throw new \InvalidArgumentException("Saldo tidak mencukupi untuk melakukan pemotongan.");
                }
                $user->decrement('wallet_balance', $data['amount']);
            }

            // Reload user
            $user->refresh();

            // Log Audit
            AuditLog::create([
                'admin_id' => auth()->id() ?? 1,
                'action' => 'ADJUST_BALANCE',
                'target_table' => 'users',
                'metadata_json' => [
                    'user_id' => $user->id,
                    'action' => $data['action'],
                    'amount' => $data['amount'],
                    'old_balance' => $oldBalance,
                    'new_balance' => $user->wallet_balance,
                    'notes' => $data['notes'] ?? '',
                ],
                'ip_address' => $request->ip(),
            ]);
        });

        return response()->json([
            'message' => 'Saldo berhasil disesuaikan!',
            'wallet_balance' => $user->wallet_balance,
        ]);
    }

    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'status' => ['required', 'in:active,suspended'],
        ]);

        $oldStatus = $user->account_status;
        $user->account_status = $data['status'];
        $user->save();

        AuditLog::create([
            'admin_id' => auth()->id() ?? 1,
            'action' => 'TOGGLE_USER_STATUS',
            'target_table' => 'users',
            'metadata_json' => [
                'user_id' => $user->id,
                'old_status' => $oldStatus,
                'new_status' => $data['status'],
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Status akun berhasil diperbarui!',
            'account_status' => $user->account_status,
        ]);
    }

    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user->password = Hash::make($data['password']);
        $user->save();

        AuditLog::create([
            'admin_id' => auth()->id() ?? 1,
            'action' => 'RESET_USER_PASSWORD',
            'target_table' => 'users',
            'metadata_json' => [
                'user_id' => $user->id,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Password user berhasil direset!',
        ]);
    }
}
