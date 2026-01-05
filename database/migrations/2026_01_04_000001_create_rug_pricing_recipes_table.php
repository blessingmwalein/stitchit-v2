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
        Schema::create('rug_pricing_recipes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('reference_width_cm', 10, 2)->nullable()->comment('Reference rug width in cm (e.g., 70)');
            $table->decimal('reference_height_cm', 10, 2)->nullable()->comment('Reference rug height in cm (e.g., 70)');
            $table->decimal('reference_price', 10, 2)->nullable()->comment('Reference price for this size (e.g., $50)');
            $table->decimal('min_price', 10, 2)->nullable()->comment('Minimum price for this size (e.g., $45)');
            $table->decimal('max_price', 10, 2)->nullable()->comment('Maximum price for this size (e.g., $55)');
            $table->decimal('profit_margin_percentage', 5, 2)->default(0)->comment('Default profit margin %');
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable()->comment('Additional configuration data');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rug_pricing_recipes');
    }
};
