<?php

namespace App\Repositories\Contracts;

use App\Models\Client;
use Illuminate\Database\Eloquent\Collection;

interface ClientRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find client by phone number
     *
     * @param string $phone
     * @return Client|null
     */
    public function findByPhone(string $phone): ?Client;

    /**
     * Search clients by name or phone
     *
     * @param string $query
     * @return Collection
     */
    public function search(string $query): Collection;

    /**
     * Get clients with their order counts
     *
     * @return Collection
     */
    public function withOrderCounts(): Collection;
}
