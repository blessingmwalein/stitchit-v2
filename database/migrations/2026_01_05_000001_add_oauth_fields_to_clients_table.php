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
            $table->string('google_id')->nullable()->unique()->after('email');
            $table->string('auth_provider')->nullable()->after('google_id'); // 'google', 'facebook', etc.
            $table->string('avatar')->nullable()->after('auth_provider');
            $table->string('password')->nullable()->change(); // Make password nullable for OAuth users
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'auth_provider', 'avatar']);
        });
    }
};
