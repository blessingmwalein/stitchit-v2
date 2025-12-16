<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface BaseRepositoryInterface
{
    /**
     * Get all records
     *
     * @param array $columns
     * @return Collection
     */
    public function all(array $columns = ['*']): Collection;

    /**
     * Get paginated records
     *
     * @param int $perPage
     * @param array $columns
     * @return LengthAwarePaginator
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator;

    /**
     * Find record by ID
     *
     * @param int $id
     * @return Model|null
     */
    public function find(int $id): ?Model;

    /**
     * Find record by ID or fail
     *
     * @param int $id
     * @return Model
     */
    public function findOrFail(int $id): Model;

    /**
     * Find by column value
     *
     * @param string $column
     * @param mixed $value
     * @return Model|null
     */
    public function findBy(string $column, mixed $value): ?Model;

    /**
     * Create a new record
     *
     * @param array $data
     * @return Model
     */
    public function create(array $data): Model;

    /**
     * Update a record
     *
     * @param int $id
     * @param array $data
     * @return Model
     */
    public function update(int $id, array $data): Model;

    /**
     * Delete a record
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Get records with filters
     *
     * @param array $filters
     * @param int|null $perPage
     * @return Collection|LengthAwarePaginator
     */
    public function filter(array $filters, ?int $perPage = null): Collection|LengthAwarePaginator;
}
