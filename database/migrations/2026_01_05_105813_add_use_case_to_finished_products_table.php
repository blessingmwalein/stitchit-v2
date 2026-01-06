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
        if (! Schema::hasColumn('finished_products', 'use_case')) {
            Schema::table('finished_products', function (Blueprint $table) {
                $table->enum('use_case', ['Modern', 'Corporate', 'Home', 'Hotel', 'School'])->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('finished_products', 'use_case')) {
            Schema::table('finished_products', function (Blueprint $table) {
                $table->dropColumn('use_case');
            });
        }
    }
};
