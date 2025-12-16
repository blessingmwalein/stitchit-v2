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
        Schema::create('material_consumptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_job_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['estimated', 'actual'])->default('estimated');
            $table->decimal('quantity', 12, 2); // Amount used
            $table->decimal('unit_cost', 12, 4); // Cost per unit at time of consumption
            $table->decimal('total_cost', 12, 2); // quantity * unit_cost
            $table->decimal('waste_quantity', 12, 2)->default(0); // Only for actual
            $table->foreignId('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('recorded_at');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('production_job_id');
            $table->index('inventory_item_id');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_consumptions');
    }
};
