<?php

namespace App\Repositories;

use App\Models\RugPricing;
use Illuminate\Database\Eloquent\Collection;

class RugPricingRepository
{
    /**
     * Get all pricing recipes
     */
    public function getAll(): Collection
    {
        return RugPricing::with(['items.inventoryItem'])->get();
    }

    /**
     * Get active pricing recipes
     */
    public function getActive(): Collection
    {
        return RugPricing::with(['items.inventoryItem'])
            ->active()
            ->get();
    }

    /**
     * Find a pricing recipe by ID
     */
    public function findById(int $id): ?RugPricing
    {
        return RugPricing::with(['items.inventoryItem'])->find($id);
    }

    /**
     * Create a new pricing recipe
     */
    public function create(array $data): RugPricing
    {
        return RugPricing::create($data);
    }

    /**
     * Update a pricing recipe
     */
    public function update(int $id, array $data): bool
    {
        $recipe = RugPricing::find($id);
        if (!$recipe) {
            return false;
        }
        return $recipe->update($data);
    }

    /**
     * Delete a pricing recipe
     */
    public function delete(int $id): bool
    {
        $recipe = RugPricing::find($id);
        if (!$recipe) {
            return false;
        }
        return $recipe->delete();
    }

    /**
     * Get the default active recipe
     */
    public function getDefault(): ?RugPricing
    {
        return RugPricing::with(['items.inventoryItem'])
            ->active()
            ->first();
    }
}
