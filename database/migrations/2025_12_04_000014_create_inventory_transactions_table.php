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
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('stock_lot_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('reference_type', [
                'PURCHASE_RECEIPT',
                'MANUAL_ADJUSTMENT',
                'CONSUMPTION',
                'RETURN',
                'DAMAGE'
            ]);
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->decimal('quantity_change', 12, 2); // can be negative
            $table->decimal('unit_cost_before', 12, 4)->nullable();
            $table->decimal('unit_cost_after', 12, 4)->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('inventory_item_id');
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
