<?php

namespace App\Services;

use App\Models\Client;
use App\Repositories\Contracts\ClientRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ClientService
{
    public function __construct(
        protected ClientRepositoryInterface $clientRepository
    ) {}

    /**
     * Get all clients paginated
     */
    public function getAllPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Client::query()->withCount('orders');

        // General search
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('phone', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('nickname', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Specific filters
        if (!empty($filters['phone'])) {
            $query->where('phone', 'like', "%{$filters['phone']}%");
        }

        if (!empty($filters['email'])) {
            $query->where('email', 'like', "%{$filters['email']}%");
        }

        if (!empty($filters['name'])) {
            $name = $filters['name'];
            $query->where(function ($q) use ($name) {
                $q->where('full_name', 'like', "%{$name}%")
                  ->orWhere('nickname', 'like', "%{$name}%");
            });
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Find or create client by phone
     */
    public function findOrCreateByPhone(string $phone, array $data = []): Client
    {
        $client = $this->clientRepository->findByPhone($phone);

        if (!$client) {
            $client = $this->clientRepository->create(array_merge([
                'phone' => $phone,
            ], $data));
        }

        return $client;
    }

    /**
     * Create a new client
     */
    public function create(array $data): Client
    {
        // Check if phone already exists
        $existing = $this->clientRepository->findByPhone($data['phone']);
        
        if ($existing) {
            throw new \Exception('Client with this phone number already exists.');
        }

        return $this->clientRepository->create($data);
    }

    /**
     * Update client
     */
    public function update(int $id, array $data): Client
    {
        // If phone is being updated, check for conflicts
        if (isset($data['phone'])) {
            $existing = $this->clientRepository->findByPhone($data['phone']);
            if ($existing && $existing->id !== $id) {
                throw new \Exception('Another client with this phone number already exists.');
            }
        }

        return $this->clientRepository->update($id, $data);
    }

    /**
     * Delete client
     */
    public function delete(int $id): bool
    {
        $client = $this->clientRepository->findOrFail($id);

        // Check if client has orders
        if ($client->orders()->count() > 0) {
            throw new \Exception('Cannot delete client with existing orders.');
        }

        return $this->clientRepository->delete($id);
    }

    /**
     * Search clients
     */
    public function search(string $query): Collection
    {
        return $this->clientRepository->search($query);
    }

    /**
     * Get client with order statistics
     */
    public function getWithStatistics(int $id): Client
    {
        $client = $this->clientRepository->findOrFail($id);
        $client->loadCount('orders');
        $client->load(['orders' => function ($query) {
            $query->latest()->limit(5);
        }]);

        return $client;
    }
}
