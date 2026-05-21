<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function index()
    {
        $vouchers = Voucher::latest()->get();
        return response()->json(['vouchers' => $vouchers]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vouchers,code',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'valid_until' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $voucher = Voucher::create($validated);
        return response()->json(['message' => 'Voucher created successfully', 'voucher' => $voucher]);
    }

    public function show(string $id)
    {
        $voucher = Voucher::findOrFail($id);
        return response()->json(['voucher' => $voucher]);
    }

    public function update(Request $request, string $id)
    {
        $voucher = Voucher::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vouchers,code,'.$id,
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'valid_until' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $voucher->update($validated);
        return response()->json(['message' => 'Voucher updated successfully', 'voucher' => $voucher]);
    }

    public function destroy(string $id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();
        return response()->json(['message' => 'Voucher deleted successfully']);
    }
}
