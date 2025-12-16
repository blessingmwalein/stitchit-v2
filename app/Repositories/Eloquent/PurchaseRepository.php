<?php

namespace App\Repositories\Eloquent;

use App\Models\PurchaseOrder;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PurchaseRepository extends BaseRepository implements PurchaseRepositoryInterface
{
    /**
     * @inheritDoc
     */
    protected function model(): string
    {
        return PurchaseOrder::class;
    }

    /**
     * @inheritDoc
     */
    public function findByReference(string $reference): ?PurchaseOrder
    {
        return $this->model->where('reference', $reference)->first();
    }

    /**
     * @inheritDoc
     */
    public function findWithRelations(int $id): ?PurchaseOrder
    {
        return $this->model
            ->with([
                'supplier', 
                'lines.inventoryItem', 
                'creator',
                'journalEntry' => function($query) {
                    $query->select('id', 'reference', 'status', 'source_type', 'source_id');
                }
            ])
            ->withCount('lines')
            ->find($id);
    }

    /**
     * @inheritDoc
     */
    public function getWithRelations(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model
            ->with(['supplier', 'lines.inventoryItem', 'creator'])
            ->withCount('lines');

        if (isset($filters['state']) && $filters['state'] !== 'all') {
            $query->where('state', $filters['state']);
        }

        if (isset($filters['supplier_id']) && $filters['supplier_id'] !== 'all') {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
                        $supplierQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getByState(string $state): Collection
    {
        return $this->model->where('state', $state)->with(['supplier', 'lines'])->get();
    }

    /**
     * @inheritDoc
     */
    public function getBySupplier(int $supplierId): Collection
    {
        return $this->model->where('supplier_id', $supplierId)->with('lines')->latest()->get();
    }

    /**
     * @inheritDoc
     */
    public function getPendingReceipts(): Collection
    {
        return $this->model
            ->whereIn('state', ['SENT', 'PARTIALLY_RECEIVED'])
            ->with(['supplier', 'lines.inventoryItem'])
            ->get();
    }
}
