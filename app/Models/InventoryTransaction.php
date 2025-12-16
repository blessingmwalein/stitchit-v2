<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'stock_lot_id',
        'reference_type',
        'reference_id',
        'quantity_change',
        'unit_cost_before',
        'unit_cost_after',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'quantity_change' => 'decimal:2',
        'unit_cost_before' => 'decimal:4',
        'unit_cost_after' => 'decimal:4',
    ];

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the stock lot
     */
    public function stockLot(): BelongsTo
    {
        return $this->belongsTo(StockLot::class);
    }

    /**
     * Get the user who created the transaction
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the reference model (polymorphic)
     */
    public function reference()
    {
        return $this->morphTo('reference', 'reference_type', 'reference_id');
    }
}
