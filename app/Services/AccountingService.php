<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Expense;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AccountingService
{
    /**
     * Create a journal entry with debits and credits
     * 
     * @param array $data ['transaction_date', 'type', 'description', 'source_type', 'source_id', 'lines' => [['account_id', 'type', 'amount', 'description']]]
     * @return JournalEntry
     * @throws \Exception
     */
    public function createJournalEntry(array $data): JournalEntry
    {
        return DB::transaction(function () use ($data) {
            // Generate reference
            $lastEntry = JournalEntry::latest('id')->first();
            $nextNumber = $lastEntry ? intval(substr($lastEntry->reference, 3)) + 1 : 1;
            $reference = 'JE-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

            // Create journal entry
            $journalEntry = JournalEntry::create([
                'reference' => $reference,
                'transaction_date' => $data['transaction_date'],
                'type' => $data['type'],
                'description' => $data['description'],
                'source_type' => $data['source_type'] ?? null,
                'source_id' => $data['source_id'] ?? null,
                'status' => 'DRAFT',
                'created_by' => Auth::id(),
            ]);

            // Create journal entry lines
            foreach ($data['lines'] as $lineData) {
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'account_id' => $lineData['account_id'],
                    'type' => $lineData['type'],
                    'amount' => $lineData['amount'],
                    'description' => $lineData['description'] ?? null,
                ]);
            }

            // Validate balance
            if (!$journalEntry->isBalanced()) {
                throw new \Exception('Journal entry is not balanced. Total debits must equal total credits.');
            }

            return $journalEntry->load('lines.account');
        });
    }

    /**
     * Post a journal entry and update account balances
     * 
     * @param int $journalEntryId
     * @return JournalEntry
     * @throws \Exception
     */
    public function postJournalEntry(int $journalEntryId): JournalEntry
    {
        return DB::transaction(function () use ($journalEntryId) {
            $journalEntry = JournalEntry::with('lines.account')->findOrFail($journalEntryId);

            if (!$journalEntry->canBePosted()) {
                throw new \Exception('Journal entry cannot be posted. Check status and balance.');
            }

            // Update account balances
            foreach ($journalEntry->lines as $line) {
                $line->account->updateBalance($line->type, $line->amount);
            }

            // Mark as posted
            $journalEntry->update([
                'status' => 'POSTED',
                'posted_at' => now(),
                'posted_by' => Auth::id(),
            ]);

            return $journalEntry->fresh('lines.account');
        });
    }

    /**
     * Void a posted journal entry and reverse account balances
     * 
     * @param int $journalEntryId
     * @return JournalEntry
     * @throws \Exception
     */
    public function voidJournalEntry(int $journalEntryId): JournalEntry
    {
        return DB::transaction(function () use ($journalEntryId) {
            $journalEntry = JournalEntry::with('lines.account')->findOrFail($journalEntryId);

            if (!$journalEntry->canBeVoided()) {
                throw new \Exception('Only posted journal entries can be voided.');
            }

            // Reverse account balances
            foreach ($journalEntry->lines as $line) {
                // Reverse by applying opposite type
                $reverseType = $line->type === 'DEBIT' ? 'CREDIT' : 'DEBIT';
                $line->account->updateBalance($reverseType, $line->amount);
            }

            // Mark as voided
            $journalEntry->update(['status' => 'VOID']);

            return $journalEntry->fresh('lines.account');
        });
    }

    /**
     * Record an expense and create corresponding journal entry
     * 
     * @param array $data ['expense_date', 'category', 'vendor_name', 'amount', 'payment_method', 'receipt_number', 'description']
     * @return Expense
     * @throws \Exception
     */
    public function recordExpense(array $data): Expense
    {
        return DB::transaction(function () use ($data) {
            // Generate reference
            $lastExpense = Expense::latest('id')->first();
            $nextNumber = $lastExpense ? intval(substr($lastExpense->reference, 4)) + 1 : 1;
            $reference = 'EXP-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

            // Get expense account based on category
            $expenseAccount = $this->getExpenseAccountByCategory($data['category']);
            
            // Get cash/bank account based on payment method
            $paymentAccount = $this->getPaymentAccount($data['payment_method']);

            // Create journal entry
            $journalEntry = $this->createJournalEntry([
                'transaction_date' => $data['expense_date'],
                'type' => 'EXPENSE',
                'description' => $data['description'] ?? "Expense: {$data['category']}",
                'lines' => [
                    [
                        'account_id' => $expenseAccount->id,
                        'type' => 'DEBIT',
                        'amount' => $data['amount'],
                        'description' => $data['description'] ?? null,
                    ],
                    [
                        'account_id' => $paymentAccount->id,
                        'type' => 'CREDIT',
                        'amount' => $data['amount'],
                        'description' => "Payment via {$data['payment_method']}",
                    ],
                ],
            ]);

            // Post the journal entry immediately
            $this->postJournalEntry($journalEntry->id);

            // Create expense record
            $expense = Expense::create([
                'reference' => $reference,
                'expense_date' => $data['expense_date'],
                'category' => $data['category'],
                'account_id' => $expenseAccount->id,
                'vendor_name' => $data['vendor_name'] ?? null,
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'],
                'receipt_number' => $data['receipt_number'] ?? null,
                'description' => $data['description'] ?? null,
                'journal_entry_id' => $journalEntry->id,
                'created_by' => Auth::id(),
            ]);

            return $expense->load(['account', 'journalEntry.lines.account']);
        });
    }

    /**
     * Record order payment
     * 
     * @param \App\Models\Order $order
     * @param float $amount
     * @param string $paymentMethod
     * @return JournalEntry
     */
    public function recordOrderPayment($order, float $amount, string $paymentMethod): JournalEntry
    {
        $paymentAccount = $this->getPaymentAccount($paymentMethod);
        $revenueAccount = Account::where('code', '4000')->first(); // Sales Revenue
        $receivableAccount = Account::where('code', '1200')->first(); // Accounts Receivable

        $journalEntry = $this->createJournalEntry([
            'transaction_date' => now(),
            'type' => 'RECEIPT',
            'description' => "Payment received for Order #{$order->reference}",
            'source_type' => get_class($order),
            'source_id' => $order->id,
            'lines' => [
                [
                    'account_id' => $paymentAccount->id,
                    'type' => 'DEBIT',
                    'amount' => $amount,
                    'description' => "Payment via {$paymentMethod}",
                ],
                [
                    'account_id' => $receivableAccount->id,
                    'type' => 'CREDIT',
                    'amount' => $amount,
                    'description' => "Payment for Order #{$order->reference}",
                ],
            ],
        ]);

        $this->postJournalEntry($journalEntry->id);

        return $journalEntry->load('lines.account');
    }

    /**
     * Record purchase
     * 
     * @param \App\Models\PurchaseOrder $purchase
     * @return JournalEntry
     */
    public function recordPurchase($purchase): JournalEntry
    {
        $inventoryAccount = Account::where('code', '1300')->first(); // Inventory - Raw Materials
        $payableAccount = Account::where('code', '2000')->first(); // Accounts Payable

        $totalAmount = $purchase->lines->sum(function ($line) {
            return $line->quantity_ordered * $line->price;
        });

        $journalEntry = $this->createJournalEntry([
            'transaction_date' => $purchase->created_at,
            'type' => 'PURCHASE',
            'description' => "Purchase from {$purchase->supplier->name} - PO #{$purchase->reference}",
            'source_type' => get_class($purchase),
            'source_id' => $purchase->id,
            'lines' => [
                [
                    'account_id' => $inventoryAccount->id,
                    'type' => 'DEBIT',
                    'amount' => $totalAmount,
                    'description' => "Raw materials purchased",
                ],
                [
                    'account_id' => $payableAccount->id,
                    'type' => 'CREDIT',
                    'amount' => $totalAmount,
                    'description' => "Amount payable to {$purchase->supplier->name}",
                ],
            ],
        ]);

        $this->postJournalEntry($journalEntry->id);

        return $journalEntry->load('lines.account');
    }

    /**
     * Get expense account by category
     */
    private function getExpenseAccountByCategory(string $category): Account
    {
        $accountMapping = [
            'RENT' => '6000',
            'ELECTRICITY' => '6100',
            'WATER' => '6200',
            'INTERNET' => '6300',
            'PHONE' => '6300',
            'TRANSPORT' => '6400',
            'FOOD' => '6500',
            'OFFICE_SUPPLIES' => '6600',
            'MAINTENANCE' => '6700',
            'SALARIES' => '6800',
            'MARKETING' => '6900',
            'INSURANCE' => '6950',
            'TAX' => '6990',
            'OTHER' => '6990',
        ];

        $accountCode = $accountMapping[$category] ?? '6990';
        return Account::where('code', $accountCode)->firstOrFail();
    }

    /**
     * Get payment account by payment method
     */
    private function getPaymentAccount(string $paymentMethod): Account
    {
        return match ($paymentMethod) {
            'CASH' => Account::where('code', '1000')->firstOrFail(), // Cash on Hand
            'BANK' => Account::where('code', '1100')->firstOrFail(), // Bank Account
            'MOBILE_MONEY' => Account::where('code', '1100')->firstOrFail(), // Bank Account (treat mobile money as bank)
            default => Account::where('code', '1000')->firstOrFail(),
        };
    }

    /**
     * Get account balance
     */
    public function getAccountBalance(int $accountId): float
    {
        $account = Account::findOrFail($accountId);
        return (float) $account->balance;
    }

    /**
     * Get trial balance
     */
    public function getTrialBalance(): array
    {
        $accounts = Account::active()->orderBy('code')->get();

        $debits = [];
        $credits = [];
        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($accounts as $account) {
            if ($account->balance > 0) {
                if ($account->isDebitAccount()) {
                    $debits[] = ['account' => $account, 'amount' => $account->balance];
                    $totalDebits += $account->balance;
                } else {
                    $credits[] = ['account' => $account, 'amount' => $account->balance];
                    $totalCredits += $account->balance;
                }
            } elseif ($account->balance < 0) {
                if ($account->isDebitAccount()) {
                    $credits[] = ['account' => $account, 'amount' => abs($account->balance)];
                    $totalCredits += abs($account->balance);
                } else {
                    $debits[] = ['account' => $account, 'amount' => abs($account->balance)];
                    $totalDebits += abs($account->balance);
                }
            }
        }

        return [
            'debits' => $debits,
            'credits' => $credits,
            'total_debits' => $totalDebits,
            'total_credits' => $totalCredits,
            'is_balanced' => abs($totalDebits - $totalCredits) < 0.01,
        ];
    }

    /**
     * Record production costs when a job is completed
     * Creates journal entries to record material and labor costs
     * 
     * @param \App\Models\ProductionJob $productionJob
     * @return JournalEntry
     * @throws \Exception
     */
    public function recordProductionCosts($productionJob): JournalEntry
    {
        return DB::transaction(function () use ($productionJob) {
            $lines = [];

            // Get accounts
            $rawMaterialsAccount = Account::where('code', '1300')->first(); // Inventory - Raw Materials
            $finishedGoodsAccount = Account::where('code', '1310')->first(); // Inventory - Finished Goods
            $rawMaterialsUsedAccount = Account::where('code', '5100')->first(); // Raw Materials Used (COGS)
            $directLaborAccount = Account::where('code', '5200')->first(); // Direct Labor (COGS)

            if (!$rawMaterialsAccount || !$finishedGoodsAccount || !$rawMaterialsUsedAccount || !$directLaborAccount) {
                throw new \Exception('Required accounts not found. Please ensure all manufacturing accounts are configured.');
            }

            $totalCost = 0;

            // Record material costs if any
            if ($productionJob->actual_material_cost > 0) {
                // Debit: Raw Materials Used (COGS)
                $lines[] = [
                    'account_id' => $rawMaterialsUsedAccount->id,
                    'type' => 'DEBIT',
                    'amount' => $productionJob->actual_material_cost,
                    'description' => "Materials used for {$productionJob->reference}",
                ];

                // Credit: Inventory - Raw Materials
                $lines[] = [
                    'account_id' => $rawMaterialsAccount->id,
                    'type' => 'CREDIT',
                    'amount' => $productionJob->actual_material_cost,
                    'description' => "Materials transferred to production",
                ];

                $totalCost += $productionJob->actual_material_cost;
            }

            // Record labor costs if any
            // For now, we'll use a standard rate or actual_labor_hours * rate
            // You can configure this rate
            $laborRate = 15.00; // $15 per hour - configure this
            $laborCost = $productionJob->actual_labor_hours * $laborRate;

            if ($laborCost > 0) {
                // Debit: Direct Labor (COGS)
                $lines[] = [
                    'account_id' => $directLaborAccount->id,
                    'type' => 'DEBIT',
                    'amount' => $laborCost,
                    'description' => "Labor cost for {$productionJob->reference} ({$productionJob->actual_labor_hours} hours)",
                ];

                // Credit: Wages Payable or Cash (6800 - Salaries & Wages)
                $wagesAccount = Account::where('code', '6800')->first();
                if ($wagesAccount) {
                    $lines[] = [
                        'account_id' => $wagesAccount->id,
                        'type' => 'CREDIT',
                        'amount' => $laborCost,
                        'description' => "Labor allocated to production",
                    ];
                }

                $totalCost += $laborCost;
            }

            // Transfer total cost to Finished Goods Inventory
            if ($totalCost > 0) {
                // Debit: Inventory - Finished Goods
                $lines[] = [
                    'account_id' => $finishedGoodsAccount->id,
                    'type' => 'DEBIT',
                    'amount' => $totalCost,
                    'description' => "Completed production {$productionJob->reference}",
                ];

                // Credit: Work in Progress (or accumulate from COGS)
                // For simplification, we're crediting the COGS accounts directly
                // In a more complex system, you'd use WIP account
                $lines[] = [
                    'account_id' => $rawMaterialsUsedAccount->id,
                    'type' => 'CREDIT',
                    'amount' => $productionJob->actual_material_cost,
                    'description' => "Transfer to finished goods",
                ];

                if ($laborCost > 0) {
                    $lines[] = [
                        'account_id' => $directLaborAccount->id,
                        'type' => 'CREDIT',
                        'amount' => $laborCost,
                        'description' => "Transfer to finished goods",
                    ];
                }
            }

            // Create journal entry
            $journalEntry = $this->createJournalEntry([
                'transaction_date' => now()->toDateString(),
                'type' => 'INVENTORY',
                'description' => "Production costs for job {$productionJob->reference}",
                'source_type' => 'App\Models\ProductionJob',
                'source_id' => $productionJob->id,
                'lines' => $lines,
            ]);

            // Auto-post the entry
            $this->postJournalEntry($journalEntry->id);

            return $journalEntry->fresh('lines.account');
        });
    }
}
