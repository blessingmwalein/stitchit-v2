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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique(); // Account code (e.g., 1000, 2000, 3000)
            $table->string('name'); // Account name
            $table->enum('type', ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']); // Account type
            $table->enum('category', [
                'CASH', 'BANK', 'ACCOUNTS_RECEIVABLE', 'INVENTORY', 'FIXED_ASSET', 'OTHER_ASSET',
                'ACCOUNTS_PAYABLE', 'SHORT_TERM_LOAN', 'LONG_TERM_LOAN', 'OTHER_LIABILITY',
                'OWNER_EQUITY', 'RETAINED_EARNINGS',
                'SALES', 'SERVICE_REVENUE', 'OTHER_INCOME',
                'COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE', 'OTHER_EXPENSE'
            ]); // Sub-category
            $table->foreignId('parent_account_id')->nullable()->constrained('accounts')->onDelete('cascade'); // For sub-accounts
            $table->decimal('balance', 15, 2)->default(0); // Current balance
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['type', 'category']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
