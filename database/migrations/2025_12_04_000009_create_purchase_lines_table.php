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
        Schema::create('purchase_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->string('description')->nullable();
            $table->decimal('quantity_ordered', 12, 2);
            $table->decimal('quantity_received', 12, 2)->default(0);
            $table->decimal('unit_cost', 12, 4);
            $table->timestamps();
            $table->softDeletes();

            $table->index('purchase_order_id');
            $table->index('inventory_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_lines');
    }
};
