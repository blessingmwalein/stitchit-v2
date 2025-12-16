<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CostSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_job_id',
        'budgeted_cost',
        'actual_material_cost',
        'labor_cost',
        'overhead_allocated',
        'actual_cost',
        'variance',
        'captured_at',
        'notes',
    ];

    protected $casts = [
        'budgeted_cost' => 'decimal:2',
        'actual_material_cost' => 'decimal:2',
        'labor_cost' => 'decimal:2',
        'overhead_allocated' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'variance' => 'decimal:2',
        'captured_at' => 'datetime',
    ];

    /**
     * Get the production job
     */
    public function productionJob(): BelongsTo
    {
        return $this->belongsTo(ProductionJob::class);
    }

    /**
     * Calculate variance
     */
    public function calculateVariance(): void
    {
        $this->variance = $this->actual_cost - $this->budgeted_cost;
        $this->save();
    }

    /**
     * Get variance percentage
     */
    public function getVariancePercentageAttribute(): ?float
    {
        if ($this->budgeted_cost > 0) {
            return ($this->variance / $this->budgeted_cost) * 100;
        }
        return null;
    }
}
