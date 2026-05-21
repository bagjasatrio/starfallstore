<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\Package;
use Illuminate\Http\Request;

class VoucherCheckController extends Controller
{
    public function check(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'package_id' => 'required|exists:packages,id',
        ]);

        $voucher = Voucher::where('code', $request->code)->first();

        if (!$voucher) {
            return response()->json(['message' => 'Voucher tidak ditemukan.'], 404);
        }

        if (!$voucher->is_active) {
            return response()->json(['message' => 'Voucher tidak aktif.'], 400);
        }

        if ($voucher->valid_until && $voucher->valid_until < now()) {
            return response()->json(['message' => 'Voucher sudah kedaluwarsa.'], 400);
        }

        if ($voucher->max_uses && $voucher->uses_count >= $voucher->max_uses) {
            return response()->json(['message' => 'Kuota voucher sudah habis.'], 400);
        }

        $package = Package::findOrFail($request->package_id);
        $sellingPrice = (float) $package->selling_price;
        
        $discountAmount = 0;
        if ($voucher->discount_type === 'percentage') {
            $discountAmount = $sellingPrice * ((float) $voucher->discount_value / 100);
        } else {
            $discountAmount = (float) $voucher->discount_value;
        }

        // Ensure discount doesn't exceed selling price
        if ($discountAmount > $sellingPrice) {
            $discountAmount = $sellingPrice;
        }

        return response()->json([
            'message' => 'Voucher berhasil diterapkan.',
            'voucher' => [
                'id' => $voucher->id,
                'code' => $voucher->code,
                'discount_type' => $voucher->discount_type,
                'discount_value' => $voucher->discount_value,
            ],
            'discount_amount' => $discountAmount,
        ]);
    }
}
