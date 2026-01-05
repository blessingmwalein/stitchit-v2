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
        Schema::create('rug_pricing_recipe_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rug_pricing_recipe_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->enum('calculation_type', ['per_sqcm', 'per_rug', 'fixed_amount'])->default('per_sqcm');
            $table->decimal('quantity', 15, 4)->comment('Quantity used (depends on calculation_type)');
            $table->string('unit')->nullable()->comment('Unit of measurement');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rug_pricing_recipe_items');
    }
};
