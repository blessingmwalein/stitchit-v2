<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\ExpenseRepositoryInterface;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function __construct(
        private ExpenseRepositoryInterface $expenseRepository,
        private AccountingService $accountingService
    ) {}

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->input('search'),
            'category' => $request->input('category'),
            'payment_method' => $request->input('payment_method'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
            'sort_field' => $request->input('sort_field'),
            'sort_direction' => $request->input('sort_direction'),
            'per_page' => $request->input('per_page', 15),
        ];

        $expenses = $this->expenseRepository->getWithFilters($filters);

        // Return JSON for AJAX requests (but not Inertia requests)
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && !$request->header('X-Inertia')) {
            return response()->json($expenses);
        }

        return Inertia::render('admin/accounting/expenses/index', [
            'expenses' => $expenses,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'expense_date' => 'required|date',
            'category' => 'required|in:FOOD,TRANSPORT,ELECTRICITY,RENT,WATER,INTERNET,PHONE,OFFICE_SUPPLIES,MAINTENANCE,SALARIES,MARKETING,INSURANCE,TAX,OTHER',
            'vendor_name' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:CASH,BANK,MOBILE_MONEY',
            'receipt_number' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            $expense = $this->accountingService->recordExpense($validated);
            return response()->json([
                'success' => true,
                'message' => 'Expense recorded successfully',
                'data' => $expense,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(int $id)
    {
        $expense = $this->expenseRepository->find($id);

        // Return JSON for AJAX requests
        if (request()->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'success' => true,
                'data' => $expense,
            ]);
        }

        return Inertia::render('admin/accounting/expenses/show', [
            'expense' => $expense,
        ]);
    }

    public function destroy(int $id)
    {
        try {
            $this->expenseRepository->delete($id);
            return response()->json([
                'success' => true,
                'message' => 'Expense deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
