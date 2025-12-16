<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    /**
     * Display a listing of inventory items
     */
    public function index(Request $request)
    {
        $filters = [
            'type' => $request->input('type'),
            'search' => $request->input('search'),
        ];

        $items = $this->inventoryService->getAll($filters, $request->input('per_page', 15));

        // Return JSON for AJAX requests (but not Inertia requests)
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && !$request->header('X-Inertia')) {
            return response()->json($items);
        }

        // Return Inertia response for page loads
        return Inertia::render('admin/inventory/index', [
            'items' => $items,
            'filters' => $filters,
        ]);
    }

    /**
     * Store a newly created inventory item
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'type' => 'required|in:yarn,tufting_cloth,backing_cloth,carpet_tile_vinyl,backing_glue,glue_stick,accessory',
            'unit' => 'required|string|max:50',
            'reorder_point' => 'nullable|numeric|min:0',
            'average_cost' => 'nullable|numeric|min:0',
            'current_stock' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        // Map average_cost to unit_cost for database
        if (isset($validated['average_cost'])) {
            $validated['unit_cost'] = $validated['average_cost'];
            unset($validated['average_cost']);
        }

        try {
            $item = $this->inventoryService->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Inventory item created successfully.',
                'data' => $item,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified inventory item
     */
    public function show(int $id)
    {
        try {
            $item = $this->inventoryService->getAll(['id' => $id])->first();

            return response()->json([
                'success' => true,
                'data' => $item,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified inventory item
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:yarn,tufting_cloth,backing_cloth,carpet_tile_vinyl,backing_glue,glue_stick,accessory',
            'unit' => 'sometimes|required|string|max:50',
            'reorder_point' => 'nullable|numeric|min:0',
            'average_cost' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'current_stock' => 'nullable|numeric|min:0',
            
        ]);

        // Map average_cost to unit_cost for database
        if (isset($validated['average_cost'])) {
            $validated['unit_cost'] = $validated['average_cost'];
            unset($validated['average_cost']);
        }

        try {
            $item = $this->inventoryService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Inventory item updated successfully.',
                'data' => $item,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Adjust stock level
     */
    public function adjustStock(Request $request, int $id)
    {
        $validated = $request->validate([
            'quantity_change' => 'required|numeric',
            'reason' => 'required|in:MANUAL_ADJUSTMENT,DAMAGE,RETURN',
            'notes' => 'nullable|string',
        ]);

        try {
            $transaction = $this->inventoryService->adjustStock(
                $id,
                $validated['quantity_change'],
                $validated['reason'],
                $validated['notes'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Stock adjusted successfully.',
                'data' => $transaction,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get items needing reorder
     */
    public function needsReorder()
    {
        $items = $this->inventoryService->getItemsNeedingReorder();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Remove the specified inventory item
     */
    public function destroy(int $id)
    {
        try {
            $this->inventoryService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Inventory item deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
