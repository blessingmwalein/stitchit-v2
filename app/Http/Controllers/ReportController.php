<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Expense;
use App\Models\JournalEntry;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __construct(
        private AccountingService $accountingService
    ) {}

    public function trialBalance()
    {
        $trialBalance = $this->accountingService->getTrialBalance();

        return Inertia::render('admin/accounting/reports/trial-balance', [
            'trialBalance' => $trialBalance,
        ]);
    }

    public function incomeStatement(Request $request)
    {
        $from = $request->input('date_from', now()->startOfMonth()->toDateString());
        $to = $request->input('date_to', now()->toDateString());

        // Get revenue accounts
        $revenueAccounts = Account::ofType('REVENUE')
            ->with(['journalEntryLines' => function ($query) use ($from, $to) {
                $query->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')
                      ->whereBetween('transaction_date', [$from, $to]);
                });
            }])
            ->get();

        // Calculate total revenue
        $totalRevenue = 0;
        foreach ($revenueAccounts as $account) {
            $credits = $account->journalEntryLines->where('type', 'CREDIT')->sum('amount');
            $debits = $account->journalEntryLines->where('type', 'DEBIT')->sum('amount');
            $account->balance = $credits - $debits;
            $totalRevenue += $account->balance;
        }

        // Get COGS accounts
        $cogsAccounts = Account::ofCategory('COST_OF_GOODS_SOLD')
            ->with(['journalEntryLines' => function ($query) use ($from, $to) {
                $query->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')
                      ->whereBetween('transaction_date', [$from, $to]);
                });
            }])
            ->get();

        // Calculate total COGS
        $totalCOGS = 0;
        foreach ($cogsAccounts as $account) {
            $debits = $account->journalEntryLines->where('type', 'DEBIT')->sum('amount');
            $credits = $account->journalEntryLines->where('type', 'CREDIT')->sum('amount');
            $account->balance = $debits - $credits;
            $totalCOGS += $account->balance;
        }

        // Get operating expense accounts
        $expenseAccounts = Account::ofCategory('OPERATING_EXPENSE')
            ->with(['journalEntryLines' => function ($query) use ($from, $to) {
                $query->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')
                      ->whereBetween('transaction_date', [$from, $to]);
                });
            }])
            ->get();

        // Calculate total expenses
        $totalExpenses = 0;
        foreach ($expenseAccounts as $account) {
            $debits = $account->journalEntryLines->where('type', 'DEBIT')->sum('amount');
            $credits = $account->journalEntryLines->where('type', 'CREDIT')->sum('amount');
            $account->balance = $debits - $credits;
            $totalExpenses += $account->balance;
        }

        $grossProfit = $totalRevenue - $totalCOGS;
        $netIncome = $grossProfit - $totalExpenses;

        // Get balance sheet data
        $assetAccounts = Account::ofType('ASSET')->where('is_active', true)->orderBy('code')->get();
        $totalAssets = $assetAccounts->sum('balance');
        $liabilityAccounts = Account::ofType('LIABILITY')->where('is_active', true)->orderBy('code')->get();
        $totalLiabilities = $liabilityAccounts->sum('balance');
        $equityAccounts = Account::ofType('EQUITY')->where('is_active', true)->orderBy('code')->get();
        $totalEquity = $equityAccounts->sum('balance');

        // Get manufacturing data
        $rawMaterialsAccount = Account::where('code', '5100')->first();
        $rawMaterialsUsed = $rawMaterialsAccount 
            ? $rawMaterialsAccount->journalEntryLines()
                ->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                })->where('type', 'DEBIT')->sum('amount')
            : 0;

        $directLaborAccount = Account::where('code', '5200')->first();
        $directLabor = $directLaborAccount
            ? $directLaborAccount->journalEntryLines()
                ->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                })->where('type', 'DEBIT')->sum('amount')
            : 0;

        $overheadCategories = ['ELECTRICITY', 'WATER', 'MAINTENANCE'];
        $manufacturingOverhead = Expense::whereIn('category', $overheadCategories)
            ->whereBetween('expense_date', [$from, $to])->sum('amount');

        return Inertia::render('admin/accounting/reports/income-statement', [
            // Income Statement
            'revenueAccounts' => $revenueAccounts,
            'cogsAccounts' => $cogsAccounts,
            'expenseAccounts' => $expenseAccounts,
            'totalRevenue' => $totalRevenue,
            'totalCOGS' => $totalCOGS,
            'totalExpenses' => $totalExpenses,
            'grossProfit' => $grossProfit,
            'netIncome' => $netIncome,
            // Balance Sheet
            'assetAccounts' => $assetAccounts,
            'liabilityAccounts' => $liabilityAccounts,
            'equityAccounts' => $equityAccounts,
            'totalAssets' => $totalAssets,
            'totalLiabilities' => $totalLiabilities,
            'totalEquity' => $totalEquity,
            'asOfDate' => $to,
            // Manufacturing Account
            'rawMaterialsUsed' => $rawMaterialsUsed,
            'directLabor' => $directLabor,
            'manufacturingOverhead' => $manufacturingOverhead,
            'totalManufacturingCost' => $rawMaterialsUsed + $directLabor + $manufacturingOverhead,
            // Date range
            'dateFrom' => $from,
            'dateTo' => $to,
        ]);
    }

    public function balanceSheet(Request $request)
    {
        $from = $request->input('date_from', now()->startOfMonth()->toDateString());
        $to = $request->input('date_to', now()->toDateString());
        $asOfDate = $request->input('as_of_date', $to);

        // Get asset accounts
        $assetAccounts = Account::ofType('ASSET')
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        $totalAssets = $assetAccounts->sum('balance');

        // Get liability accounts
        $liabilityAccounts = Account::ofType('LIABILITY')
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        $totalLiabilities = $liabilityAccounts->sum('balance');

        // Get equity accounts
        $equityAccounts = Account::ofType('EQUITY')
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        $totalEquity = $equityAccounts->sum('balance');

        // Get income statement data
        $revenueAccounts = Account::ofType('REVENUE')
            ->with(['journalEntryLines' => function ($query) use ($from, $to) {
                $query->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                });
            }])->get();

        $totalRevenue = 0;
        foreach ($revenueAccounts as $account) {
            $credits = $account->journalEntryLines->where('type', 'CREDIT')->sum('amount');
            $debits = $account->journalEntryLines->where('type', 'DEBIT')->sum('amount');
            $account->balance = $credits - $debits;
            $totalRevenue += $account->balance;
        }

        $cogsAccounts = Account::ofCategory('COST_OF_GOODS_SOLD')
            ->with(['journalEntryLines' => function ($query) use ($from, $to) {
                $query->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                });
            }])->get();

        $totalCOGS = 0;
        foreach ($cogsAccounts as $account) {
            $debits = $account->journalEntryLines->where('type', 'DEBIT')->sum('amount');
            $credits = $account->journalEntryLines->where('type', 'CREDIT')->sum('amount');
            $account->balance = $debits - $credits;
            $totalCOGS += $account->balance;
        }

        $expenseAccounts = Account::ofCategory('OPERATING_EXPENSE')
            ->with(['journalEntryLines' => function ($query) use ($from, $to) {
                $query->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                });
            }])->get();

        $totalExpenses = 0;
        foreach ($expenseAccounts as $account) {
            $debits = $account->journalEntryLines->where('type', 'DEBIT')->sum('amount');
            $credits = $account->journalEntryLines->where('type', 'CREDIT')->sum('amount');
            $account->balance = $debits - $credits;
            $totalExpenses += $account->balance;
        }

        // Get manufacturing data
        $rawMaterialsAccount = Account::where('code', '5100')->first();
        $rawMaterialsUsed = $rawMaterialsAccount 
            ? $rawMaterialsAccount->journalEntryLines()
                ->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                })->where('type', 'DEBIT')->sum('amount')
            : 0;

        $directLaborAccount = Account::where('code', '5200')->first();
        $directLabor = $directLaborAccount
            ? $directLaborAccount->journalEntryLines()
                ->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                })->where('type', 'DEBIT')->sum('amount')
            : 0;

        $overheadCategories = ['ELECTRICITY', 'WATER', 'MAINTENANCE'];
        $manufacturingOverhead = Expense::whereIn('category', $overheadCategories)
            ->whereBetween('expense_date', [$from, $to])->sum('amount');

        return Inertia::render('admin/accounting/reports/income-statement', [
            // Balance Sheet
            'assetAccounts' => $assetAccounts,
            'liabilityAccounts' => $liabilityAccounts,
            'equityAccounts' => $equityAccounts,
            'totalAssets' => $totalAssets,
            'totalLiabilities' => $totalLiabilities,
            'totalEquity' => $totalEquity,
            'asOfDate' => $asOfDate,
            // Income Statement
            'revenueAccounts' => $revenueAccounts,
            'cogsAccounts' => $cogsAccounts,
            'expenseAccounts' => $expenseAccounts,
            'totalRevenue' => $totalRevenue,
            'totalCOGS' => $totalCOGS,
            'totalExpenses' => $totalExpenses,
            'grossProfit' => $totalRevenue - $totalCOGS,
            'netIncome' => $totalRevenue - $totalCOGS - $totalExpenses,
            // Manufacturing Account
            'rawMaterialsUsed' => $rawMaterialsUsed,
            'directLabor' => $directLabor,
            'manufacturingOverhead' => $manufacturingOverhead,
            'totalManufacturingCost' => $rawMaterialsUsed + $directLabor + $manufacturingOverhead,
            // Date range
            'dateFrom' => $from,
            'dateTo' => $to,
        ]);
    }

    public function manufacturingAccount(Request $request)
    {
        $from = $request->input('date_from', now()->startOfMonth()->toDateString());
        $to = $request->input('date_to', now()->toDateString());

        // Get raw materials used
        $rawMaterialsAccount = Account::where('code', '5100')->first();
        $rawMaterialsUsed = $rawMaterialsAccount 
            ? $rawMaterialsAccount->journalEntryLines()
                ->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')
                      ->whereBetween('transaction_date', [$from, $to]);
                })
                ->where('type', 'DEBIT')
                ->sum('amount')
            : 0;

        // Get direct labor
        $directLaborAccount = Account::where('code', '5200')->first();
        $directLabor = $directLaborAccount
            ? $directLaborAccount->journalEntryLines()
                ->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')
                      ->whereBetween('transaction_date', [$from, $to]);
                })
                ->where('type', 'DEBIT')
                ->sum('amount')
            : 0;

        // Manufacturing overhead (subset of operating expenses related to production)
        $overheadCategories = ['ELECTRICITY', 'WATER', 'MAINTENANCE'];
        $manufacturingOverhead = Expense::whereIn('category', $overheadCategories)
            ->whereBetween('expense_date', [$from, $to])
            ->sum('amount');

        $totalManufacturingCost = $rawMaterialsUsed + $directLabor + $manufacturingOverhead;

        // Get income statement data
        $revenueAccounts = Account::ofType('REVENUE')
            ->with(['journalEntryLines' => function ($query) use ($from, $to) {
                $query->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                });
            }])->get();

        $totalRevenue = 0;
        foreach ($revenueAccounts as $account) {
            $credits = $account->journalEntryLines->where('type', 'CREDIT')->sum('amount');
            $debits = $account->journalEntryLines->where('type', 'DEBIT')->sum('amount');
            $account->balance = $credits - $debits;
            $totalRevenue += $account->balance;
        }

        $cogsAccounts = Account::ofCategory('COST_OF_GOODS_SOLD')
            ->with(['journalEntryLines' => function ($query) use ($from, $to) {
                $query->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                });
            }])->get();

        $totalCOGS = 0;
        foreach ($cogsAccounts as $account) {
            $debits = $account->journalEntryLines->where('type', 'DEBIT')->sum('amount');
            $credits = $account->journalEntryLines->where('type', 'CREDIT')->sum('amount');
            $account->balance = $debits - $credits;
            $totalCOGS += $account->balance;
        }

        $expenseAccounts = Account::ofCategory('OPERATING_EXPENSE')
            ->with(['journalEntryLines' => function ($query) use ($from, $to) {
                $query->whereHas('journalEntry', function ($q) use ($from, $to) {
                    $q->where('status', 'POSTED')->whereBetween('transaction_date', [$from, $to]);
                });
            }])->get();

        $totalExpenses = 0;
        foreach ($expenseAccounts as $account) {
            $debits = $account->journalEntryLines->where('type', 'DEBIT')->sum('amount');
            $credits = $account->journalEntryLines->where('type', 'CREDIT')->sum('amount');
            $account->balance = $debits - $credits;
            $totalExpenses += $account->balance;
        }

        // Get balance sheet data
        $assetAccounts = Account::ofType('ASSET')->where('is_active', true)->orderBy('code')->get();
        $totalAssets = $assetAccounts->sum('balance');
        $liabilityAccounts = Account::ofType('LIABILITY')->where('is_active', true)->orderBy('code')->get();
        $totalLiabilities = $liabilityAccounts->sum('balance');
        $equityAccounts = Account::ofType('EQUITY')->where('is_active', true)->orderBy('code')->get();
        $totalEquity = $equityAccounts->sum('balance');

        return Inertia::render('admin/accounting/reports/income-statement', [
            // Manufacturing Account
            'rawMaterialsUsed' => $rawMaterialsUsed,
            'directLabor' => $directLabor,
            'manufacturingOverhead' => $manufacturingOverhead,
            'totalManufacturingCost' => $totalManufacturingCost,
            // Income Statement
            'revenueAccounts' => $revenueAccounts,
            'cogsAccounts' => $cogsAccounts,
            'expenseAccounts' => $expenseAccounts,
            'totalRevenue' => $totalRevenue,
            'totalCOGS' => $totalCOGS,
            'totalExpenses' => $totalExpenses,
            'grossProfit' => $totalRevenue - $totalCOGS,
            'netIncome' => $totalRevenue - $totalCOGS - $totalExpenses,
            // Balance Sheet
            'assetAccounts' => $assetAccounts,
            'liabilityAccounts' => $liabilityAccounts,
            'equityAccounts' => $equityAccounts,
            'totalAssets' => $totalAssets,
            'totalLiabilities' => $totalLiabilities,
            'totalEquity' => $totalEquity,
            'asOfDate' => $to,
            // Date range
            'dateFrom' => $from,
            'dateTo' => $to,
        ]);
    }
}
