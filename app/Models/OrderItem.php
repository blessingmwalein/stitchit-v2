<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id',
        'sku',
        'description',
        'quantity',
        'width',
        'height',
        'unit',
        'area',
        'planned_price',
        'design_image_path',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'area' => 'decimal:4',
        'planned_price' => 'decimal:2',
    ];

    protected $appends = ['design_image_url'];

    protected static function booted(): void
    {
        static::saving(function (OrderItem $item) {
            // Convert dimensions to cm (base unit) and calculate area
            $widthInCm = static::convertToCm($item->width, $item->unit);
            $heightInCm = static::convertToCm($item->height, $item->unit);
            $item->area = ($widthInCm * $heightInCm) / 10000; // square meters
        });
    }

    /**
     * Get the order that owns the item
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get design assets for this item
     */
    public function designAssets(): HasMany
    {
        return $this->hasMany(RugDesignAsset::class);
    }

    /**
     * Get finished rug assets
     */
    public function finishedAssets(): HasMany
    {
        return $this->hasMany(FinishedRugAsset::class);
    }

    /**
     * Get the production job for this item
     */
    public function productionJob(): HasOne
    {
        return $this->hasOne(ProductionJob::class);
    }

    /**
     * Convert dimension to centimeters
     */
    public static function convertToCm(float $value, string $unit): float
    {
        return match($unit) {
            'm' => $value * 100,
            'in' => $value * 2.54,
            'ft' => $value * 30.48,
            default => $value, // cm
        };
    }

    /**
     * Convert dimension from centimeters to target unit
     */
    public static function convertFromCm(float $value, string $unit): float
    {
        return match($unit) {
            'm' => $value / 100,
            'in' => $value / 2.54,
            'ft' => $value / 30.48,
            default => $value, // cm
        };
    }

    /**
     * Get the full URL for the design image
     */
    public function getDesignImageUrlAttribute(): ?string
    {
        if (!$this->design_image_path) {
            return null;
        }

        return asset('storage/' . $this->design_image_path);
    }
}
