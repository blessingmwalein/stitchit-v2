<?php

namespace App\Repositories;

use App\Models\RugPricingRecipeItem;
use Illuminate\Database\Eloquent\Collection;

class RugPricingRecipeItemRepository
{
    /**
     * Get all items for a recipe
     */
    public function getByRecipeId(int $recipeId): Collection
    {
        return RugPricingRecipeItem::with('inventoryItem')
            ->where('rug_pricing_recipe_id', $recipeId)
            ->get();
    }

    /**
     * Create a new recipe item
     */
    public function create(array $data): RugPricingRecipeItem
    {
        return RugPricingRecipeItem::create($data);
    }

    /**
     * Update a recipe item
     */
    public function update(int $id, array $data): bool
    {
        $item = RugPricingRecipeItem::find($id);
        if (!$item) {
            return false;
        }
        return $item->update($data);
    }

    /**
     * Delete a recipe item
     */
    public function delete(int $id): bool
    {
        $item = RugPricingRecipeItem::find($id);
        if (!$item) {
            return false;
        }
        return $item->delete();
    }

    /**
     * Delete all items for a recipe
     */
    public function deleteByRecipeId(int $recipeId): int
    {
        return RugPricingRecipeItem::where('rug_pricing_recipe_id', $recipeId)->delete();
    }

    /**
     * Bulk create items for a recipe
     */
    public function bulkCreate(int $recipeId, array $items): array
    {
        $created = [];
        
        foreach ($items as $itemData) {
            $itemData['rug_pricing_recipe_id'] = $recipeId;
            $created[] = $this->create($itemData);
        }
        
        return $created;
    }
}
