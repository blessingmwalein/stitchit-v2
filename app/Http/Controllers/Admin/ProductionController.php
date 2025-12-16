<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductionController extends Controller
{
    public function __construct(
        protected ProductionService $productionService
    ) {}

    /**
     * Display a listing of production jobs
     */
    public function index(Request $request)
    {
        $filters = [
            'state' => $request->input('state'),
            'assigned_to' => $request->input('assigned_to'),
            'search' => $request->input('search'),
        ];

        $jobs = $this->productionService->getJobs($filters, $request->input('per_page', 15));

        // Return JSON for AJAX requests (but not Inertia requests)
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && !$request->header('X-Inertia')) {
            return response()->json($jobs);
        }

        // Return Inertia response for page loads
        return Inertia::render('admin/production/index', [
            'jobs' => $jobs,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new production job
     */
    public function create(Request $request)
    {
        // Get orders that are approved/deposit paid and not yet in production
        $orders = \App\Models\Order::with(['client', 'items'])
            ->whereIn('state', ['APPROVED', 'DEPOSIT_PAID'])
            ->whereDoesntHave('items.productionJob')
            ->get();

        return Inertia::render('admin/production/create', [
            'orders' => $orders,
        ]);
    }

    /**
     * Store a newly created production job
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_item_id' => 'required|exists:order_items,id',
            'planned_start_date' => 'nullable|date',
            'planned_end_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        try {
            $job = $this->productionService->create($validated);

            return redirect()->route('admin.production.index')
                ->with('success', 'Production job created successfully.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified production job
     */
    public function show(int $id)
    {
        try {
            $job = $this->productionService->getJobs(['id' => $id])->first();

            return response()->json([
                'success' => true,
                'data' => $job,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified production job
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'state' => 'nullable|string|in:PLANNED,MATERIALS_ALLOCATED,TUFTING,FINISHING,QUALITY_CHECK,COMPLETED',
            'planned_start_at' => 'nullable|date',
            'planned_end_at' => 'nullable|date',
            'assigned_to' => 'nullable|integer|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        try {
            $job = $this->productionService->update($id, $validated);

            return redirect()->back()->with([
                'success' => true,
                'message' => 'Production job updated successfully.',
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Transition job state
     */
    public function transition(Request $request, int $id)
    {
        $validated = $request->validate([
            'state' => 'required|string',
        ]);

        try {
            $job = $this->productionService->transitionState($id, $validated['state']);

            return response()->json([
                'success' => true,
                'message' => 'Job state updated successfully.',
                'data' => $job,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Allocate materials (BOM) for a job
     */
    public function allocateMaterials(Request $request, int $id)
    {
        $validated = $request->validate([
            'materials' => 'required|array',
            'materials.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'materials.*.planned_quantity' => 'required|numeric|min:0',
        ]);

        try {
            $job = $this->productionService->allocateMaterials($id, $validated['materials']);

            return response()->json([
                'success' => true,
                'message' => 'Materials allocated successfully.',
                'data' => $job,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Record material consumption (add actual material)
     */
    public function recordConsumption(Request $request, int $id)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'consumed_quantity' => 'required|numeric|min:0.01',
            'waste_quantity' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            $consumption = $this->productionService->addActualMaterial($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Material consumption recorded successfully.',
                'data' => $consumption,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update actual material consumption
     */
    public function updateConsumption(Request $request, int $id, int $consumptionId)
    {
        $validated = $request->validate([
            'consumed_quantity' => 'required|numeric|min:0.01',
            'waste_quantity' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            $consumption = $this->productionService->updateActualMaterial($id, $consumptionId, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Material consumption updated successfully.',
                'data' => $consumption,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Delete actual material consumption
     */
    public function deleteConsumption(int $id, int $consumptionId)
    {
        try {
            $this->productionService->deleteActualMaterial($id, $consumptionId);

            return response()->json([
                'success' => true,
                'message' => 'Material consumption deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Assign job to a user
     */
    public function assign(Request $request, int $id)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $job = $this->productionService->assignTo($id, $validated['user_id']);

            return response()->json([
                'success' => true,
                'message' => 'Job assigned successfully.',
                'data' => $job,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified production job
     */
    public function destroy(int $id)
    {
        try {
            $this->productionService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Production job deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
