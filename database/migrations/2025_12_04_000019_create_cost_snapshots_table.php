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
        Schema::create('cost_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_job_id')->constrained()->cascadeOnDelete();
            $table->decimal('budgeted_cost', 12, 2)->default(0);
            $table->decimal('actual_material_cost', 12, 2)->default(0);
            $table->decimal('labor_cost', 12, 2)->default(0);
            $table->decimal('overhead_allocated', 12, 2)->default(0);
            $table->decimal('actual_cost', 12, 2)->default(0);
            $table->decimal('variance', 12, 2)->default(0); // actual - budgeted
            $table->timestamp('captured_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('production_job_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cost_snapshots');
    }
};
