<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseLine extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'purchase_order_id',
        'inventory_item_id',
        'description',
        'quantity_ordered',
        'quantity_received',
        'unit_cost',
    ];

    protected $casts = [
        'quantity_ordered' => 'decimal:2',
        'quantity_received' => 'decimal:2',
        'unit_cost' => 'decimal:4',
    ];

    /**
     * Get the purchase order that owns the line
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the stock lot created from this line
     */
    public function stockLot(): HasOne
    {
        return $this->hasOne(StockLot::class);
    }

    /**
     * Get remaining quantity to receive
     */
    public function getRemainingQuantityAttribute(): float
    {
        return $this->quantity_ordered - $this->quantity_received;
    }
}
