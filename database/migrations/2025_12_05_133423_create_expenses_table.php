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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // EXP-001, EXP-002, etc.
            $table->date('expense_date'); // Date of expense
            $table->enum('category', [
                'FOOD', 'TRANSPORT', 'ELECTRICITY', 'RENT', 'WATER', 
                'INTERNET', 'PHONE', 'OFFICE_SUPPLIES', 'MAINTENANCE', 
                'SALARIES', 'MARKETING', 'INSURANCE', 'TAX', 'OTHER'
            ]);
            $table->foreignId('account_id')->nullable()->constrained('accounts')->onDelete('set null');
            $table->string('vendor_name')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->nullable(); // CASH, BANK, MOBILE_MONEY
            $table->string('receipt_number')->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['expense_date', 'category']);
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
