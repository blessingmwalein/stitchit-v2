<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class FinishedProduct extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'production_job_id',
        'order_id',
        'order_item_id',
        'client_id',
        'reference',
        'product_name',
        'description',
        'length',
        'width',
        'unit',
        'quality_status',
        'quality_notes',
        'quality_checked_by',
        'quality_checked_at',
        'storage_location',
        'status',
        'use_case',
        'cost_price',
        'selling_price',
        'images',
        'primary_image',
        'is_published',
        'published_at',
        'notes',
    ];

    protected $casts = [
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'images' => 'array',
        'is_published' => 'boolean',
        'quality_checked_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (FinishedProduct $product) {
            if (!$product->reference) {
                $product->reference = 'FP-' . date('Ymd') . '-' . str_pad(
                    FinishedProduct::whereDate('created_at', today())->count() + 1,
                    4,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the production job
     */
    public function productionJob(): BelongsTo
    {
        return $this->belongsTo(ProductionJob::class);
    }

    /**
     * Get the order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the order item
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * Get the client
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the user who checked quality
     */
    public function qualityChecker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'quality_checked_by');
    }

    /**
     * Get display name
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->product_name ?? $this->orderItem?->description ?? $this->reference;
    }

    /**
     * Get dimension string
     */
    public function getDimensionsAttribute(): string
    {
        if ($this->length && $this->width) {
            return "{$this->length} × {$this->width} {$this->unit}";
        }
        return 'N/A';
    }

    /**
     * Get primary image URL
     */
    protected function primaryImage(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value ? Storage::disk('public')->url($value) : null,
        );
    }

    /**
     * Get images URLs
     */
    protected function images(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value 
                ? array_map(fn($image) => Storage::disk('public')->url($image), json_decode($value, true) ?? [])
                : [],
        );
    }
}
