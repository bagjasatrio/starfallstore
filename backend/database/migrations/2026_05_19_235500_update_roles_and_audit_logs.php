<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the check constraint first for PostgreSQL enum
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");

        // First map existing 'buyer' to 'customer'
        DB::statement("UPDATE users SET role = 'customer' WHERE role = 'buyer'");

        // Alter enum to string in PostgreSQL
        DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50)");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer'");

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 50);
            $table->string('target_table', 50)->nullable();
            $table->json('metadata_json')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('admin_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'buyer'");
        DB::statement("UPDATE users SET role = 'buyer' WHERE role = 'customer'");
    }
};
