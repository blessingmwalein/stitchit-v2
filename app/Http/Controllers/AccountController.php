<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\AccountRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function __construct(
        private AccountRepositoryInterface $accountRepository
    ) {}

    public function index()
    {
        $accounts = $this->accountRepository->getActiveAccounts();

        return Inertia::render('admin/accounting/accounts/index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:accounts,code',
            'name' => 'required|string|max:255',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,REVENUE,EXPENSE',
            'category' => 'required|string',
            'parent_account_id' => 'nullable|exists:accounts,id',
            'description' => 'nullable|string',
        ]);

        try {
            $account = $this->accountRepository->create($validated);
            return response()->json([
                'success' => true,
                'message' => 'Account created successfully',
                'data' => $account,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        try {
            $account = $this->accountRepository->update($id, $validated);
            return response()->json([
                'success' => true,
                'message' => 'Account updated successfully',
                'data' => $account,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->accountRepository->delete($id);
            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
