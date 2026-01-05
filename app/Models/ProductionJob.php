<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductionJob extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_item_id',
        'reference',
        'state',
        'planned_start_at',
        'planned_end_at',
        'actual_start_at',
        'actual_end_at',
        'estimated_material_cost',
        'actual_material_cost',
        'estimated_labor_hours',
        'actual_labor_hours',
        'created_by',
        'assigned_to',
        'notes',
    ];

    protected $casts = [
        'planned_start_at' => 'datetime',
        'planned_end_at' => 'datetime',
        'actual_start_at' => 'datetime',
        'actual_end_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (ProductionJob $job) {
            if (!$job->reference) {
                $job->reference = 'JOB-' . date('Ymd') . '-' . str_pad(ProductionJob::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the order item for this job
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * Get the user who created the job
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user assigned to the job
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get BOM lines for this job
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
     * Get cost snapshot
     */
    public function costSnapshot(): HasOne
    {
        return $this->hasOne(CostSnapshot::class);
    }

    /**
     * Get finished product
     */
    public function finishedProduct(): HasOne
    {
        return $this->hasOne(FinishedProduct::class);
    }

    /**
     * Check if job is completed
     */
    public function isCompleted(): bool
    {
        return $this->state === 'COMPLETED';
    }

    /**
     * Get actual duration in hours
     */
    public function getActualDurationAttribute(): ?float
    {
        if ($this->actual_start_at && $this->actual_end_at) {
            return $this->actual_start_at->diffInHours($this->actual_end_at);
        }
        return null;
    }
}
