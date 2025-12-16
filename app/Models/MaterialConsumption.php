<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaterialConsumption extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'production_job_id',
        'inventory_item_id',
        'type',
        'quantity',
        'unit_cost',
        'total_cost',
        'waste_quantity',
        'recorded_by',
        'recorded_at',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:4',
        'total_cost' => 'decimal:2',
        'waste_quantity' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    protected $appends = ['consumed_quantity'];

    /**
     * Get the production job
     */
    public function productionJob(): BelongsTo
    {
        return $this->belongsTo(ProductionJob::class);
    }

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the user who recorded the consumption
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Get consumed_quantity (alias for quantity for backward compatibility)
     */
    public function getConsumedQuantityAttribute(): float
    {
        return $this->quantity;
    }

    /**
     * Get total quantity (consumed + waste)
     */
    public function getTotalQuantityAttribute(): float
    {
        return $this->quantity + $this->waste_quantity;
    }

    /**
     * Check if this is an estimated consumption
     */
    public function isEstimated(): bool
    {
        return $this->type === 'estimated';
    }

    /**
     * Check if this is an actual consumption
     */
    public function isActual(): bool
    {
        return $this->type === 'actual';
    }
}
