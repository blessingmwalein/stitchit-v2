<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dispatch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id',
        'shipment_reference',
        'carrier',
        'status',
        'shipped_at',
        'delivered_at',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    /**
     * Get the order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who created the dispatch
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if delivered
     */
    public function isDelivered(): bool
    {
        return $this->status === 'DELIVERED' && $this->delivered_at !== null;
    }
}
