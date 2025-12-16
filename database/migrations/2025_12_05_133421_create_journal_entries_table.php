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
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // JE-001, JE-002, etc.
            $table->date('transaction_date'); // Date of the transaction
            $table->enum('type', [
                'GENERAL', 'SALES', 'PURCHASE', 'PAYMENT', 'RECEIPT', 
                'EXPENSE', 'ADJUSTMENT', 'DEPRECIATION', 'INVENTORY'
            ]); // Journal entry type
            $table->text('description')->nullable();
            $table->string('source_type')->nullable(); // Model name (Order, PurchaseOrder, etc.)
            $table->unsignedBigInteger('source_id')->nullable(); // ID of source record
            $table->enum('status', ['DRAFT', 'POSTED', 'VOID'])->default('DRAFT');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('posted_at')->nullable();
            $table->foreignId('posted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['transaction_date', 'status']);
            $table->index(['source_type', 'source_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
