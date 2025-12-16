<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockLot extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'inventory_item_id',
        'supplier_id',
        'purchase_line_id',
        'lot_number',
        'quantity_received',
        'quantity_remaining',
        'unit_cost',
        'received_at',
    ];

    protected $casts = [
        'quantity_received' => 'decimal:2',
        'quantity_remaining' => 'decimal:2',
        'unit_cost' => 'decimal:4',
        'received_at' => 'datetime',
    ];

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the supplier
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the purchase line
     */
    public function purchaseLine(): BelongsTo
    {
        return $this->belongsTo(PurchaseLine::class);
    }

    /**
     * Get material consumptions from this lot
     */
    public function materialConsumptions(): HasMany
    {
        return $this->hasMany(MaterialConsumption::class);
    }

    /**
     * Check if lot is depleted
     */
    public function isDepleted(): bool
    {
        return $this->quantity_remaining <= 0;
    }

    /**
     * Consume quantity from this lot
     */
    public function consume(float $quantity): void
    {
        $this->quantity_remaining = max(0, $this->quantity_remaining - $quantity);
        $this->save();
    }
}
