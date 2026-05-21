<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'max_uses',
        'uses_count',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
