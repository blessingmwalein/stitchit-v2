<?php

namespace App\Repositories\Contracts;

use App\Models\ProductionJob;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProductionRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find production job by reference
     *
     * @param string $reference
     * @return ProductionJob|null
     */
    public function findByReference(string $reference): ?ProductionJob;

    /**
     * Get jobs with relations
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getWithRelations(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get jobs by state
     *
     * @param string $state
     * @return Collection
     */
    public function getByState(string $state): Collection;

    /**
     * Get jobs assigned to user
     *
     * @param int $userId
     * @return Collection
     */
    public function getAssignedTo(int $userId): Collection;

    /**
     * Get overdue jobs
     *
     * @return Collection
     */
    public function getOverdue(): Collection;
}
