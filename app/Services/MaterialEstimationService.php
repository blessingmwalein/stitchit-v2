<?php

namespace App\Services;

use App\Models\ProductionJob;
use App\Models\InventoryItem;
use App\Models\MaterialConsumption;
use Illuminate\Support\Collection;

/**
 * Service for estimating material requirements for rug production
 * Based on rug dimensions (cm) and material consumption rates
 */
class MaterialEstimationService
{
    // Material consumption rates per square meter
    const TUFTING_CLOTH_RATE = 1.15; // 15% extra for waste
    const YARN_RATE_PER_SQM = 2500; // grams per sqm (varies by pile height)
    const BACKING_CLOTH_RATE = 1.10; // 10% extra
    const BACKING_GLUE_RATE = 800; // grams per sqm
    const HOT_GLUE_STICKS_RATE = 50; // grams per sqm

    /**
     * Estimate materials needed for a production job
     */
    public function estimateForJob(ProductionJob $job): Collection
    {
        $width = $job->order_item->width; // cm
        $height = $job->order_item->height; // cm
        $quantity = $job->order_item->quantity;

        // Calculate area in square meters
        $areaSqm = ($width * $height) / 10000; // cm² to m²
        $totalAreaSqm = $areaSqm * $quantity;

        $estimates = collect();

        // 1. Tufting Cloth
        $tuftingCloth = $this->getInventoryItemByType('tufting_cloth');
        if ($tuftingCloth) {
            $estimates->push([
                'inventory_item_id' => $tuftingCloth->id,
                'inventory_item' => $tuftingCloth,
                'material_name' => $tuftingCloth->name,
                'estimated_quantity' => round($totalAreaSqm * self::TUFTING_CLOTH_RATE, 2),
                'unit' => $tuftingCloth->unit,
                'unit_cost' => $tuftingCloth->unit_cost,
                'estimated_cost' => round($totalAreaSqm * self::TUFTING_CLOTH_RATE * $tuftingCloth->unit_cost, 2),
            ]);
        }

        // 2. Yarn (aggregate all yarn items)
        $yarns = InventoryItem::where('type', 'yarn')
            ->where('is_active', true)
            ->get();
        
        foreach ($yarns as $yarn) {
            // Estimate yarn consumption (simplified - in reality would be based on design)
            $yarnGrams = round(($totalAreaSqm * self::YARN_RATE_PER_SQM) / $yarns->count(), 2);
            
            $estimates->push([
                'inventory_item_id' => $yarn->id,
                'inventory_item' => $yarn,
                'material_name' => $yarn->name . ($yarn->color ? " ({$yarn->color})" : ''),
                'estimated_quantity' => $yarnGrams,
                'unit' => $yarn->unit,
                'unit_cost' => $yarn->unit_cost,
                'estimated_cost' => round($yarnGrams * $yarn->unit_cost, 2),
            ]);
        }

        // 3. Backing Cloth
        $backingCloth = $this->getInventoryItemByType('backing_cloth');
        if ($backingCloth) {
            $estimates->push([
                'inventory_item_id' => $backingCloth->id,
                'inventory_item' => $backingCloth,
                'material_name' => $backingCloth->name,
                'estimated_quantity' => round($totalAreaSqm * self::BACKING_CLOTH_RATE, 2),
                'unit' => $backingCloth->unit,
                'unit_cost' => $backingCloth->unit_cost,
                'estimated_cost' => round($totalAreaSqm * self::BACKING_CLOTH_RATE * $backingCloth->unit_cost, 2),
            ]);
        }

        // 4. Backing Glue
        $backingGlue = $this->getInventoryItemByType('backing_glue');
        if ($backingGlue) {
            $glueGrams = round($totalAreaSqm * self::BACKING_GLUE_RATE, 2);
            $estimates->push([
                'inventory_item_id' => $backingGlue->id,
                'inventory_item' => $backingGlue,
                'material_name' => $backingGlue->name,
                'estimated_quantity' => $glueGrams,
                'unit' => $backingGlue->unit,
                'unit_cost' => $backingGlue->unit_cost,
                'estimated_cost' => round($glueGrams * $backingGlue->unit_cost, 2),
            ]);
        }

        // 5. Hot Glue Sticks
        $hotGlue = $this->getInventoryItemByType('hot_glue_sticks');
        if ($hotGlue) {
            $glueSticks = round($totalAreaSqm * self::HOT_GLUE_STICKS_RATE, 2);
            $estimates->push([
                'inventory_item_id' => $hotGlue->id,
                'inventory_item' => $hotGlue,
                'material_name' => $hotGlue->name,
                'estimated_quantity' => $glueSticks,
                'unit' => $hotGlue->unit,
                'unit_cost' => $hotGlue->unit_cost,
                'estimated_cost' => round($glueSticks * $hotGlue->unit_cost, 2),
            ]);
        }

        return $estimates;
    }

    /**
     * Save estimated materials to database
     */
    public function saveEstimates(ProductionJob $job, Collection $estimates): void
    {
        $totalCost = 0;

        foreach ($estimates as $estimate) {
            MaterialConsumption::create([
                'production_job_id' => $job->id,
                'inventory_item_id' => $estimate['inventory_item_id'],
                'type' => 'estimated',
                'quantity' => $estimate['estimated_quantity'],
                'unit_cost' => $estimate['unit_cost'],
                'total_cost' => $estimate['estimated_cost'],
                'waste_quantity' => 0,
                'recorded_by' => auth()->id(),
                'recorded_at' => now(),
                'notes' => 'Auto-generated estimate',
            ]);

            $totalCost += $estimate['estimated_cost'];
        }

        // Update job estimated cost
        $job->update([
            'estimated_material_cost' => $totalCost,
        ]);
    }

    /**
     * Auto-generate estimates if not exists
     */
    public function autoGenerateEstimates(ProductionJob $job): Collection
    {
        // Check if estimates already exist
        $existingEstimates = $job->materialConsumptions()
            ->where('type', 'estimated')
            ->count();

        if ($existingEstimates > 0) {
            return collect(); // Already have estimates
        }

        $estimates = $this->estimateForJob($job);
        $this->saveEstimates($job, $estimates);

        return $estimates;
    }

    /**
     * Get inventory item by type
     */
    protected function getInventoryItemByType(string $type): ?InventoryItem
    {
        return InventoryItem::where('type', $type)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Calculate material variance between estimated and actual
     */
    public function calculateVariance(ProductionJob $job): array
    {
        $estimated = $job->materialConsumptions()
            ->where('type', 'estimated')
            ->sum('total_cost');

        $actual = $job->materialConsumptions()
            ->where('type', 'actual')
            ->sum('total_cost');

        $variance = $actual - $estimated;
        $variancePercent = $estimated > 0 ? ($variance / $estimated) * 100 : 0;

        return [
            'estimated_cost' => $estimated,
            'actual_cost' => $actual,
            'variance' => $variance,
            'variance_percent' => round($variancePercent, 2),
        ];
    }
}
