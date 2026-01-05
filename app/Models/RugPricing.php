<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RugPricing extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rug_pricing_recipes';

    protected $fillable = [
        'name',
        'description',
        'reference_width_cm',
        'reference_height_cm',
        'reference_price',
        'min_price',
        'max_price',
        'profit_margin_percentage',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'reference_width_cm' => 'decimal:2',
        'reference_height_cm' => 'decimal:2',
        'reference_price' => 'decimal:2',
        'min_price' => 'decimal:2',
        'max_price' => 'decimal:2',
        'profit_margin_percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the recipe items for this pricing recipe
     */
    public function items(): HasMany
    {
        return $this->hasMany(RugPricingRecipeItem::class, 'rug_pricing_recipe_id');
    }

    /**
     * Calculate reference area in square centimeters
     */
    public function getReferenceAreaSqCmAttribute(): float
    {
        if (!$this->reference_width_cm || !$this->reference_height_cm) {
            return 0;
        }
        return (float)($this->reference_width_cm * $this->reference_height_cm);
    }

    /**
     * Scope to get only active recipes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
