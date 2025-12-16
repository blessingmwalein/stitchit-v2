<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JournalEntryController extends Controller
{
    public function __construct(
        private AccountingService $accountingService
    ) {}

    public function index(Request $request)
    {
        $query = JournalEntry::with(['lines.account', 'creator']);

        // Filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('transaction_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('transaction_date', '<=', $request->input('date_to'));
        }

        // Sorting
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $journalEntries = $query->paginate($request->input('per_page', 15));

        // Return JSON for AJAX requests (but not Inertia requests)
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && !$request->header('X-Inertia')) {
            return response()->json($journalEntries);
        }

        return Inertia::render('admin/accounting/journal-entries/index', [
            'journalEntries' => $journalEntries,
            'filters' => $request->only(['search', 'type', 'status', 'date_from', 'date_to', 'sort_field', 'sort_direction']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'transaction_date' => 'required|date',
            'type' => 'required|in:GENERAL,SALES,PURCHASE,PAYMENT,RECEIPT,EXPENSE,ADJUSTMENT,DEPRECIATION,INVENTORY',
            'description' => 'required|string',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:accounts,id',
            'lines.*.type' => 'required|in:DEBIT,CREDIT',
            'lines.*.amount' => 'required|numeric|min:0',
            'lines.*.description' => 'nullable|string',
        ]);

        try {
            $journalEntry = $this->accountingService->createJournalEntry($validated);
            return response()->json([
                'success' => true,
                'message' => 'Journal entry created successfully',
                'data' => $journalEntry,
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
        $journalEntry = JournalEntry::with([
            'lines.account',
            'creator',
            'poster',
            'source'
        ])->findOrFail($id);

        // Return JSON for AJAX requests
        if (request()->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'success' => true,
                'data' => $journalEntry,
            ]);
        }

        return Inertia::render('admin/accounting/journal-entries/show', [
            'journalEntry' => $journalEntry,
        ]);
    }

    public function post(int $id)
    {
        try {
            $journalEntry = $this->accountingService->postJournalEntry($id);
            return response()->json([
                'success' => true,
                'message' => 'Journal entry posted successfully',
                'data' => $journalEntry,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function void(int $id)
    {
        try {
            $journalEntry = $this->accountingService->voidJournalEntry($id);
            return response()->json([
                'success' => true,
                'message' => 'Journal entry voided successfully',
                'data' => $journalEntry,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
