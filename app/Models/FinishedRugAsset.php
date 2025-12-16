<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinishedRugAsset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_item_id',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'type',
        'uploaded_by',
        'is_published',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_published' => 'boolean',
    ];

    /**
     * Get the order item
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * Get the user who uploaded the asset
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the full URL to the asset
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Scope for published assets
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
