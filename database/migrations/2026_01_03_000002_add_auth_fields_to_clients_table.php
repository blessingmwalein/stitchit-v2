<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // Check if columns don't exist before adding
            if (!Schema::hasColumn('clients', 'email')) {
                $table->string('email')->unique()->nullable()->after('phone');
            }
            if (!Schema::hasColumn('clients', 'username')) {
                $table->string('username')->unique()->nullable()->after('email');
            }
            if (!Schema::hasColumn('clients', 'password')) {
                $table->string('password')->nullable()->after('username');
            }
            if (!Schema::hasColumn('clients', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->after('password');
            }
            if (!Schema::hasColumn('clients', 'remember_token')) {
                $table->string('remember_token', 100)->nullable()->after('email_verified_at');
            }
            if (!Schema::hasColumn('clients', 'api_token')) {
                $table->text('api_token')->nullable()->after('remember_token');
            }
            if (!Schema::hasColumn('clients', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('api_token');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropUnique(['phone']);
            $table->dropColumn([
                'email',
                'username',
                'password',
                'email_verified_at',
                'remember_token',
                'api_token',
                'last_login_at',
            ]);
        });
    }
};
