<?php

namespace App\Repositories\Contracts;

use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface PurchaseRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find purchase order by reference
     *
     * @param string $reference
     * @return PurchaseOrder|null
     */
    public function findByReference(string $reference): ?PurchaseOrder;

    /**
     * Find single purchase order with relations
     *
     * @param int $id
     * @return PurchaseOrder|null
     */
    public function findWithRelations(int $id): ?PurchaseOrder;

    /**
     * Get purchase orders with relations
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getWithRelations(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get purchase orders by state
     *
     * @param string $state
     * @return Collection
     */
    public function getByState(string $state): Collection;

    /**
     * Get purchase orders for supplier
     *
     * @param int $supplierId
     * @return Collection
     */
    public function getBySupplier(int $supplierId): Collection;

    /**
     * Get pending receipts
     *
     * @return Collection
     */
    public function getPendingReceipts(): Collection;
}
