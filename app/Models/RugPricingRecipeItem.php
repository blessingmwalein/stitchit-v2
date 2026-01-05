<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RugPricingRecipeItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'rug_pricing_recipe_id',
        'inventory_item_id',
        'calculation_type',
        'quantity',
        'unit',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
    ];

    /**
     * Get the pricing recipe this item belongs to
     */
    public function recipe(): BelongsTo
    {
        return $this->belongsTo(RugPricing::class, 'rug_pricing_recipe_id');
    }

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Calculate cost for this item based on area or fixed amount
     */
    public function calculateCost(float $widthCm, float $heightCm): float
    {
        $areaSqCm = $widthCm * $heightCm;
        $unitCost = $this->inventoryItem->unit_cost ?? 0;
        
        // Get reference rug area from the recipe
        $recipe = $this->recipe;
        $referenceArea = $recipe->reference_width_cm * $recipe->reference_height_cm;

        switch ($this->calculation_type) {
            case 'per_sqcm':
                // Quantity is TOTAL needed for reference rug
                // Calculate ratio and apply to new rug size
                if ($referenceArea > 0) {
                    $ratio = $this->quantity / $referenceArea;
                    return $areaSqCm * $ratio * $unitCost;
                }
                // Fallback if no reference area
                return $this->quantity * $unitCost;
            
            case 'per_rug':
                // Fixed quantity per rug regardless of size
                return $this->quantity * $unitCost;
            
            case 'fixed_amount':
                // Fixed cost amount
                return (float) $this->quantity;
            
            default:
                return 0;
        }
    }
}
