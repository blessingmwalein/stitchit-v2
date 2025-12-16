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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->enum('state', [
                'DRAFT',
                'PENDING_DEPOSIT',
                'DEPOSIT_PAID',
                'IN_PRODUCTION',
                'READY_FOR_DISPATCH',
                'DISPATCHED',
                'CLOSED',
                'ARCHIVED'
            ])->default('DRAFT');
            $table->decimal('deposit_percent', 5, 2)->default(0);
            $table->decimal('deposit_required_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('balance_due', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->text('delivery_address')->nullable();
            $table->string('delivery_contact')->nullable();
            $table->enum('preferred_dimensions_unit', ['cm', 'm', 'in', 'ft'])->default('cm');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['client_id', 'state']);
            $table->index('state');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
