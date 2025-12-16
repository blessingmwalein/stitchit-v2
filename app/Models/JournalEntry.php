<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class JournalEntry extends Model
{
    protected $fillable = [
        'reference',
        'transaction_date',
        'type',
        'description',
        'source_type',
        'source_id',
        'status',
        'posted_at',
        'posted_by',
        'created_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'posted_at' => 'datetime',
    ];

    // Relationships
    public function lines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    // Scopes
    public function scopePosted($query)
    {
        return $query->where('status', 'POSTED');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'DRAFT');
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('transaction_date', [$from, $to]);
    }

    // Helper methods
    public function isBalanced(): bool
    {
        $totalDebits = $this->lines()->where('type', 'DEBIT')->sum('amount');
        $totalCredits = $this->lines()->where('type', 'CREDIT')->sum('amount');
        
        return abs($totalDebits - $totalCredits) < 0.01; // Allow for floating point precision
    }

    public function getTotalDebits(): float
    {
        return (float) $this->lines()->where('type', 'DEBIT')->sum('amount');
    }

    public function getTotalCredits(): float
    {
        return (float) $this->lines()->where('type', 'CREDIT')->sum('amount');
    }

    public function canBePosted(): bool
    {
        return $this->status === 'DRAFT' && $this->isBalanced() && $this->lines()->count() >= 2;
    }

    public function canBeVoided(): bool
    {
        return $this->status === 'POSTED';
    }
}
