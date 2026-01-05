<?php

namespace App\Services;

use App\Repositories\RugPricingRepository;
use App\Repositories\RugPricingRecipeItemRepository;
use App\Repositories\InventoryItemRepository;
use App\Models\RugPricing;

class RugPricingService
{
    public function __construct(
        protected RugPricingRepository $rugPricingRepository,
        protected RugPricingRecipeItemRepository $recipeItemRepository,
        protected InventoryItemRepository $inventoryRepository
    ) {}

    /**
     * Get all pricing recipes
     */
    public function getAllRecipes()
    {
        return $this->rugPricingRepository->getAll();
    }

    /**
     * Get active pricing recipes
     */
    public function getActiveRecipes()
    {
        return $this->rugPricingRepository->getActive();
    }

    /**
     * Get a recipe by ID
     */
    public function getRecipeById(int $id): ?RugPricing
    {
        return $this->rugPricingRepository->findById($id);
    }

    /**
     * Create a new pricing recipe with items
     */
    public function createRecipe(array $recipeData, array $items = []): RugPricing
    {
        $recipe = $this->rugPricingRepository->create($recipeData);
        
        if (!empty($items)) {
            $this->recipeItemRepository->bulkCreate($recipe->id, $items);
        }
        
        return $this->rugPricingRepository->findById($recipe->id);
    }

    /**
     * Update a pricing recipe
     */
    public function updateRecipe(int $id, array $recipeData, ?array $items = null): bool
    {
        $updated = $this->rugPricingRepository->update($id, $recipeData);
        
        if ($updated && $items !== null) {
            // Delete existing items and recreate
            $this->recipeItemRepository->deleteByRecipeId($id);
            $this->recipeItemRepository->bulkCreate($id, $items);
        }
        
        return $updated;
    }

    /**
     * Delete a pricing recipe
     */
    public function deleteRecipe(int $id): bool
    {
        return $this->rugPricingRepository->delete($id);
    }

    /**
     * Calculate production cost for a rug based on dimensions
     */
    public function calculateProductionCost(
        int $recipeId,
        float $widthCm,
        float $heightCm
    ): array {
        $recipe = $this->rugPricingRepository->findById($recipeId);
        
        if (!$recipe) {
            throw new \Exception("Recipe not found");
        }

        $areaSqCm = $widthCm * $heightCm;
        $itemCosts = [];
        $totalMaterialCost = 0;

        foreach ($recipe->items as $item) {
            $cost = $item->calculateCost($widthCm, $heightCm);
            $itemCosts[] = [
                'item_id' => $item->inventory_item_id,
                'item_name' => $item->inventoryItem->name,
                'calculation_type' => $item->calculation_type,
                'quantity' => $item->quantity,
                'unit_cost' => $item->inventoryItem->unit_cost,
                'total_cost' => round($cost, 2),
            ];
            $totalMaterialCost += $cost;
        }

        // Calculate cost per square cm
        $costPerSqCm = $areaSqCm > 0 ? $totalMaterialCost / $areaSqCm : 0;

        return [
            'recipe_id' => $recipe->id,
            'recipe_name' => $recipe->name,
            'width_cm' => $widthCm,
            'height_cm' => $heightCm,
            'area_sqcm' => $areaSqCm,
            'total_material_cost' => round($totalMaterialCost, 2),
            'cost_per_sqcm' => round($costPerSqCm, 4),
            'item_costs' => $itemCosts,
        ];
    }

    /**
     * Calculate final price with profit margin
     */
    public function calculateFinalPrice(
        int $recipeId,
        float $widthCm,
        float $heightCm,
        ?float $profitMarginPercent = null
    ): array {
        $costData = $this->calculateProductionCost($recipeId, $widthCm, $heightCm);
        $recipe = $this->rugPricingRepository->findById($recipeId);
        
        $profitMargin = $profitMarginPercent ?? $recipe->profit_margin_percentage ?? 0;
        $productionCost = $costData['total_material_cost'];
        
        $profitAmount = $productionCost * ($profitMargin / 100);
        $finalPrice = $productionCost + $profitAmount;

        return array_merge($costData, [
            'profit_margin_percentage' => $profitMargin,
            'profit_amount' => round($profitAmount, 2),
            'final_price' => round($finalPrice, 2),
            'recommended_price' => round($finalPrice, 2),
        ]);
    }

    /**
     * Calculate price per square cm based on reference data
     */
    public function calculateUnitPriceFromReference(int $recipeId): array
    {
        $recipe = $this->rugPricingRepository->findById($recipeId);
        
        if (!$recipe || !$recipe->reference_area_sqcm) {
            throw new \Exception("Recipe missing reference dimensions");
        }

        $referenceCost = $this->calculateProductionCost(
            $recipeId,
            $recipe->reference_width_cm,
            $recipe->reference_height_cm
        );

        $referencePrice = $recipe->reference_price ?? 0;
        $referenceProfit = $referencePrice - $referenceCost['total_material_cost'];
        $referenceProfitMargin = $referenceCost['total_material_cost'] > 0
            ? ($referenceProfit / $referenceCost['total_material_cost']) * 100
            : 0;

        return [
            'reference_width_cm' => $recipe->reference_width_cm,
            'reference_height_cm' => $recipe->reference_height_cm,
            'reference_area_sqcm' => $recipe->reference_area_sqcm,
            'reference_price' => $referencePrice,
            'reference_cost' => $referenceCost['total_material_cost'],
            'reference_profit' => round($referenceProfit, 2),
            'reference_profit_margin' => round($referenceProfitMargin, 2),
            'cost_per_sqcm' => $referenceCost['cost_per_sqcm'],
            'price_per_sqcm' => round($referencePrice / $recipe->reference_area_sqcm, 4),
            'item_breakdown' => $referenceCost['item_costs'],
        ];
    }

    /**
     * Get all available inventory items for recipe creation
     */
    public function getAvailableInventoryItems()
    {
        return $this->inventoryRepository->getActive();
    }

    /**
     * Validate recipe data
     */
    protected function validateRecipeData(array $data): void
    {
        if (isset($data['reference_width_cm']) && isset($data['reference_height_cm'])) {
            if ($data['reference_width_cm'] <= 0 || $data['reference_height_cm'] <= 0) {
                throw new \Exception("Reference dimensions must be positive");
            }
        }

        if (isset($data['profit_margin_percentage']) && $data['profit_margin_percentage'] < 0) {
            throw new \Exception("Profit margin cannot be negative");
        }
    }
}
