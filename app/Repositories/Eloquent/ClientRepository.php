<?php

namespace App\Repositories\Eloquent;

use App\Models\Client;
use App\Repositories\Contracts\ClientRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class ClientRepository extends BaseRepository implements ClientRepositoryInterface
{
    /**
     * @inheritDoc
     */
    protected function model(): string
    {
        return Client::class;
    }

    /**
     * @inheritDoc
     */
    public function findByPhone(string $phone): ?Client
    {
        return $this->model->where('phone', $phone)->first();
    }

    /**
     * @inheritDoc
     */
    public function search(string $query): Collection
    {
        return $this->model
            ->where('phone', 'like', "%{$query}%")
            ->orWhere('full_name', 'like', "%{$query}%")
            ->orWhere('nickname', 'like', "%{$query}%")
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function withOrderCounts(): Collection
    {
        return $this->model->withCount('orders')->get();
    }
}
