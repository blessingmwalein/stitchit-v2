<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Repositories\Contracts\InventoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function __construct(
        protected InventoryRepositoryInterface $inventoryRepository
    ) {}

    /**
     * Get all inventory items
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->inventoryRepository->filter($filters, $perPage);
    }

    /**
     * Create inventory item
     */
    public function create(array $data): InventoryItem
    {
        // Check if SKU already exists
        $existing = $this->inventoryRepository->findBySku($data['sku']);
        
        if ($existing) {
            throw new \Exception('Inventory item with this SKU already exists.');
        }

        return $this->inventoryRepository->create($data);
    }

    /**
     * Update inventory item
     */
    public function update(int $id, array $data): InventoryItem
    {
        // If SKU is being updated, check for conflicts
        if (isset($data['sku'])) {
            $existing = $this->inventoryRepository->findBySku($data['sku']);
            if ($existing && $existing->id !== $id) {
                throw new \Exception('Another inventory item with this SKU already exists.');
            }
        }

        return $this->inventoryRepository->update($id, $data);
    }

    /**
     * Adjust stock manually
     */
    public function adjustStock(
        int $itemId,
        float $quantityChange,
        string $reason,
        ?string $notes = null
    ): InventoryTransaction {
        return DB::transaction(function () use ($itemId, $quantityChange, $reason, $notes) {
            $item = $this->inventoryRepository->findOrFail($itemId);
            
            $oldCost = $item->unit_cost;
            $oldStock = $item->current_stock;

            // Update stock
            $item = $this->inventoryRepository->updateStock($itemId, $quantityChange);

            // Create transaction record
            $transaction = InventoryTransaction::create([
                'inventory_item_id' => $itemId,
                'reference_type' => $reason,
                'quantity_change' => $quantityChange,
                'unit_cost_before' => $oldCost,
                'unit_cost_after' => $item->unit_cost,
                'created_by' => auth()->id(),
                'notes' => $notes,
            ]);

            return $transaction;
        });
    }

    /**
     * Get items below reorder point
     */
    public function getItemsNeedingReorder(): Collection
    {
        return $this->inventoryRepository->getBelowReorderPoint();
    }

    /**
     * Delete inventory item
     */
    public function delete(int $id): bool
    {
        $item = $this->inventoryRepository->findOrFail($id);

        // Check if item is used in BOM or has stock
        if ($item->current_stock > 0) {
            throw new \Exception('Cannot delete inventory item with stock on hand.');
        }

        if ($item->bomLines()->count() > 0) {
            throw new \Exception('Cannot delete inventory item used in BOMs.');
        }

        return $this->inventoryRepository->delete($id);
    }
}
