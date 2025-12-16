<?php

namespace App\Repositories\Eloquent;

use App\Models\Account;
use App\Repositories\Contracts\AccountRepositoryInterface;

class AccountRepository implements AccountRepositoryInterface
{
    public function all()
    {
        return Account::with('parent')->orderBy('code')->get();
    }

    public function find(int $id)
    {
        return Account::with(['parent', 'children'])->findOrFail($id);
    }

    public function findByCode(string $code)
    {
        return Account::where('code', $code)->firstOrFail();
    }

    public function create(array $data)
    {
        return Account::create($data);
    }

    public function update(int $id, array $data)
    {
        $account = Account::findOrFail($id);
        $account->update($data);
        return $account;
    }

    public function delete(int $id)
    {
        $account = Account::findOrFail($id);
        
        // Check if account has children
        if ($account->children()->count() > 0) {
            throw new \Exception('Cannot delete account with sub-accounts');
        }
        
        // Check if account has journal entries
        if ($account->journalEntryLines()->count() > 0) {
            throw new \Exception('Cannot delete account with journal entries. Deactivate instead.');
        }
        
        return $account->delete();
    }

    public function getByType(string $type)
    {
        return Account::ofType($type)->orderBy('code')->get();
    }

    public function getByCategory(string $category)
    {
        return Account::ofCategory($category)->orderBy('code')->get();
    }

    public function getActiveAccounts()
    {
        return Account::active()->orderBy('code')->get();
    }

    public function getAccountsWithBalance()
    {
        return Account::where('balance', '!=', 0)
            ->orderBy('code')
            ->get();
    }
}
