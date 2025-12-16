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
        Schema::create('bom_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_job_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->decimal('planned_quantity', 12, 2);
            $table->string('unit');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('production_job_id');
            $table->index('order_item_id');
            $table->index('inventory_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bom_lines');
    }
};
