<?php

namespace App\Repositories\Eloquent;

use App\Models\ProductionJob;
use App\Repositories\Contracts\ProductionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductionRepository extends BaseRepository implements ProductionRepositoryInterface
{
    /**
     * @inheritDoc
     */
    protected function model(): string
    {
        return ProductionJob::class;
    }

    /**
     * @inheritDoc
     */
    public function findByReference(string $reference): ?ProductionJob
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
                'orderItem.order.client', 
                'assignee', 
                'bomLines.inventoryItem',
                'materialConsumptions.inventoryItem'
            ])
            ->withCount(['bomLines', 'materialConsumptions']);

        if (isset($filters['id'])) {
            $query->where('id', $filters['id']);
        }

        if (isset($filters['state'])) {
            $query->where('state', $filters['state']);
        }

        if (isset($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('orderItem.order', function ($orderQuery) use ($search) {
                        $orderQuery->where('reference', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getByState(string $state): Collection
    {
        return $this->model
            ->where('state', $state)
            ->with(['orderItem.order.client', 'assignee'])
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function getAssignedTo(int $userId): Collection
    {
        return $this->model
            ->where('assigned_to', $userId)
            ->whereNotIn('state', ['COMPLETED'])
            ->with('orderItem.order')
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function getOverdue(): Collection
    {
        return $this->model
            ->where('planned_end_at', '<', now())
            ->whereNull('actual_end_at')
            ->with(['orderItem.order.client', 'assignee'])
            ->get();
    }
}
