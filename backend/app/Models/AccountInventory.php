<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountInventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'account_inventories';

    protected $fillable = [
        'product_name',
        'email',
        'encrypted_password',
        'digiflazz_sku',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'encrypted_password' => 'encrypted',
            'status' => 'string',
        ];
    }
}
