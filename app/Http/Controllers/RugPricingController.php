<?php

namespace App\Http\Controllers;

use App\Services\RugPricingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RugPricingController extends Controller
{
    public function __construct(
        protected RugPricingService $rugPricingService
    ) {}

    /**
     * Display listing of pricing recipes
     */
    public function index()
    {
        $recipes = $this->rugPricingService->getAllRecipes();

        return Inertia::render('rug-pricing/index', [
            'recipes' => $recipes,
        ]);
    }

    /**
     * Show the form for creating a new recipe
     */
    public function create()
    {
        $inventoryItems = $this->rugPricingService->getAvailableInventoryItems();

        return Inertia::render('rug-pricing/create', [
            'inventoryItems' => $inventoryItems,
        ]);
    }

    /**
     * Store a newly created recipe
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'reference_width_cm' => 'nullable|numeric|min:0',
            'reference_height_cm' => 'nullable|numeric|min:0',
            'reference_price' => 'nullable|numeric|min:0',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'profit_margin_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'boolean',
            'items' => 'array',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.calculation_type' => 'required|in:per_sqcm,per_rug,fixed_amount',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.notes' => 'nullable|string',
        ]);

        $recipeData = collect($validated)->except('items')->toArray();
        $items = $validated['items'] ?? [];

        $recipe = $this->rugPricingService->createRecipe($recipeData, $items);

        return redirect()->route('admin.rug-pricing.index')
            ->with('success', 'Pricing recipe created successfully');
    }

    /**
     * Show the form for editing a recipe
     */
    public function edit(int $id)
    {
        $recipe = $this->rugPricingService->getRecipeById($id);
        $inventoryItems = $this->rugPricingService->getAvailableInventoryItems();

        if (!$recipe) {
            return redirect()->route('admin.rug-pricing.index')
                ->with('error', 'Recipe not found');
        }

        return Inertia::render('rug-pricing/edit', [
            'recipe' => $recipe,
            'inventoryItems' => $inventoryItems,
        ]);
    }

    /**
     * Update a recipe
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'reference_width_cm' => 'nullable|numeric|min:0',
            'reference_height_cm' => 'nullable|numeric|min:0',
            'reference_price' => 'nullable|numeric|min:0',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'profit_margin_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'boolean',
            'items' => 'array',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.calculation_type' => 'required|in:per_sqcm,per_rug,fixed_amount',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.notes' => 'nullable|string',
        ]);

        $recipeData = collect($validated)->except('items')->toArray();
        $items = $validated['items'] ?? [];

        $updated = $this->rugPricingService->updateRecipe($id, $recipeData, $items);

        if (!$updated) {
            return redirect()->back()->with('error', 'Failed to update recipe');
        }

        return redirect()->route('admin.rug-pricing.index')
            ->with('success', 'Pricing recipe updated successfully');
    }

    /**
     * Delete a recipe
     */
    public function destroy(int $id)
    {
        $deleted = $this->rugPricingService->deleteRecipe($id);

        if (!$deleted) {
            return redirect()->back()->with('error', 'Failed to delete recipe');
        }

        return redirect()->route('admin.rug-pricing.index')
            ->with('success', 'Pricing recipe deleted successfully');
    }

    /**
     * Calculate price for given dimensions
     */
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'recipe_id' => 'required|exists:rug_pricing_recipes,id',
            'width_cm' => 'required|numeric|min:1',
            'height_cm' => 'required|numeric|min:1',
            'profit_margin_percentage' => 'nullable|numeric|min:0',
        ]);

        try {
            $result = $this->rugPricingService->calculateFinalPrice(
                $validated['recipe_id'],
                $validated['width_cm'],
                $validated['height_cm'],
                $validated['profit_margin_percentage'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get unit price analysis from reference data
     */
    public function analyzeReference(int $id)
    {
        try {
            $analysis = $this->rugPricingService->calculateUnitPriceFromReference($id);

            return response()->json([
                'success' => true,
                'data' => $analysis,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Show the calculator page
     */
    public function calculator()
    {
        $recipes = $this->rugPricingService->getActiveRecipes();

        return Inertia::render('rug-pricing/calculator', [
            'recipes' => $recipes,
        ]);
    }

    /**
     * Get all recipes as JSON (for API calls)
     */
    public function getRecipes()
    {
        $recipes = $this->rugPricingService->getAllRecipes();

        return response()->json([
            'success' => true,
            'data' => $recipes,
        ]);
    }
}
