<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccountStock;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStockController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AccountStock::with(['product']);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $stock = $query->orderBy('created_at', 'desc')->paginate(30);

        // Optionally append decrypted credentials for admin viewing
        $stock->getCollection()->transform(function ($item) {
            try {
                $item->credentials = $item->getCredentials();
            } catch (\Exception $e) {
                $item->credentials = ['error' => 'Gagal dekripsi data'];
            }
            return $item;
        });

        return response()->json($stock);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id'    => ['required', 'exists:products,id'],
            'notes'         => ['nullable', 'string'],
            // Support single upload
            'credentials'   => ['nullable', 'array'],
            // Support bulk upload
            'bulk'          => ['nullable', 'array'],
            'bulk.*.credentials' => ['required', 'array'],
            'bulk.*.notes'       => ['nullable', 'string'],
        ]);

        $createdStock = [];

        DB::transaction(function () use ($data, &$createdStock) {
            // Process single upload if present
            if (isset($data['credentials'])) {
                $stock = new AccountStock();
                $stock->product_id = $data['product_id'];
                $stock->status = 'available';
                $stock->notes = $data['notes'] ?? null;
                $stock->setCredentials($data['credentials']);
                $createdStock[] = $stock->load('product');
            }

            // Process bulk upload if present
            if (isset($data['bulk'])) {
                foreach ($data['bulk'] as $item) {
                    $stock = new AccountStock();
                    $stock->product_id = $data['product_id'];
                    $stock->status = 'available';
                    $stock->notes = $item['notes'] ?? $data['notes'] ?? null;
                    $stock->setCredentials($item['credentials']);
                    $createdStock[] = $stock->load('product');
                }
            }
        });

        return response()->json([
            'message' => 'Stok akun berhasil ditambahkan!',
            'count'   => count($createdStock),
            'stock'   => $createdStock,
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $stock = AccountStock::findOrFail($id);

        if ($stock->status === 'sold') {
            return response()->json(['message' => 'Stok yang sudah terjual tidak dapat dihapus.'], 422);
        }

        $stock->delete();

        return response()->json([
            'message' => 'Stok akun berhasil dihapus!',
        ]);
    }
}
