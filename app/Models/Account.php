<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    protected $fillable = [
        'code',
        'name',
        'type',
        'category',
        'parent_account_id',
        'balance',
        'description',
        'is_active',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_account_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_account_id');
    }

    public function journalEntryLines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOfCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // Helper methods
    public function isDebitAccount(): bool
    {
        return in_array($this->type, ['ASSET', 'EXPENSE']);
    }

    public function isCreditAccount(): bool
    {
        return in_array($this->type, ['LIABILITY', 'EQUITY', 'REVENUE']);
    }

    public function updateBalance(string $type, float $amount): void
    {
        if ($type === 'DEBIT') {
            if ($this->isDebitAccount()) {
                $this->balance += $amount;
            } else {
                $this->balance -= $amount;
            }
        } else { // CREDIT
            if ($this->isCreditAccount()) {
                $this->balance += $amount;
            } else {
                $this->balance -= $amount;
            }
        }
        $this->save();
    }
}
