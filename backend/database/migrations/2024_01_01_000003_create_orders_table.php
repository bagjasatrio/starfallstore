<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('Public-facing order identifier');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('package_id')->constrained();
            $table->unsignedBigInteger('account_stock_id')->nullable();

            // Game target info
            $table->string('game_user_id', 100)->nullable()->comment('Player ID / User ID');
            $table->string('game_server_id', 50)->nullable()->comment('Zone / Server ID');
            $table->string('game_nickname', 100)->nullable()->comment('Retrieved via nickname check');
            $table->string('buyer_phone', 20)->nullable()->comment('For guest / WhatsApp notification');
            $table->string('buyer_email', 255)->nullable()->comment('For guest / email notification');

            // Payment
            $table->enum('payment_method', ['qris', 'va', 'ovo', 'dana', 'gopay', 'shopeepay'])->default('qris');
            $table->string('payment_channel', 50)->nullable()->comment('e.g. BCA, BRI, Mandiri for VA');
            $table->decimal('amount', 15, 2);
            $table->decimal('admin_fee', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);

            // Status tracking
            $table->enum('status', [
                'unpaid',
                'paid',
                'processing',
                'completed',
                'failed',
                'refunded',
                'expired',
            ])->default('unpaid');

            // External references
            $table->string('cashi_invoice_id')->nullable()->unique()->comment('CASHI.ID invoice ID');
            $table->string('cashi_payment_url')->nullable();
            $table->string('cashi_qris_url')->nullable()->comment('QRIS image URL from CASHI');
            $table->string('cashi_va_number', 50)->nullable()->comment('Virtual Account number');
            $table->string('digiflazz_ref_id', 100)->nullable()->unique()->comment('Digiflazz transaction ref');
            $table->string('digiflazz_trx_id', 100)->nullable();
            $table->string('digiflazz_sn', 255)->nullable()->comment('Serial number from Digiflazz');

            // Retry tracking
            $table->tinyInteger('retry_count')->default(0);
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable()->comment('Payment expiry (15 minutes)');

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indices — critical for performance
            $table->index('uuid');
            $table->index('status');
            $table->index('user_id');
            $table->index(['status', 'created_at']);
            $table->index('cashi_invoice_id');
            $table->index('buyer_phone');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
