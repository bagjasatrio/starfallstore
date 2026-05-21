<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_inventories', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->string('email');
            $table->text('encrypted_password');
            $table->string('digiflazz_sku')->nullable();
            $table->enum('status', ['available', 'sold', 'hold'])->default('available');
            $table->timestamps();
            $table->softDeletes();

            // Indices for queries
            $table->index('status');
            $table->index('product_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_inventories');
    }
};
