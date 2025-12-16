<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'reference',
        'state',
        'total_amount',
        'created_by',
        'expected_date',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'expected_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (PurchaseOrder $po) {
            if (!$po->reference) {
                $po->reference = 'PO-' . date('Ymd') . '-' . str_pad(PurchaseOrder::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the supplier for the purchase order
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the user who created the purchase order
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all purchase lines
     */
    public function lines(): HasMany
    {
        return $this->hasMany(PurchaseLine::class);
    }

    /**
     * Get the journal entry for this purchase
     */
    public function journalEntry(): MorphOne
    {
        return $this->morphOne(JournalEntry::class, 'source');
    }

    /**
     * Calculate total from lines
     */
    public function calculateTotal(): void
    {
        $this->total_amount = $this->lines()->get()->sum(function ($line) {
            return $line->quantity_ordered * $line->unit_cost;
        });
        $this->save();
    }

    /**
     * Check if fully received
     */
    public function isFullyReceived(): bool
    {
        return $this->lines()->get()->every(function ($line) {
            return $line->quantity_received >= $line->quantity_ordered;
        });
    }
}
