<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'event',
        'source',
        'payload',
        'status',
        'message',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
