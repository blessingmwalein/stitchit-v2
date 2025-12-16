<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PurchaseService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function __construct(
        protected PurchaseService $purchaseService
    ) {}

    /**
     * Display a listing of purchase orders
     */
    public function index(Request $request)
    {
        $filters = [
            'state' => $request->input('state'),
            'supplier_id' => $request->input('supplier_id'),
            'search' => $request->input('search'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ];

        $purchases = $this->purchaseService->getPurchaseOrders($filters, $request->input('per_page', 15));

        // Return JSON for AJAX requests (but not Inertia requests)
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && !$request->header('X-Inertia')) {
            return response()->json($purchases);
        }

        // Return Inertia response for page loads
        return Inertia::render('admin/purchases/index', [
            'purchases' => $purchases,
            'filters' => $filters,
        ]);
    }

    /**
     * Store a newly created purchase order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'expected_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'lines' => 'required|array|min:1',
            'lines.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'lines.*.quantity_ordered' => 'required|numeric|min:0',
            'lines.*.unit_cost' => 'required|numeric|min:0',
        ]);

        try {
            $po = $this->purchaseService->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Purchase order created successfully.',
                'data' => $po,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified purchase order
     */
    public function show(int $id)
    {
        try {
            $po = $this->purchaseService->findPurchaseOrder($id);

            if (!$po) {
                return response()->json([
                    'success' => false,
                    'message' => 'Purchase order not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $po,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified purchase order
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'expected_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'lines' => 'nullable|array',
        ]);

        try {
            $po = $this->purchaseService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Purchase order updated successfully.',
                'data' => $po,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Send purchase order to supplier (transition to SENT)
     */
    public function send(int $id)
    {
        try {
            $po = $this->purchaseService->sendToSupplier($id);

            return response()->json([
                'success' => true,
                'message' => 'Purchase order sent to supplier.',
                'data' => $po,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Receive goods for a purchase line
     */
    public function receiveGoods(Request $request, int $id)
    {
        $validated = $request->validate([
            'purchase_line_id' => 'required|exists:purchase_lines,id',
            'quantity_received' => 'required|numeric|min:0',
            'lot_number' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        try {
            $stockLot = $this->purchaseService->receiveGoods($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Goods received successfully.',
                'data' => $stockLot,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Close the purchase order
     */
    public function close(int $id)
    {
        try {
            $po = $this->purchaseService->close($id);

            return response()->json([
                'success' => true,
                'message' => 'Purchase order closed.',
                'data' => $po,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified purchase order
     */
    public function destroy(int $id)
    {
        try {
            $this->purchaseService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Purchase order deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
