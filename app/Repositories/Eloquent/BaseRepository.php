<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseRepository implements BaseRepositoryInterface
{
    protected Model $model;

    public function __construct()
    {
        $this->model = $this->makeModel();
    }

    /**
     * Specify Model class name
     *
     * @return string
     */
    abstract protected function model(): string;

    /**
     * Make Model instance
     *
     * @return Model
     */
    protected function makeModel(): Model
    {
        $model = app($this->model());

        if (!$model instanceof Model) {
            throw new \RuntimeException("Class {$this->model()} must be an instance of Illuminate\\Database\\Eloquent\\Model");
        }

        return $model;
    }

    /**
     * @inheritDoc
     */
    public function all(array $columns = ['*']): Collection
    {
        return $this->model->get($columns);
    }

    /**
     * @inheritDoc
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->model->paginate($perPage, $columns);
    }

    /**
     * @inheritDoc
     */
    public function find(int $id): ?Model
    {
        return $this->model->find($id);
    }

    /**
     * @inheritDoc
     */
    public function findOrFail(int $id): Model
    {
        return $this->model->findOrFail($id);
    }

    /**
     * @inheritDoc
     */
    public function findBy(string $column, mixed $value): ?Model
    {
        return $this->model->where($column, $value)->first();
    }

    /**
     * @inheritDoc
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * @inheritDoc
     */
    public function update(int $id, array $data): Model
    {
        $record = $this->findOrFail($id);
        $record->update($data);
        return $record->fresh();
    }

    /**
     * @inheritDoc
     */
    public function delete(int $id): bool
    {
        return $this->findOrFail($id)->delete();
    }

    /**
     * @inheritDoc
     */
    public function filter(array $filters, ?int $perPage = null): Collection|LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        foreach ($filters as $field => $value) {
            if ($value !== null && $value !== '') {
                $query->where($field, $value);
            }
        }

        return $perPage ? $query->paginate($perPage) : $query->get();
    }
}
