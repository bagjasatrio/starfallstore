<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter the wallet_balance column safely for PostgreSQL
        DB::statement('ALTER TABLE users ALTER COLUMN wallet_balance DROP DEFAULT');
        DB::statement('ALTER TABLE users ALTER COLUMN wallet_balance TYPE bigint USING wallet_balance::bigint');
        DB::statement('ALTER TABLE users ALTER COLUMN wallet_balance SET DEFAULT 0');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users ALTER COLUMN wallet_balance DROP DEFAULT');
        DB::statement('ALTER TABLE users ALTER COLUMN wallet_balance TYPE numeric(15,2) USING wallet_balance::numeric');
        DB::statement('ALTER TABLE users ALTER COLUMN wallet_balance SET DEFAULT 0');
    }
};
