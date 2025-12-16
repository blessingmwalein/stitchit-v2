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
        Schema::create('production_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->enum('state', [
                'PLANNED',
                'MATERIALS_ALLOCATED',
                'TUFTING',
                'FINISHING',
                'QUALITY_CHECK',
                'COMPLETED'
            ])->default('PLANNED');
            $table->timestamp('planned_start_at')->nullable();
            $table->timestamp('planned_end_at')->nullable();
            $table->timestamp('actual_start_at')->nullable();
            $table->timestamp('actual_end_at')->nullable();
            $table->decimal('estimated_material_cost', 12, 2)->default(0);
            $table->decimal('actual_material_cost', 12, 2)->default(0);
            $table->decimal('estimated_labor_hours', 8, 2)->default(0);
            $table->decimal('actual_labor_hours', 8, 2)->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('state');
            $table->index(['order_item_id', 'state']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_jobs');
    }
};
