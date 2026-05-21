<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'product_id',
        'package_id',
        'account_stock_id',
        'game_user_id',
        'game_server_id',
        'game_nickname',
        'buyer_phone',
        'buyer_email',
        'payment_method',
        'payment_channel',
        'amount',
        'admin_fee',
        'total_amount',
        'status',
        'cashi_invoice_id',
        'cashi_payment_url',
        'cashi_qris_url',
        'cashi_va_number',
        'digiflazz_ref_id',
        'digiflazz_trx_id',
        'digiflazz_sn',
        'retry_count',
        'paid_at',
        'completed_at',
        'expires_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'admin_fee' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'completed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    // ─── Boot ─────────────────────────────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $order) {
            if (empty($order->uuid)) {
                $order->uuid = Str::uuid();
            }
        });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function accountStock()
    {
        return $this->belongsTo(AccountStock::class, 'account_stock_id');
    }

    public function logs()
    {
        return $this->hasMany(TransactionLog::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isUnpaid(): bool { return $this->status === 'unpaid'; }
    public function isPaid(): bool { return $this->status === 'paid'; }
    public function isProcessing(): bool { return $this->status === 'processing'; }
    public function isCompleted(): bool { return $this->status === 'completed'; }
    public function isFailed(): bool { return $this->status === 'failed'; }
    public function isExpired(): bool { return $this->status === 'expired'; }

    public function addLog(string $event, array $payload = [], string $source = 'system', ?string $message = null): TransactionLog
    {
        return $this->logs()->create([
            'event' => $event,
            'source' => $source,
            'payload' => $payload,
            'status' => $this->status,
            'message' => $message,
        ]);
    }
}
