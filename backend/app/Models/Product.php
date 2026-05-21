<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'category',
        'game_code',
        'publisher',
        'banner_url',
        'thumbnail_url',
        'description',
        'platforms',
        'genre',
        'is_active',
        'requires_server_id',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'platforms' => 'array',
            'is_active' => 'boolean',
            'requires_server_id' => 'boolean',
        ];
    }

    // ─── Boot ─────────────────────────────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function packages()
    {
        return $this->hasMany(Package::class)->orderBy('sort_order');
    }

    public function activePackages()
    {
        return $this->hasMany(Package::class)->where('is_active', true)->orderBy('sort_order');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function stockAccounts()
    {
        return $this->hasMany(AccountStock::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function getStartingPriceAttribute(): float
    {
        return $this->activePackages()->min('selling_price') ?? 0;
    }
}
