<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BomLine extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'production_job_id',
        'order_item_id',
        'inventory_item_id',
        'planned_quantity',
        'unit',
        'notes',
    ];

    protected $casts = [
        'planned_quantity' => 'decimal:2',
    ];

    /**
     * Get the production job
     */
    public function productionJob(): BelongsTo
    {
        return $this->belongsTo(ProductionJob::class);
    }

    /**
     * Get the order item
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get estimated cost
     */
    public function getEstimatedCostAttribute(): float
    {
        return $this->planned_quantity * $this->inventoryItem->average_cost;
    }
}
