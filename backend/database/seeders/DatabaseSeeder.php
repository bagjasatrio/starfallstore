<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Seed Admin User ──────────────────────────────────────────────────
        User::create([
            'name' => 'Admin Starfall',
            'username' => 'admin',
            'email' => 'admin@starfallstore.com',
            'phone' => '081234567890',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'admin',
            'wallet_balance' => 1000000.00,
            'is_active' => true,
        ]);

        // ── Seed Buyer User ──────────────────────────────────────────────────
        User::create([
            'name' => 'Buyer Starfall',
            'username' => 'buyer',
            'email' => 'buyer@starfallstore.com',
            'phone' => '081234567891',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'buyer',
            'wallet_balance' => 500000.00,
            'is_active' => true,
        ]);

        // ── Seed Products and Packages ───────────────────────────────────────
        $games = [
            [
                'name' => 'Mobile Legends: Bang Bang',
                'slug' => 'mobile-legends',
                'category' => 'game',
                'genre' => 'MOBA',
                'publisher' => 'Moonton',
                'thumbnail_url' => 'https://picsum.photos/seed/ml_thumb/300/300',
                'banner_url' => 'https://picsum.photos/seed/ml_banner/1200/400',
                'requires_server_id' => true,
                'is_active' => true,
                'description' => 'Top Up Diamond Mobile Legends murah dan cepat.',
                'packages' => [
                    ['sku' => 'ML-D5', 'name' => '5 Diamonds', 'quantity' => 5, 'currency_label' => 'Diamonds', 'base_price' => 1200, 'selling_price' => 1500, 'is_active' => true],
                    ['sku' => 'ML-D12', 'name' => '12 Diamonds', 'quantity' => 12, 'currency_label' => 'Diamonds', 'base_price' => 3000, 'selling_price' => 3500, 'is_active' => true],
                    ['sku' => 'ML-D28', 'name' => '28 Diamonds', 'quantity' => 28, 'currency_label' => 'Diamonds', 'base_price' => 7000, 'selling_price' => 8000, 'is_active' => true, 'is_popular' => true],
                    ['sku' => 'ML-D85', 'name' => '85 Diamonds', 'quantity' => 85, 'currency_label' => 'Diamonds', 'base_price' => 18000, 'selling_price' => 20000, 'is_active' => true],
                    ['sku' => 'ML-D170', 'name' => '170 Diamonds', 'quantity' => 170, 'currency_label' => 'Diamonds', 'base_price' => 36000, 'selling_price' => 40000, 'is_active' => true],
                ]
            ],
            [
                'name' => 'Valorant',
                'slug' => 'valorant',
                'category' => 'game',
                'genre' => 'FPS',
                'publisher' => 'Riot Games',
                'thumbnail_url' => 'https://picsum.photos/seed/val_thumb/300/300',
                'banner_url' => 'https://picsum.photos/seed/val_banner/1200/400',
                'requires_server_id' => false,
                'is_active' => true,
                'description' => 'Top Up Points Valorant instant 24 jam.',
                'packages' => [
                    ['sku' => 'VAL-P125', 'name' => '125 Points', 'quantity' => 125, 'currency_label' => 'Points', 'base_price' => 13500, 'selling_price' => 15000, 'is_active' => true],
                    ['sku' => 'VAL-P380', 'name' => '380 Points', 'quantity' => 380, 'currency_label' => 'Points', 'base_price' => 38000, 'selling_price' => 42000, 'is_active' => true],
                    ['sku' => 'VAL-P1000', 'name' => '1000 Points', 'quantity' => 1000, 'currency_label' => 'Points', 'base_price' => 90000, 'selling_price' => 98000, 'is_active' => true, 'is_popular' => true],
                ]
            ],
            [
                'name' => 'Genshin Impact',
                'slug' => 'genshin-impact',
                'category' => 'game',
                'genre' => 'RPG',
                'publisher' => 'HoYoverse',
                'thumbnail_url' => 'https://picsum.photos/seed/gi_thumb/300/300',
                'banner_url' => 'https://picsum.photos/seed/gi_banner/1200/400',
                'requires_server_id' => true,
                'is_active' => true,
                'description' => 'Top Up Genesis Crystals Genshin Impact harga bersaing.',
                'packages' => [
                    ['sku' => 'GI-C60', 'name' => '60 Crystals', 'quantity' => 60, 'currency_label' => 'Crystals', 'base_price' => 14000, 'selling_price' => 16500, 'is_active' => true],
                    ['sku' => 'GI-C300', 'name' => '300 Crystals', 'quantity' => 300, 'currency_label' => 'Crystals', 'base_price' => 69000, 'selling_price' => 79000, 'is_active' => true],
                    ['sku' => 'GI-C980', 'name' => '980 Crystals', 'quantity' => 980, 'currency_label' => 'Crystals', 'base_price' => 205000, 'selling_price' => 220000, 'is_active' => true],
                ]
            ],
            [
                'name' => 'PUBG Mobile',
                'slug' => 'pubg-mobile',
                'category' => 'game',
                'genre' => 'Battle Royale',
                'publisher' => 'Level Infinite',
                'thumbnail_url' => 'https://picsum.photos/seed/pubg_thumb/300/300',
                'banner_url' => 'https://picsum.photos/seed/pubg_banner/1200/400',
                'requires_server_id' => false,
                'is_active' => true,
                'description' => 'Beli UC PUBG Mobile murah langsung masuk.',
                'packages' => [
                    ['sku' => 'PUBG-U32', 'name' => '32 Unknown Cash', 'quantity' => 32, 'currency_label' => 'UC', 'base_price' => 6000, 'selling_price' => 7000, 'is_active' => true],
                    ['sku' => 'PUBG-U60', 'name' => '60 Unknown Cash', 'quantity' => 60, 'currency_label' => 'UC', 'base_price' => 12500, 'selling_price' => 14500, 'is_active' => true],
                    ['sku' => 'PUBG-U325', 'name' => '325 Unknown Cash', 'quantity' => 325, 'currency_label' => 'UC', 'base_price' => 60000, 'selling_price' => 67000, 'is_active' => true, 'is_popular' => true],
                ]
            ],
            [
                'name' => 'Free Fire',
                'slug' => 'free-fire',
                'category' => 'game',
                'genre' => 'Battle Royale',
                'publisher' => 'Garena',
                'thumbnail_url' => 'https://picsum.photos/seed/ff_thumb/300/300',
                'banner_url' => 'https://picsum.photos/seed/ff_banner/1200/400',
                'requires_server_id' => false,
                'is_active' => true,
                'description' => 'Top Up Diamond FF Garena murah meriah.',
                'packages' => [
                    ['sku' => 'FF-D5', 'name' => '5 Diamonds', 'quantity' => 5, 'currency_label' => 'Diamonds', 'base_price' => 800, 'selling_price' => 1000, 'is_active' => true],
                    ['sku' => 'FF-D12', 'name' => '12 Diamonds', 'quantity' => 12, 'currency_label' => 'Diamonds', 'base_price' => 1800, 'selling_price' => 2200, 'is_active' => true],
                    ['sku' => 'FF-D50', 'name' => '50 Diamonds', 'quantity' => 50, 'currency_label' => 'Diamonds', 'base_price' => 7000, 'selling_price' => 8000, 'is_active' => true, 'is_popular' => true],
                ]
            ],
        ];

        foreach ($games as $gameData) {
            $packages = $gameData['packages'];
            unset($gameData['packages']);

            $product = \App\Models\Product::create($gameData);
            foreach ($packages as $pkg) {
                $product->packages()->create($pkg);
            }
        }
    }
}
