<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            // ASSETS (1000-1999)
            ['code' => '1000', 'name' => 'Cash on Hand', 'type' => 'ASSET', 'category' => 'CASH', 'balance' => 0],
            ['code' => '1100', 'name' => 'Bank Account', 'type' => 'ASSET', 'category' => 'BANK', 'balance' => 0],
            ['code' => '1200', 'name' => 'Accounts Receivable', 'type' => 'ASSET', 'category' => 'ACCOUNTS_RECEIVABLE', 'balance' => 0],
            ['code' => '1300', 'name' => 'Inventory - Raw Materials', 'type' => 'ASSET', 'category' => 'INVENTORY', 'balance' => 0],
            ['code' => '1310', 'name' => 'Inventory - Finished Goods', 'type' => 'ASSET', 'category' => 'INVENTORY', 'balance' => 0],
            ['code' => '1400', 'name' => 'Equipment', 'type' => 'ASSET', 'category' => 'FIXED_ASSET', 'balance' => 0],
            ['code' => '1410', 'name' => 'Accumulated Depreciation - Equipment', 'type' => 'ASSET', 'category' => 'FIXED_ASSET', 'balance' => 0],
            
            // LIABILITIES (2000-2999)
            ['code' => '2000', 'name' => 'Accounts Payable', 'type' => 'LIABILITY', 'category' => 'ACCOUNTS_PAYABLE', 'balance' => 0],
            ['code' => '2100', 'name' => 'Short-term Loans', 'type' => 'LIABILITY', 'category' => 'SHORT_TERM_LOAN', 'balance' => 0],
            ['code' => '2200', 'name' => 'Long-term Loans', 'type' => 'LIABILITY', 'category' => 'LONG_TERM_LOAN', 'balance' => 0],
            
            // EQUITY (3000-3999)
            ['code' => '3000', 'name' => 'Owner\'s Capital', 'type' => 'EQUITY', 'category' => 'OWNER_EQUITY', 'balance' => 0],
            ['code' => '3100', 'name' => 'Retained Earnings', 'type' => 'EQUITY', 'category' => 'RETAINED_EARNINGS', 'balance' => 0],
            
            // REVENUE (4000-4999)
            ['code' => '4000', 'name' => 'Sales Revenue - Custom Rugs', 'type' => 'REVENUE', 'category' => 'SALES', 'balance' => 0],
            ['code' => '4100', 'name' => 'Service Revenue', 'type' => 'REVENUE', 'category' => 'SERVICE_REVENUE', 'balance' => 0],
            
            // COST OF GOODS SOLD (5000-5999)
            ['code' => '5000', 'name' => 'Cost of Goods Sold', 'type' => 'EXPENSE', 'category' => 'COST_OF_GOODS_SOLD', 'balance' => 0],
            ['code' => '5100', 'name' => 'Raw Materials Used', 'type' => 'EXPENSE', 'category' => 'COST_OF_GOODS_SOLD', 'balance' => 0],
            ['code' => '5200', 'name' => 'Direct Labor', 'type' => 'EXPENSE', 'category' => 'COST_OF_GOODS_SOLD', 'balance' => 0],
            
            // OPERATING EXPENSES (6000-6999)
            ['code' => '6000', 'name' => 'Rent Expense', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6100', 'name' => 'Electricity Expense', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6200', 'name' => 'Water Expense', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6300', 'name' => 'Internet & Phone Expense', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6400', 'name' => 'Transport Expense', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6500', 'name' => 'Food & Meals Expense', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6600', 'name' => 'Office Supplies Expense', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6700', 'name' => 'Maintenance & Repairs', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6800', 'name' => 'Salaries & Wages', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6900', 'name' => 'Marketing & Advertising', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6950', 'name' => 'Insurance Expense', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6980', 'name' => 'Depreciation Expense', 'type' => 'EXPENSE', 'category' => 'OPERATING_EXPENSE', 'balance' => 0],
            ['code' => '6990', 'name' => 'Miscellaneous Expense', 'type' => 'EXPENSE', 'category' => 'OTHER_EXPENSE', 'balance' => 0],
        ];

        foreach ($accounts as $account) {
            DB::table('accounts')->insert([
                'code' => $account['code'],
                'name' => $account['name'],
                'type' => $account['type'],
                'category' => $account['category'],
                'balance' => $account['balance'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
