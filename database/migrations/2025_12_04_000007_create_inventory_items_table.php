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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->enum('type', [
                'yarn',
                'tufting_cloth',
                'backing_cloth',
                'carpet_tile_vinyl',
                'backing_glue',
                'glue_stick',
                'accessory'
            ])->default('yarn');
            $table->string('color')->nullable(); // For yarn colors
            $table->string('unit')->default('grams'); // grams, kg, meters, pieces, pack
            $table->decimal('unit_cost', 12, 4)->default(0); // Cost per unit
            $table->decimal('reorder_point', 12, 2)->default(0);
            $table->decimal('current_stock', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // For pack size (glue sticks: 8), weight per unit, etc
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
