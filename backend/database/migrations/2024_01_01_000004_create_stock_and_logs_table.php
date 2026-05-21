<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->text('credentials_encrypted')->comment('Encrypted account credentials (JSON)');
            $table->enum('status', ['available', 'reserved', 'sold', 'invalid'])->default('available');
            $table->foreignId('assigned_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Critical index for pessimistic locking queries
            $table->index(['product_id', 'status']);
            $table->index('status');
        });

        Schema::create('transaction_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('event', 100)->comment('e.g. order.created, payment.received, topup.sent');
            $table->string('source', 50)->default('system')->comment('system, cashi_webhook, digiflazz_webhook');
            $table->json('payload')->nullable()->comment('Full webhook/API payload for auditing');
            $table->string('status', 50)->nullable();
            $table->text('message')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'event']);
            $table->index('event');
            $table->index('created_at');
        });

        // Resolve circular dependency by adding foreign key constraint to orders
        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('account_stock_id')->references('id')->on('accounts_stock')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['account_stock_id']);
        });

        Schema::dropIfExists('transaction_logs');
        Schema::dropIfExists('accounts_stock');
    }
};
