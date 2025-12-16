<?php

namespace App\Repositories\Eloquent;

use App\Models\InventoryItem;
use App\Repositories\Contracts\InventoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class InventoryRepository extends BaseRepository implements InventoryRepositoryInterface
{
    /**
     * @inheritDoc
     */
    protected function model(): string
    {
        return InventoryItem::class;
    }

    /**
     * @inheritDoc
     */
    public function findBySku(string $sku): ?InventoryItem
    {
        return $this->model->where('sku', $sku)->first();
    }

    /**
     * @inheritDoc
     */
    public function getBelowReorderPoint(): Collection
    {
        return $this->model
            ->whereColumn('current_stock', '<=', 'reorder_point')
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function getByType(string $type): Collection
    {
        return $this->model->where('type', $type)->get();
    }

    /**
     * @inheritDoc
     */
    public function updateStock(int $id, float $quantityChange): InventoryItem
    {
        $item = $this->findOrFail($id);
        $item->current_stock += $quantityChange;
        $item->save();
        
        return $item->fresh();
    }

    /**
     * Filter inventory items with advanced search
     *
     * @param array $filters
     * @param int|null $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function filter(array $filters, ?int $perPage = null): \Illuminate\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
    {
        $query = $this->model->newQuery();

        // Type filter
        if (isset($filters['type']) && $filters['type'] !== '' && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        // Search filter (SKU or name)
        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        return $perPage ? $query->latest()->paginate($perPage) : $query->latest()->get();
    }
}
