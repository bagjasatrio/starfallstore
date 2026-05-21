<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('voucher_id')->nullable()->after('amount')->constrained('vouchers')->nullOnDelete();
            $table->decimal('discount_amount', 15, 2)->default(0)->after('voucher_id');
            $table->decimal('supplier_price', 15, 2)->nullable()->after('discount_amount');
            $table->decimal('selling_price', 15, 2)->nullable()->after('supplier_price');
            $table->decimal('net_profit', 15, 2)->nullable()->after('selling_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['voucher_id']);
            $table->dropColumn(['voucher_id', 'discount_amount', 'supplier_price', 'selling_price', 'net_profit']);
        });
    }
};
