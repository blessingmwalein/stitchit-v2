<?php

namespace App\Repositories\Eloquent;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;

class ExpenseRepository implements ExpenseRepositoryInterface
{
    public function all()
    {
        return Expense::with(['account', 'creator'])
            ->orderBy('expense_date', 'desc')
            ->get();
    }

    public function find(int $id)
    {
        return Expense::with(['account', 'journalEntry.lines.account', 'creator'])
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        return Expense::create($data);
    }

    public function update(int $id, array $data)
    {
        $expense = Expense::findOrFail($id);
        $expense->update($data);
        return $expense;
    }

    public function delete(int $id)
    {
        $expense = Expense::findOrFail($id);
        
        // Check if journal entry is posted
        if ($expense->journalEntry && $expense->journalEntry->status === 'POSTED') {
            throw new \Exception('Cannot delete expense with posted journal entry. Void the journal entry first.');
        }
        
        return $expense->delete();
    }

    public function getWithFilters(array $filters = [])
    {
        $query = Expense::with(['account', 'creator']);

        // Search
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('vendor_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('receipt_number', 'like', "%{$search}%");
            });
        }

        // Category filter
        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $query->where('category', $filters['category']);
        }

        // Payment method filter
        if (!empty($filters['payment_method']) && $filters['payment_method'] !== 'all') {
            $query->where('payment_method', $filters['payment_method']);
        }

        // Date range filter
        if (!empty($filters['date_from'])) {
            $query->whereDate('expense_date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('expense_date', '<=', $filters['date_to']);
        }

        // Sorting
        if (!empty($filters['sort_field']) && !empty($filters['sort_direction'])) {
            $query->orderBy($filters['sort_field'], $filters['sort_direction']);
        } else {
            $query->orderBy('expense_date', 'desc');
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getByCategory(string $category)
    {
        return Expense::ofCategory($category)
            ->orderBy('expense_date', 'desc')
            ->get();
    }

    public function getByDateRange($from, $to)
    {
        return Expense::dateRange($from, $to)
            ->orderBy('expense_date', 'desc')
            ->get();
    }

    public function getTotalByCategory(string $category, $from = null, $to = null)
    {
        $query = Expense::ofCategory($category);

        if ($from && $to) {
            $query->dateRange($from, $to);
        }

        return $query->sum('amount');
    }
}
