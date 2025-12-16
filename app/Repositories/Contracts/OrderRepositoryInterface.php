<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find order by reference
     *
     * @param string $reference
     * @return Order|null
     */
    public function findByReference(string $reference): ?Order;

    /**
     * Get orders with items and client
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getWithRelations(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get orders by state
     *
     * @param string $state
     * @return Collection
     */
    public function getByState(string $state): Collection;

    /**
     * Get orders for a client
     *
     * @param int $clientId
     * @return Collection
     */
    public function getByClient(int $clientId): Collection;

    /**
     * Get orders pending deposit
     *
     * @return Collection
     */
    public function getPendingDeposit(): Collection;
}
