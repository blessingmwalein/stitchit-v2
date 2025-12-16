<?php

namespace App\Repositories\Contracts;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Collection;

interface InventoryRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find inventory item by SKU
     *
     * @param string $sku
     * @return InventoryItem|null
     */
    public function findBySku(string $sku): ?InventoryItem;

    /**
     * Get items below reorder point
     *
     * @return Collection
     */
    public function getBelowReorderPoint(): Collection;

    /**
     * Get items by type
     *
     * @param string $type
     * @return Collection
     */
    public function getByType(string $type): Collection;

    /**
     * Update stock level
     *
     * @param int $id
     * @param float $quantityChange
     * @return InventoryItem
     */
    public function updateStock(int $id, float $quantityChange): InventoryItem;
}
