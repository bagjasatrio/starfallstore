<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccountInventory;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminInventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AccountInventory::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('digiflazz_sku', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Product Name filter
        if ($request->filled('product_name')) {
            $query->where('product_name', $request->input('product_name'));
        }

        $inventories = $query->orderBy('created_at', 'desc')->paginate(15);

        // Calculate summary stats
        $totalStock = AccountInventory::count();
        $availableStock = AccountInventory::where('status', 'available')->count();
        $holdStock = AccountInventory::where('status', 'hold')->count();
        $soldToday = AccountInventory::where('status', 'sold')
            ->whereDate('updated_at', Carbon::today())
            ->count();

        // Get unique product names for filtering dropdowns
        $products = AccountInventory::distinct()->pluck('product_name');

        return response()->json([
            'data' => $inventories->items(),
            'meta' => [
                'current_page' => $inventories->currentPage(),
                'last_page' => $inventories->lastPage(),
                'per_page' => $inventories->perPage(),
                'total' => $inventories->total(),
            ],
            'stats' => [
                'total_stock' => $totalStock,
                'available_stock' => $availableStock,
                'hold_stock' => $holdStock,
                'sold_today' => $soldToday,
            ],
            'products' => $products
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_name'       => ['required', 'string', 'max:255'],
            'digiflazz_sku'      => ['nullable', 'string', 'max:255'],
            // Mode: 'single' or 'bulk'
            'mode'               => ['required', 'in:single,bulk'],
            // Single Mode
            'email'              => ['required_if:mode,single', 'nullable', 'string', 'max:255'],
            'password'           => ['required_if:mode,single', 'nullable', 'string'],
            // Bulk Mode (delimited plain text, e.g., email|password or email|password|sku)
            'bulk_data'          => ['required_if:mode,bulk', 'nullable', 'string'],
        ]);

        $createdCount = 0;
        $insertedAccounts = [];

        DB::transaction(function () use ($data, &$createdCount, &$insertedAccounts, $request) {
            if ($data['mode'] === 'single') {
                $account = AccountInventory::create([
                    'product_name' => $data['product_name'],
                    'email' => $data['email'],
                    'encrypted_password' => $data['password'],
                    'digiflazz_sku' => $data['digiflazz_sku'] ?? null,
                    'status' => 'available',
                ]);
                $insertedAccounts[] = $account;
                $createdCount = 1;
            } else {
                $lines = explode("\n", $data['bulk_data']);
                foreach ($lines as $line) {
                    $trimmedLine = trim($line);
                    if (empty($trimmedLine)) {
                        continue;
                    }

                    $parts = explode('|', $trimmedLine);
                    if (count($parts) >= 2) {
                        $email = trim($parts[0]);
                        $password = trim($parts[1]);
                        $sku = isset($parts[2]) ? trim($parts[2]) : ($data['digiflazz_sku'] ?? null);

                        $account = AccountInventory::create([
                            'product_name' => $data['product_name'],
                            'email' => $email,
                            'encrypted_password' => $password,
                            'digiflazz_sku' => $sku,
                            'status' => 'available',
                        ]);
                        $insertedAccounts[] = $account;
                        $createdCount++;
                    }
                }
            }

            // Log Audit
            AuditLog::create([
                'admin_id' => auth()->id() ?? 1,
                'action' => 'ADD_ACCOUNT_INVENTORY',
                'target_table' => 'account_inventories',
                'metadata_json' => [
                    'mode' => $data['mode'],
                    'product_name' => $data['product_name'],
                    'count' => $createdCount,
                ],
                'ip_address' => $request->ip(),
            ]);
        });

        return response()->json([
            'message' => 'Stok akun berhasil ditambahkan!',
            'count' => $createdCount,
            'data' => $insertedAccounts,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $account = AccountInventory::findOrFail($id);

        $data = $request->validate([
            'product_name'  => ['sometimes', 'required', 'string', 'max:255'],
            'email'         => ['sometimes', 'required', 'string', 'max:255'],
            'password'      => ['sometimes', 'required', 'string'],
            'digiflazz_sku' => ['nullable', 'string', 'max:255'],
            'status'        => ['sometimes', 'required', 'in:available,sold,hold'],
        ]);

        if (isset($data['password'])) {
            $data['encrypted_password'] = $data['password'];
            unset($data['password']);
        }

        $oldStatus = $account->status;
        $account->update($data);

        // Log audit if status changed
        if (isset($data['status']) && $oldStatus !== $data['status']) {
            AuditLog::create([
                'admin_id' => auth()->id() ?? 1,
                'action' => 'UPDATE_ACCOUNT_STATUS',
                'target_table' => 'account_inventories',
                'metadata_json' => [
                    'id' => $account->id,
                    'old_status' => $oldStatus,
                    'new_status' => $data['status'],
                ],
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'message' => 'Stok akun berhasil diperbarui!',
            'data' => $account,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $account = AccountInventory::findOrFail($id);
        $account->delete();

        AuditLog::create([
            'admin_id' => auth()->id() ?? 1,
            'action' => 'DELETE_ACCOUNT_INVENTORY',
            'target_table' => 'account_inventories',
            'metadata_json' => [
                'id' => $id,
                'product_name' => $account->product_name,
                'email' => $account->email,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Stok akun berhasil dihapus!',
        ]);
    }
}
