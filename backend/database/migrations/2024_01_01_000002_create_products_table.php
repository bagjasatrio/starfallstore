<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('category', ['game', 'pulsa', 'ewallet', 'voucher', 'tagihan', 'joki'])->default('game');
            $table->string('game_code', 50)->nullable()->comment('Digiflazz game code prefix');
            $table->string('publisher')->nullable();
            $table->string('banner_url')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->text('description')->nullable();
            $table->json('platforms')->nullable()->comment('e.g. ["Mobile","PC"]');
            $table->string('genre', 50)->nullable()->comment('MOBA, FPS, RPG, etc.');
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_server_id')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indices
            $table->index('category');
            $table->index('is_active');
            $table->index(['category', 'is_active', 'sort_order']);
        });

        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('sku', 100)->unique()->comment('Digiflazz product code');
            $table->string('description')->nullable();
            $table->decimal('base_price', 15, 2)->comment('Cost from Digiflazz');
            $table->decimal('selling_price', 15, 2)->comment('Price shown to customer');
            $table->integer('quantity')->default(1)->comment('Amount of currency/items');
            $table->string('currency_label', 30)->nullable()->comment('e.g. Diamonds, VP, Robux');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indices
            $table->index(['product_id', 'is_active']);
            $table->index(['product_id', 'is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
        Schema::dropIfExists('products');
    }
};
