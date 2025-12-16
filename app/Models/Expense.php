<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'expense_date',
        'category',
        'account_id',
        'vendor_name',
        'amount',
        'payment_method',
        'receipt_number',
        'description',
        'journal_entry_id',
        'created_by',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Relationships
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeOfCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByPaymentMethod($query, string $method)
    {
        return $query->where('payment_method', $method);
    }

    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('expense_date', [$from, $to]);
    }

    // Helper methods
    public function getCategoryLabel(): string
    {
        return str_replace('_', ' ', ucwords(strtolower($this->category)));
    }

    public function getPaymentMethodLabel(): string
    {
        return str_replace('_', ' ', ucwords(strtolower($this->payment_method)));
    }
}
