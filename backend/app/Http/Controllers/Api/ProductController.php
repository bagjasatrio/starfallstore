<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::active()->with('activePackages');

        if ($request->filled('category')) {
            $query->category($request->category);
        }

        if ($request->filled('genre')) {
            $query->where('genre', $request->genre);
        }

        if ($request->filled('search')) {
            $query->where('name', 'ILIKE', '%' . $request->search . '%');
        }

        $products = $query->orderBy('sort_order')->paginate(20);

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->active()
            ->with('activePackages')
            ->firstOrFail();

        return response()->json([
            'product'  => $product,
            'packages' => $product->activePackages,
        ]);
    }

    public function popular(): JsonResponse
    {
        $products = Product::active()
            ->where('category', 'game')
            ->orderBy('sort_order')
            ->limit(6)
            ->get(['id', 'name', 'slug', 'banner_url', 'genre', 'publisher']);

        return response()->json(['products' => $products]);
    }
}
