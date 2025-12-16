<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Display a listing of orders
     */
    public function index(Request $request)
    {
        $filters = [
            'state' => $request->input('state'),
            'client_id' => $request->input('client_id'),
            'search' => $request->input('search'),
            'reference' => $request->input('reference'),
            'client_name' => $request->input('client_name'),
            'client_email' => $request->input('client_email'),
        ];

        $orders = $this->orderService->getOrders($filters, $request->input('per_page', 15));

        // Return JSON for AJAX requests (but not Inertia requests)
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && !$request->header('X-Inertia')) {
            return response()->json($orders);
        }

        // Return Inertia response for page loads
        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $filters,
        ]);
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'state' => 'nullable|string',
            'deposit_percent' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'delivery_address' => 'nullable|string',
            'delivery_contact' => 'nullable|string',
            'preferred_dimensions_unit' => 'nullable|in:cm,m,in,ft',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.width' => 'required|numeric|min:0',
            'items.*.height' => 'required|numeric|min:0',
            'items.*.unit' => 'required|in:cm,m,in,ft',
            'items.*.planned_price' => 'required|numeric|min:0',
            'items.*.design_image' => 'nullable|file|image|max:10240', // max 10MB
        ]);

        try {
            // Handle image uploads for items
            if ($request->has('items')) {
                foreach ($request->file('items', []) as $index => $itemFiles) {
                    if (isset($itemFiles['design_image']) && $itemFiles['design_image'] instanceof \Illuminate\Http\UploadedFile) {
                        $image = $itemFiles['design_image'];
                        $path = $image->store('order-designs', 'public');
                        $validated['items'][$index]['design_image_path'] = $path;
                    }
                }
            }

            $order = $this->orderService->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified order
     */
    public function show(int $id)
    {
        try {
            $order = $this->orderService->getOrders(['id' => $id])->first();

            return response()->json([
                'success' => true,
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified order
     */
    public function update(Request $request, int $id)
    {
        // Get the order first to check its state
        $order = $this->orderService->getOrders(['id' => $id])->first();
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        // Prevent editing orders in production or later stages
        $restrictedStates = ['IN_PRODUCTION', 'READY_FOR_DISPATCH', 'DISPATCHED', 'CLOSED', 'ARCHIVED'];
        if (in_array($order->state, $restrictedStates)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit orders that are in production or later stages.',
            ], 422);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'delivery_address' => 'nullable|string',
            'delivery_contact' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.width' => 'required|numeric|min:0',
            'items.*.height' => 'required|numeric|min:0',
            'items.*.unit' => 'required|in:cm,m,in,ft',
            'items.*.planned_price' => 'required|numeric|min:0',
            'items.*.design_image' => 'nullable|file|image|max:10240', // max 10MB
            'items.*.existing_image_path' => 'nullable|string',
        ]);

        try {
            // Handle image uploads for items
            if ($request->has('items')) {
                foreach ($request->file('items', []) as $index => $itemFiles) {
                    if (isset($itemFiles['design_image']) && $itemFiles['design_image'] instanceof \Illuminate\Http\UploadedFile) {
                        $image = $itemFiles['design_image'];
                        $path = $image->store('order-designs', 'public');
                        $validated['items'][$index]['design_image_path'] = $path;
                    } elseif (isset($validated['items'][$index]['existing_image_path'])) {
                        // Keep existing image if no new image uploaded
                        $validated['items'][$index]['design_image_path'] = $validated['items'][$index]['existing_image_path'];
                        unset($validated['items'][$index]['existing_image_path']);
                    }
                }
            }

            $order = $this->orderService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully.',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Transition order state
     */
    public function transition(Request $request, int $id)
    {
        $validated = $request->validate([
            'state' => 'required|string',
        ]);

        try {
            $order = $this->orderService->transitionState($id, $validated['state']);

            return response()->json([
                'success' => true,
                'message' => 'Order state updated successfully.',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Record a payment for the order
     */
    public function recordPayment(Request $request, int $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'method' => 'required|in:cash,bank_transfer,card,online',
            'type' => 'required|in:deposit,balance,refund',
            'reference' => 'nullable|string',
            'paid_at' => 'nullable|date',
        ]);

        try {
            $payment = $this->orderService->recordPayment($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully.',
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Convert order to production jobs
     */
    public function convertToProduction(int $id)
    {
        try {
            $jobs = $this->orderService->convertToProduction($id);

            return response()->json([
                'success' => true,
                'message' => 'Order converted to production successfully.',
                'data' => $jobs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Download order as PDF
     */
    public function downloadPdf(int $id)
    {
        try {
            $order = $this->orderService->getOrders(['id' => $id])->first();
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }
            
            // Generate PDF
            $pdf = \PDF::loadView('pdfs.order', ['order' => $order]);
            
            return $pdf->download('order-' . $order->reference . '.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified order
     */
    public function destroy(int $id)
    {
        try {
            $this->orderService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
