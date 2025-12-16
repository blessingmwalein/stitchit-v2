<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'type',
        'color',
        'unit',
        'unit_cost',
        'reorder_point',
        'current_stock',
        'is_active',
        'description',
        'metadata',
    ];

    protected $casts = [
        'reorder_point' => 'decimal:2',
        'unit_cost' => 'decimal:4',
        'current_stock' => 'decimal:2',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    protected $appends = ['average_cost'];

    /**
     * Get average cost (alias for unit_cost for backward compatibility)
     */
    public function getAverageCostAttribute(): float
    {
        return (float) $this->unit_cost;
    }

    /**
     * Get all stock lots for this item
     */
    public function stockLots(): HasMany
    {
        return $this->hasMany(StockLot::class);
    }

    /**
     * Get all purchase lines for this item
     */
    public function purchaseLines(): HasMany
    {
        return $this->hasMany(PurchaseLine::class);
    }

    /**
     * Get all inventory transactions
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /**
     * Get BOM lines using this item
     */
    public function bomLines(): HasMany
    {
        return $this->hasMany(BomLine::class);
    }

    /**
     * Get material consumptions
     */
    public function materialConsumptions(): HasMany
    {
        return $this->hasMany(MaterialConsumption::class);
    }

    /**
     * Check if stock is below reorder point
     */
    public function needsReorder(): bool
    {
        return $this->current_stock <= $this->reorder_point;
    }

    /**
     * Update average cost based on new receipt
     */
    public function recalculateAverageCost(float $newQuantity, float $newUnitCost): void
    {
        $totalValue = ($this->current_stock * $this->unit_cost) + ($newQuantity * $newUnitCost);
        $totalQuantity = $this->current_stock + $newQuantity;
        
        $this->unit_cost = $totalQuantity > 0 ? $totalValue / $totalQuantity : 0;
        $this->current_stock = $totalQuantity;
        $this->save();
    }
}
