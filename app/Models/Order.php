<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'reference',
        'state',
        'deposit_percent',
        'deposit_required_amount',
        'total_amount',
        'balance_due',
        'notes',
        'delivery_address',
        'delivery_contact',
        'preferred_dimensions_unit',
    ];

    protected $casts = [
        'deposit_percent' => 'decimal:2',
        'deposit_required_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'balance_due' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (!$order->reference) {
                $order->reference = 'ORD-' . date('Ymd') . '-' . str_pad(Order::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the client that owns the order
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get all order items
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get all payments for the order
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the dispatch for the order
     */
    public function dispatch(): HasOne
    {
        return $this->hasOne(Dispatch::class);
    }

    /**
     * Get all journal entries for this order
     */
    public function journalEntries(): MorphMany
    {
        return $this->morphMany(JournalEntry::class, 'source');
    }

    /**
     * Calculate total from items
     */
    public function calculateTotal(): void
    {
        $this->total_amount = $this->items()->sum('planned_price');
        $this->deposit_required_amount = $this->total_amount * ($this->deposit_percent / 100);
        $this->balance_due = $this->total_amount - $this->payments()->sum('amount');
        $this->save();
    }

    /**
     * Check if deposit is paid
     */
    public function hasDepositPaid(): bool
    {
        $totalPaid = $this->payments()->where('type', 'deposit')->sum('amount');
        return $totalPaid >= $this->deposit_required_amount;
    }
}
