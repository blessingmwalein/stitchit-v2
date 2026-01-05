<?php

namespace App\Repositories\Contracts;

use App\Models\FinishedProduct;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface FinishedProductRepositoryInterface
{
    public function findByReference(string $reference): ?FinishedProduct;
    public function getWithRelations(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function getByClient(int $clientId, array $filters = []): Collection;
    public function getPublished(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function getByStatus(string $status): Collection;
}
