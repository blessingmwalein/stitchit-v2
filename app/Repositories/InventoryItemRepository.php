<?php

namespace App\Repositories;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Collection;

class InventoryItemRepository
{
    /**
     * Get all active inventory items
     */
    public function getActive(): Collection
    {
        return InventoryItem::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * Get inventory items by type
     */
    public function getByType(string $type): Collection
    {
        return InventoryItem::where('is_active', true)
            ->where('type', $type)
            ->orderBy('name')
            ->get();
    }

    /**
     * Find an inventory item by ID
     */
    public function findById(int $id): ?InventoryItem
    {
        return InventoryItem::find($id);
    }

    /**
     * Get items by IDs
     */
    public function getByIds(array $ids): Collection
    {
        return InventoryItem::whereIn('id', $ids)->get();
    }
}
