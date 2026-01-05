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
        Schema::create('finished_products', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('production_job_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            
            // Product details (in case no order)
            $table->string('product_name')->nullable();
            $table->text('description')->nullable();
            $table->decimal('length', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->string('unit')->default('cm');
            
            // Quality and status
            $table->enum('quality_status', ['PASSED', 'FAILED', 'NEEDS_REWORK'])->default('PASSED');
            $table->text('quality_notes')->nullable();
            $table->foreignId('quality_checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('quality_checked_at')->nullable();
            
            // Storage and location
            $table->string('storage_location')->nullable();
            $table->enum('status', ['IN_STOCK', 'RESERVED', 'DELIVERED', 'SOLD'])->default('IN_STOCK');
            
            // Use case for filtering
            $table->enum('use_case', ['Modern', 'Corporate', 'Home', 'Hotel', 'School'])->nullable();
            
            // Pricing for non-order products
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            
            // Images
            $table->json('images')->nullable();
            $table->string('primary_image')->nullable();
            
            // Publishing for client portal
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('reference');
            $table->index('production_job_id');
            $table->index('order_id');
            $table->index('client_id');
            $table->index('status');
            $table->index('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('finished_products');
    }
};
