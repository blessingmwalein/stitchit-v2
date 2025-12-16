<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_code',
        'description',
        'debit',
        'credit',
        'entry_date',
        'reference_type',
        'reference_id',
    ];

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
        'entry_date' => 'date',
    ];

    /**
     * Get the reference model (polymorphic)
     */
    public function reference()
    {
        return $this->morphTo('reference', 'reference_type', 'reference_id');
    }

    /**
     * Get balance for this entry
     */
    public function getBalanceAttribute(): float
    {
        return $this->debit - $this->credit;
    }
}
