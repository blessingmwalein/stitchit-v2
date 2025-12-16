<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalEntryLine extends Model
{
    protected $fillable = [
        'journal_entry_id',
        'account_id',
        'type',
        'amount',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    // Relationships
    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    // Scopes
    public function scopeDebits($query)
    {
        return $query->where('type', 'DEBIT');
    }

    public function scopeCredits($query)
    {
        return $query->where('type', 'CREDIT');
    }

    // Helper methods
    public function isDebit(): bool
    {
        return $this->type === 'DEBIT';
    }

    public function isCredit(): bool
    {
        return $this->type === 'CREDIT';
    }
}
