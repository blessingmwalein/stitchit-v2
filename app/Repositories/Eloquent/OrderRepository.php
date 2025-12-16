<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderRepository extends BaseRepository implements OrderRepositoryInterface
{
    /**
     * @inheritDoc
     */
    protected function model(): string
    {
        return Order::class;
    }

    /**
     * @inheritDoc
     */
    public function findByReference(string $reference): ?Order
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
                'client', 
                'items', 
                'payments.journalEntry:id,reference,status,source_type,source_id', 
                'dispatch',
                'journalEntries' => function($query) {
                    $query->select('id', 'reference', 'type', 'status', 'source_type', 'source_id');
                }
            ])
            ->withCount('items');

        if (isset($filters['id'])) {
            $query->where('id', $filters['id']);
        }

        if (isset($filters['state'])) {
            $query->where('state', $filters['state']);
        }

        if (isset($filters['client_id'])) {
            $query->where('client_id', $filters['client_id']);
        }

        if (isset($filters['reference'])) {
            $query->where('reference', 'like', "%{$filters['reference']}%");
        }

        if (isset($filters['client_name'])) {
            $query->whereHas('client', function ($q) use ($filters) {
                $name = $filters['client_name'];
                $q->where('full_name', 'like', "%{$name}%")
                  ->orWhere('nickname', 'like', "%{$name}%");
            });
        }

        if (isset($filters['client_email'])) {
            $query->whereHas('client', function ($q) use ($filters) {
                $q->where('email', 'like', "%{$filters['client_email']}%");
            });
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($clientQuery) use ($search) {
                        $clientQuery->where('phone', 'like', "%{$search}%")
                            ->orWhere('full_name', 'like', "%{$search}%")
                            ->orWhere('nickname', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items', function ($itemQuery) use ($search) {
                        $itemQuery->where('description', 'like', "%{$search}%");
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
        return $this->model->where('state', $state)->with('client', 'items')->get();
    }

    /**
     * @inheritDoc
     */
    public function getByClient(int $clientId): Collection
    {
        return $this->model->where('client_id', $clientId)->with('items')->latest()->get();
    }

    /**
     * @inheritDoc
     */
    public function getPendingDeposit(): Collection
    {
        return $this->model->where('state', 'PENDING_DEPOSIT')->with('client')->get();
    }
}
