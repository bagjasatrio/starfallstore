<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::withCount('packages')
            ->orderBy('sort_order')
            ->get();

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'category'           => ['required', 'string', 'in:game,pulsa,ewallet,voucher,tagihan,joki'],
            'game_code'          => ['nullable', 'string', 'max:50'],
            'publisher'          => ['nullable', 'string', 'max:255'],
            'banner_url'         => ['nullable', 'url', 'max:2048'],
            'thumbnail_url'      => ['nullable', 'url', 'max:2048'],
            'description'        => ['nullable', 'string'],
            'platforms'          => ['nullable', 'array'],
            'genre'              => ['nullable', 'string', 'max:50'],
            'is_active'          => ['boolean'],
            'requires_server_id' => ['boolean'],
            'sort_order'         => ['integer'],
            'packages'           => ['nullable', 'array'],
            'packages.*.name'           => ['required', 'string', 'max:255'],
            'packages.*.sku'            => ['required', 'string', 'max:100', 'unique:packages,sku'],
            'packages.*.description'    => ['nullable', 'string', 'max:255'],
            'packages.*.base_price'     => ['required', 'numeric', 'min:0'],
            'packages.*.selling_price'  => ['required', 'numeric', 'min:0'],
            'packages.*.quantity'       => ['required', 'integer', 'min:1'],
            'packages.*.currency_label' => ['required', 'string', 'max:30'],
            'packages.*.is_active'      => ['boolean'],
            'packages.*.is_popular'     => ['boolean'],
            'packages.*.sort_order'     => ['integer'],
        ]);

        $product = DB::transaction(function () use ($data) {
            $packagesData = $data['packages'] ?? [];
            unset($data['packages']);

            $product = Product::create($data);

            foreach ($packagesData as $pkgData) {
                $product->packages()->create($pkgData);
            }

            return $product->load('packages');
        });

        return response()->json([
            'message' => 'Produk berhasil dibuat!',
            'product' => $product,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('packages')->findOrFail($id);
        return response()->json($product);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'category'           => ['required', 'string', 'in:game,pulsa,ewallet,voucher,tagihan,joki'],
            'game_code'          => ['nullable', 'string', 'max:50'],
            'publisher'          => ['nullable', 'string', 'max:255'],
            'banner_url'         => ['nullable', 'url', 'max:2048'],
            'thumbnail_url'      => ['nullable', 'url', 'max:2048'],
            'description'        => ['nullable', 'string'],
            'platforms'          => ['nullable', 'array'],
            'genre'              => ['nullable', 'string', 'max:50'],
            'is_active'          => ['boolean'],
            'requires_server_id' => ['boolean'],
            'sort_order'         => ['integer'],
            'packages'           => ['nullable', 'array'],
            'packages.*.id'             => ['nullable', 'integer', 'exists:packages,id'],
            'packages.*.name'           => ['required', 'string', 'max:255'],
            'packages.*.sku'            => ['required', 'string', 'max:100'],
            'packages.*.description'    => ['nullable', 'string', 'max:255'],
            'packages.*.base_price'     => ['required', 'numeric', 'min:0'],
            'packages.*.selling_price'  => ['required', 'numeric', 'min:0'],
            'packages.*.quantity'       => ['required', 'integer', 'min:1'],
            'packages.*.currency_label' => ['required', 'string', 'max:30'],
            'packages.*.is_active'      => ['boolean'],
            'packages.*.is_popular'     => ['boolean'],
            'packages.*.sort_order'     => ['integer'],
        ]);

        $product = DB::transaction(function () use ($product, $data) {
            $packagesData = $data['packages'] ?? [];
            unset($data['packages']);

            // Update slug if name changes
            if ($product->name !== $data['name']) {
                $product->slug = Str::slug($data['name']);
            }

            $product->update($data);

            $keepIds = [];
            foreach ($packagesData as $pkgData) {
                if (isset($pkgData['id'])) {
                    $package = Package::where('product_id', $product->id)->findOrFail($pkgData['id']);
                    $package->update($pkgData);
                    $keepIds[] = $package->id;
                } else {
                    // Check unique SKU for new package
                    $request = request();
                    $request->validate([
                        'sku' => 'unique:packages,sku',
                    ]);
                    $newPkg = $product->packages()->create($pkgData);
                    $keepIds[] = $newPkg->id;
                }
            }

            // Remove any packages not sent in update
            $product->packages()->whereNotIn('id', $keepIds)->delete();

            return $product->load('packages');
        });

        return response()->json([
            'message' => 'Produk berhasil diubah!',
            'product' => $product,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        DB::transaction(function () use ($product) {
            $product->packages()->delete();
            $product->delete();
        });

        return response()->json([
            'message' => 'Produk berhasil dihapus!',
        ]);
    }
}
