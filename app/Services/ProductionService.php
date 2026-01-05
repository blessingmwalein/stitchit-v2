<?php

namespace App\Services;

use App\Models\ProductionJob;
use App\Models\MaterialConsumption;
use App\Models\CostSnapshot;
use App\Repositories\Contracts\ProductionRepositoryInterface;
use App\Repositories\Contracts\InventoryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProductionService
{
    public function __construct(
        protected ProductionRepositoryInterface $productionRepository,
        protected InventoryRepositoryInterface $inventoryRepository,
        protected MaterialEstimationService $estimationService,
        protected AccountingService $accountingService,
        protected OrderService $orderService
    ) {}

    /**
     * Get production jobs
     */
    public function getJobs(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->productionRepository->getWithRelations($filters, $perPage);
    }

    /**
     * Create production job
     */
    public function create(array $data): ProductionJob
    {
        $data['created_by'] = $data['created_by'] ?? auth()->id();
        
        return DB::transaction(function () use ($data) {
            $job = $this->productionRepository->create($data);

            // Auto-generate material estimates
            $this->estimationService->autoGenerateEstimates($job);

            // Update parent order status to IN_PRODUCTION if not already
            $orderItem = $job->orderItem()->with('order')->first();
            if ($orderItem && $orderItem->order) {
                $order = $orderItem->order;
                if (in_array($order->state, ['APPROVED', 'DEPOSIT_PAID'])) {
                    $this->orderService->transitionState($order->id, 'IN_PRODUCTION');
                }
            }

            return $job->fresh(['materialConsumptions.inventoryItem']);
        });
    }

    /**
     * Update production job
     */
    public function update(int $id, array $data): ProductionJob
    {
        return $this->productionRepository->update($id, $data);
    }

    /**
     * Transition job state
     */
    public function transitionState(int $id, string $newState): ProductionJob
    {
        $job = $this->productionRepository->findOrFail($id);

        $validTransitions = [
            'PLANNED' => ['MATERIALS_ALLOCATED'],
            'MATERIALS_ALLOCATED' => ['TUFTING'],
            'TUFTING' => ['FINISHING'],
            'FINISHING' => ['QUALITY_CHECK'],
            'QUALITY_CHECK' => ['COMPLETED'],
        ];

        if (!isset($validTransitions[$job->state]) || 
            !in_array($newState, $validTransitions[$job->state])) {
            throw new \Exception("Invalid state transition from {$job->state} to {$newState}");
        }

        return DB::transaction(function () use ($job, $newState) {
            $job->state = $newState;

            // Set actual timestamps
            if ($newState === 'MATERIALS_ALLOCATED' && !$job->actual_start_at) {
                $job->actual_start_at = now();
            }

            if ($newState === 'COMPLETED' && !$job->actual_end_at) {
                $job->actual_end_at = now();
                
                // Trigger cost snapshot creation
                $this->createCostSnapshot($job);
                
                // Record production costs in accounting system
                try {
                    $this->accountingService->recordProductionCosts($job);
                } catch (\Exception $e) {
                    \Log::error('Failed to record production costs in accounting: ' . $e->getMessage());
                    // Don't fail the transition, just log the error
                }
            }

            $job->save();

            return $job->fresh();
        });
    }

    /**
     * Allocate materials to job
     */
    public function allocateMaterials(int $jobId, array $bomData): ProductionJob
    {
        return DB::transaction(function () use ($jobId, $bomData) {
            $job = $this->productionRepository->findOrFail($jobId);

            if ($job->state !== 'PLANNED') {
                throw new \Exception('Can only allocate materials to PLANNED jobs.');
            }

            // Create BOM lines
            foreach ($bomData as $bomLine) {
                $job->bomLines()->create([
                    'inventory_item_id' => $bomLine['inventory_item_id'],
                    'planned_quantity' => $bomLine['planned_quantity'],
                    'unit' => $bomLine['unit'],
                    'notes' => $bomLine['notes'] ?? null,
                ]);
            }

            // Transition to allocated
            return $this->transitionState($jobId, 'MATERIALS_ALLOCATED');
        });
    }

    /**
     * Add actual material consumption
     */
    public function addActualMaterial(int $jobId, array $data): MaterialConsumption
    {
        return DB::transaction(function () use ($jobId, $data) {
            $job = $this->productionRepository->findOrFail($jobId);

            $inventoryItem = $this->inventoryRepository->find($data['inventory_item_id']);
            $quantity = $data['consumed_quantity'];
            $wasteQuantity = $data['waste_quantity'] ?? 0;
            $unitCost = $inventoryItem->unit_cost;
            $totalQuantity = $quantity + $wasteQuantity;
            $totalCost = $totalQuantity * $unitCost;

            // Create actual consumption record
            $consumption = $job->materialConsumptions()->create([
                'inventory_item_id' => $data['inventory_item_id'],
                'type' => 'actual',
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
                'waste_quantity' => $wasteQuantity,
                'recorded_by' => auth()->id(),
                'recorded_at' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            // Update inventory stock
            $this->inventoryRepository->updateStock(
                $data['inventory_item_id'],
                -$totalQuantity
            );

            // Recalculate job actual cost
            $this->updateActualCost($job);

            return $consumption->fresh(['inventoryItem']);
        });
    }

    /**
     * Update actual material consumption
     */
    public function updateActualMaterial(int $jobId, int $consumptionId, array $data): MaterialConsumption
    {
        return DB::transaction(function () use ($jobId, $consumptionId, $data) {
            $job = $this->productionRepository->findOrFail($jobId);
            $consumption = MaterialConsumption::where('production_job_id', $jobId)
                ->where('type', 'actual')
                ->findOrFail($consumptionId);

            $oldQuantity = $consumption->consumed_quantity;
            $oldWaste = $consumption->waste_quantity;
            $oldTotal = $oldQuantity + $oldWaste;

            $newQuantity = $data['consumed_quantity'] ?? $consumption->consumed_quantity;
            $newWaste = $data['waste_quantity'] ?? $consumption->waste_quantity;
            $newTotal = $newQuantity + $newWaste;

            $unitCost = $consumption->unit_cost;
            $newTotalCost = $newTotal * $unitCost;

            // Update consumption
            $consumption->update([
                'quantity' => $newQuantity,
                'waste_quantity' => $newWaste,
                'total_cost' => $newTotalCost,
                'notes' => $data['notes'] ?? $consumption->notes,
            ]);

            // Adjust inventory (restore old, deduct new)
            $difference = $newTotal - $oldTotal;
            if ($difference != 0) {
                $this->inventoryRepository->updateStock(
                    $consumption->inventory_item_id,
                    -$difference
                );
            }

            // Recalculate job actual cost
            $this->updateActualCost($job);

            return $consumption->fresh(['inventoryItem']);
        });
    }

    /**
     * Delete actual material consumption
     */
    public function deleteActualMaterial(int $jobId, int $consumptionId): bool
    {
        return DB::transaction(function () use ($jobId, $consumptionId) {
            $job = $this->productionRepository->findOrFail($jobId);
            $consumption = MaterialConsumption::where('production_job_id', $jobId)
                ->where('type', 'actual')
                ->findOrFail($consumptionId);

            $totalQuantity = $consumption->consumed_quantity + $consumption->waste_quantity;

            // Restore inventory
            $this->inventoryRepository->updateStock(
                $consumption->inventory_item_id,
                $totalQuantity
            );

            // Delete consumption
            $consumption->delete();

            // Recalculate job actual cost
            $this->updateActualCost($job);

            return true;
        });
    }

    /**
     * Update job's actual material cost
     */
    protected function updateActualCost(ProductionJob $job): void
    {
        $actualCost = $job->materialConsumptions()
            ->where('type', 'actual')
            ->sum('total_cost');

        $job->update([
            'actual_material_cost' => $actualCost,
        ]);
    }

    /**
     * Record material consumption (legacy method - kept for backward compatibility)
     */
    public function recordConsumption(int $jobId, array $consumptionData): MaterialConsumption
    {
        // Map old structure to new structure
        return $this->addActualMaterial($jobId, [
            'inventory_item_id' => $consumptionData['inventory_item_id'],
            'consumed_quantity' => $consumptionData['consumed_quantity'],
            'waste_quantity' => $consumptionData['waste_quantity'] ?? 0,
            'notes' => $consumptionData['notes'] ?? null,
        ]);
    }

    /**
     * Create cost snapshot for completed job
     */
    protected function createCostSnapshot(ProductionJob $job): CostSnapshot
    {
        // Calculate budgeted cost from BOM
        $budgetedCost = $job->bomLines->sum('estimated_cost');

        // Calculate actual material cost from consumptions
        $actualMaterialCost = $job->materialConsumptions->sum('cost');

        // Calculate labor cost (basic calculation - can be enhanced)
        $laborCost = 0;
        if ($job->actual_duration) {
            $laborCost = $job->actual_duration * 10; // $10/hour placeholder
        }

        // Calculate overhead (basic allocation)
        $overheadAllocated = $actualMaterialCost * 0.2; // 20% of material cost

        $actualCost = $actualMaterialCost + $laborCost + $overheadAllocated;
        $variance = $actualCost - $budgetedCost;

        return $job->costSnapshot()->create([
            'budgeted_cost' => $budgetedCost,
            'actual_material_cost' => $actualMaterialCost,
            'labor_cost' => $laborCost,
            'overhead_allocated' => $overheadAllocated,
            'actual_cost' => $actualCost,
            'variance' => $variance,
            'captured_at' => now(),
        ]);
    }

    /**
     * Assign job to user
     */
    public function assignTo(int $jobId, int $userId): ProductionJob
    {
        return $this->productionRepository->update($jobId, [
            'assigned_to' => $userId,
        ]);
    }

    /**
     * Save estimated materials from recipe calculation
     */
    public function saveEstimates(int $jobId, array $data): ProductionJob
    {
        $job = $this->productionRepository->findOrFail($jobId);

        return DB::transaction(function () use ($job, $data) {
            // Delete existing estimated materials
            MaterialConsumption::where('production_job_id', $job->id)
                ->where('type', 'estimated')
                ->delete();

            // Create new estimated materials
            foreach ($data['materials'] as $material) {
                $inventoryItem = $this->inventoryRepository->findOrFail($material['inventory_item_id']);
                
                MaterialConsumption::create([
                    'production_job_id' => $job->id,
                    'inventory_item_id' => $material['inventory_item_id'],
                    'type' => 'estimated',
                    'quantity' => $material['consumed_quantity'],
                    'waste_quantity' => $material['waste_quantity'] ?? 0,
                    'unit_cost' => $inventoryItem->unit_cost,
                    'total_cost' => $material['consumed_quantity'] * $inventoryItem->unit_cost,
                    'recorded_by' => auth()->id(),
                    'recorded_at' => now(),
                ]);
            }

            // Update estimated labor hours if provided
            if (isset($data['estimated_labor_hours'])) {
                $job->estimated_labor_hours = $data['estimated_labor_hours'];
            }

            // Recalculate estimated material cost
            $totalEstimatedCost = MaterialConsumption::where('production_job_id', $job->id)
                ->where('type', 'estimated')
                ->sum('total_cost');
            
            $job->estimated_material_cost = $totalEstimatedCost;
            $job->save();

            return $job->fresh(['materialConsumptions.inventoryItem']);
        });
    }

    /**
     * Complete production job
     */
    public function completeJob(int $jobId, array $data): ProductionJob
    {
        $job = $this->productionRepository->findOrFail($jobId);

        if ($job->state !== 'QUALITY_CHECK') {
            throw new \Exception('Job must be in QUALITY_CHECK state to complete.');
        }

        return DB::transaction(function () use ($job, $data) {
            $job->state = 'COMPLETED';
            $job->actual_end_at = now();
            $job->actual_labor_hours = $data['actual_labor_hours'];
            
            if (isset($data['quality_notes'])) {
                $job->notes = ($job->notes ? $job->notes . "\n\n" : '') . 
                             "Quality Check Notes:\n" . $data['quality_notes'];
            }

            $job->save();

            // Create cost snapshot
            $this->createCostSnapshot($job);

            // Record production costs in accounting system
            try {
                $this->accountingService->recordProductionCost($job);
            } catch (\Exception $e) {
                \Log::warning("Failed to record production cost in accounting: {$e->getMessage()}");
            }

            return $job->fresh(['materialConsumptions.inventoryItem']);
        });
    }

    /**
     * Delete job
     */
    public function delete(int $id): bool
    {
        $job = $this->productionRepository->findOrFail($id);

        // Only allow deleting PLANNED jobs
        if ($job->state !== 'PLANNED') {
            throw new \Exception('Can only delete PLANNED jobs.');
        }

        return $this->productionRepository->delete($id);
    }
}

