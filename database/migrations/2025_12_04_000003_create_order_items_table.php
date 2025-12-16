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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->nullable();
            $table->string('description');
            $table->integer('quantity')->default(1);
            $table->decimal('width', 10, 2); // stored in cm
            $table->decimal('height', 10, 2); // stored in cm
            $table->enum('unit', ['cm', 'm', 'in', 'ft'])->default('cm');
            $table->decimal('area', 12, 4)->nullable(); // computed
            $table->decimal('planned_price', 12, 2)->default(0);
            $table->string('design_image_path')->nullable(); // file path in storage
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
