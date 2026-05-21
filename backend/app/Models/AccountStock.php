<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class AccountStock extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'accounts_stock';

    protected $fillable = [
        'product_id',
        'credentials_encrypted',
        'status',
        'assigned_order_id',
        'assigned_at',
        'notes',
    ];

    protected $hidden = [
        'credentials_encrypted',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function assignedOrder()
    {
        return $this->belongsTo(Order::class, 'assigned_order_id');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    // ─── Encrypted Credentials ────────────────────────────────────────────────

    /**
     * Set credentials, automatically encrypting before storage.
     */
    public function setCredentials(array $credentials): void
    {
        $this->credentials_encrypted = Crypt::encryptString(json_encode($credentials));
        $this->save();
    }

    /**
     * Get decrypted credentials as array.
     */
    public function getCredentials(): array
    {
        return json_decode(Crypt::decryptString($this->credentials_encrypted), true);
    }
}
