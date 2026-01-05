<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RugPricingService;
use Illuminate\Http\Request;

class ClientRugPricingController extends Controller
{
    public function __construct(
        protected RugPricingService $rugPricingService
    ) {}

    /**
     * Calculate rug price for client
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function calculatePrice(Request $request)
    {
        $validated = $request->validate([
            'width_cm' => 'required|numeric|min:1|max:1000',
            'height_cm' => 'required|numeric|min:1|max:1000',
        ]);

        try {
            // Automatically get the active pricing recipe
            $activeRecipe = $this->rugPricingService->getActiveRecipes()->first();
            
            if (!$activeRecipe) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active pricing recipe found. Please contact support.',
                ], 404);
            }

            $result = $this->rugPricingService->calculateFinalPrice(
                $activeRecipe->id,
                $validated['width_cm'],
                $validated['height_cm']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'dimensions' => [
                        'width_cm' => $result['width_cm'],
                        'height_cm' => $result['height_cm'],
                        'area_sqcm' => $result['area_sqcm'],
                    ],
                    'pricing' => [
                        'production_cost' => $result['total_material_cost'],
                        'profit_margin_percentage' => $result['profit_margin_percentage'],
                        'profit_amount' => $result['profit_amount'],
                        'final_price' => $result['final_price'],
                        'currency' => 'USD',
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate price: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get available pricing recipes
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecipes()
    {
        try {
            $recipes = $this->rugPricingService->getActiveRecipes();

            return response()->json([
                'success' => true,
                'data' => $recipes->map(function ($recipe) {
                    return [
                        'id' => $recipe->id,
                        'name' => $recipe->name,
                        'description' => $recipe->description,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recipes: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get detailed cost breakdown (optional, for transparency)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCostBreakdown(Request $request)
    {
        $validated = $request->validate([
            'width_cm' => 'required|numeric|min:1|max:1000',
            'height_cm' => 'required|numeric|min:1|max:1000',
            'recipe_id' => 'nullable|exists:rug_pricing_recipes,id',
        ]);

        try {
            $recipeId = $validated['recipe_id'] ?? null;
            
            if (!$recipeId) {
                $defaultRecipe = $this->rugPricingService->getActiveRecipes()->first();
                if (!$defaultRecipe) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No active pricing recipe found',
                    ], 404);
                }
                $recipeId = $defaultRecipe->id;
            }

            $result = $this->rugPricingService->calculateFinalPrice(
                $recipeId,
                $validated['width_cm'],
                $validated['height_cm']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'dimensions' => [
                        'width_cm' => $result['width_cm'],
                        'height_cm' => $result['height_cm'],
                        'area_sqcm' => $result['area_sqcm'],
                    ],
                    'cost_breakdown' => $result['item_costs'],
                    'summary' => [
                        'total_material_cost' => $result['total_material_cost'],
                        'cost_per_sqcm' => $result['cost_per_sqcm'],
                        'profit_margin_percentage' => $result['profit_margin_percentage'],
                        'profit_amount' => $result['profit_amount'],
                        'final_price' => $result['final_price'],
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate breakdown: ' . $e->getMessage(),
            ], 400);
        }
    }
}
