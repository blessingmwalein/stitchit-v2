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
        Schema::create('stock_lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('purchase_line_id')->nullable()->constrained()->nullOnDelete();
            $table->string('lot_number')->nullable();
            $table->decimal('quantity_received', 12, 2);
            $table->decimal('quantity_remaining', 12, 2);
            $table->decimal('unit_cost', 12, 4);
            $table->timestamp('received_at');
            $table->timestamps();
            $table->softDeletes();

            $table->index('inventory_item_id');
            $table->index(['inventory_item_id', 'quantity_remaining']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_lots');
    }
};
