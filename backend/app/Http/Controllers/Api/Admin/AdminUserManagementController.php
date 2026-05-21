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
use Illuminate\Validation\Rule;

class AdminUserManagementController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'unique:users'],
            'email'    => ['required', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', 'in:admin,buyer'],
        ]);

        $user = User::create([
            'name'           => $data['name'],
            'username'       => strtolower($data['username']),
            'email'          => strtolower($data['email']),
            'password'       => Hash::make($data['password']),
            'role'           => $data['role'],
            'account_status' => 'active',
            'wallet_balance' => 0,
        ]);

        AuditLog::create([
            'admin_id'      => auth()->id() ?? 1,
            'action'        => 'CREATE_USER',
            'target_table'  => 'users',
            'metadata_json' => [
                'user_id'  => $user->id,
                'role'     => $user->role,
                'email'    => $user->email,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Akun pengguna berhasil dibuat!',
            'user'    => $user,
        ], 201);
    }

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

        // Fetch overall stats for user management
        $totalAdmin = User::where('role', 'admin')->count();
        $totalBuyer = User::where('role', 'buyer')->count();

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'stats' => [
                'total_admin' => $totalAdmin,
                'total_buyer' => $totalBuyer,
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
            'two_factor_enabled' => false,
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

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'email'    => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role'     => ['required', 'in:admin,buyer'],
        ]);

        $user->update($data);

        AuditLog::create([
            'admin_id' => auth()->id() ?? 1,
            'action' => 'UPDATE_USER',
            'target_table' => 'users',
            'metadata_json' => [
                'user_id' => $user->id,
                'updated_fields' => $data,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Data user berhasil diperbarui!',
            'user' => $user,
        ]);
    }

    public function adjustBalance(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'action' => ['required', 'in:topup,deduct'],
            'amount' => ['required', 'numeric', 'min:1'],
            'notes'  => ['nullable', 'string', 'max:255'],
        ]);

        $oldBalance = $user->wallet_balance;

        DB::transaction(function () use ($user, $data, $oldBalance, $request) {
            if ($data['action'] === 'topup') {
                $user->wallet_balance += $data['amount'];
                $user->save();
            } else {
                if ($user->wallet_balance < $data['amount']) {
                    throw new \InvalidArgumentException("Saldo tidak mencukupi untuk melakukan pemotongan.");
                }
                $user->wallet_balance -= $data['amount'];
                $user->save();
            }

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
