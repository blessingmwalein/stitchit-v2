<?php

namespace App\Repositories\Eloquent;

use App\Models\FinishedProduct;
use App\Repositories\Contracts\FinishedProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class FinishedProductRepository extends BaseRepository implements FinishedProductRepositoryInterface
{
    /**
     * @inheritDoc
     */
    protected function model(): string
    {
        return FinishedProduct::class;
    }

    /**
     * @inheritDoc
     */
    public function findByReference(string $reference): ?FinishedProduct
    {
        return $this->model->where('reference', $reference)->first();
    }

    /**
     * @inheritDoc
     */
    public function getWithRelations(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model
            ->with([
                'productionJob.orderItem',
                'order.client',
                'orderItem',
                'client',
                'qualityChecker'
            ]);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['quality_status'])) {
            $query->where('quality_status', $filters['quality_status']);
        }

        if (isset($filters['client_id'])) {
            $query->where('client_id', $filters['client_id']);
        }

        if (isset($filters['is_published'])) {
            $query->where('is_published', $filters['is_published']);
        }

        if (isset($filters['use_case'])) {
            $query->where('use_case', $filters['use_case']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhere('product_name', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($clientQuery) use ($search) {
                        $clientQuery->where('full_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getByClient(int $clientId, array $filters = []): Collection
    {
        $query = $this->model
            ->where('client_id', $clientId)
            ->with(['productionJob', 'order', 'orderItem']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['is_published'])) {
            $query->where('is_published', $filters['is_published']);
        }

        return $query->latest()->get();
    }

    /**
     * @inheritDoc
     */
    public function getPublished(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model
            ->where('is_published', true)
            ->with(['client', 'order']);

        if (isset($filters['client_id'])) {
            $query->where('client_id', $filters['client_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest('published_at')->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getByStatus(string $status): Collection
    {
        return $this->model
            ->where('status', $status)
            ->with(['client', 'order', 'productionJob'])
            ->get();
    }
}
