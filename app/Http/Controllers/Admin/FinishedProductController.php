<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FinishedProduct;
use App\Services\FinishedProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinishedProductController extends Controller
{
    public function __construct(
        protected FinishedProductService $finishedProductService
    ) {}

    /**
     * Display a listing of finished products
     */
    public function index(Request $request): Response|JsonResponse
    {
        $filters = [
            'status' => $request->input('status'),
            'quality_status' => $request->input('quality_status'),
            'client_id' => $request->input('client_id'),
            'is_published' => $request->input('is_published'),
            'use_case' => $request->input('use_case'),
            'search' => $request->input('search'),
        ];

        $products = $this->finishedProductService->getProducts($filters, 15);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'data' => $products,
            ]);
        }

        return Inertia::render('Admin/FinishedProducts/Index', [
            'products' => $products,
            'filters' => $filters,
        ]);
    }

    /**
     * Create finished product from production job
     */
    public function storeFromJob(Request $request, int $jobId): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quality_status' => ['required', 'in:PASSED,FAILED,NEEDS_REWORK'],
            'quality_notes' => ['nullable', 'string'],
            'storage_location' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:IN_STOCK,RESERVED,DELIVERED,SOLD'],
            'notes' => ['nullable', 'string'],
            'primary_image' => ['required', 'image', 'max:5120'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['image', 'max:5120'],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        $job = \App\Models\ProductionJob::findOrFail($jobId);
        
        $product = $this->finishedProductService->createFromProductionJob($job, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Finished product created successfully',
            'data' => $product->load(['productionJob', 'order', 'client']),
        ], 201);
    }

    /**
     * Create standalone finished product (for existing products)
     */
    public function storeStandalone(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quality_status' => ['required', 'in:PASSED,FAILED,NEEDS_REWORK'],
            'quality_notes' => ['nullable', 'string'],
            'storage_location' => ['nullable', 'string'],
            'status' => ['required', 'in:IN_STOCK,RESERVED,DELIVERED,SOLD'],
            'use_case' => ['nullable', 'in:Modern,Corporate,Home,Hotel,School'],
            'notes' => ['nullable', 'string'],
            'primary_image' => ['required', 'image', 'max:5120'],
            'additional_images' => ['sometimes', 'array', 'max:5'],
            'additional_images.*' => ['image', 'max:5120'],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        $product = $this->finishedProductService->createStandalone($validated);

        return response()->json([
            'success' => true,
            'message' => 'Finished product created successfully',
            'data' => $product,
        ], 201);
    }

    /**
     * Show a single finished product
     */
    public function show(int $id): JsonResponse
    {
        $product = FinishedProduct::with(['productionJob', 'order.client', 'client'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Update finished product
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quality_status' => ['required', 'in:PASSED,FAILED,NEEDS_REWORK'],
            'quality_notes' => ['nullable', 'string'],
            'storage_location' => ['nullable', 'string'],
            'status' => ['required', 'in:IN_STOCK,RESERVED,DELIVERED,SOLD'],
            'notes' => ['nullable', 'string'],
            'primary_image' => ['sometimes', 'image', 'max:5120'],
            'delete_primary_image' => ['sometimes', 'boolean'],
            'existing_images' => ['sometimes', 'array'],
            'existing_images.*' => ['string'],
            'new_images' => ['sometimes', 'array'],
            'new_images.*' => ['image', 'max:5120'],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        $product = $this->finishedProductService->update($id, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Finished product updated successfully',
            'data' => $product->load(['productionJob', 'order', 'client']),
        ]);
    }

    /**
     * Publish product to client portal
     */
    public function publish(int $id): JsonResponse
    {
        $product = $this->finishedProductService->publish($id);

        return response()->json([
            'success' => true,
            'message' => 'Product published successfully',
            'data' => $product,
        ]);
    }

    /**
     * Unpublish product
     */
    public function unpublish(int $id): JsonResponse
    {
        $product = $this->finishedProductService->unpublish($id);

        return response()->json([
            'success' => true,
            'message' => 'Product unpublished successfully',
            'data' => $product,
        ]);
    }
}
