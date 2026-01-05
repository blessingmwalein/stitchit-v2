<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\FinishedProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FinishedProductController extends Controller
{
    /**
     * Get finished products
     */
    public function index(Request $request): JsonResponse
    {
        // Show all published finished products
        $products = FinishedProduct::where('is_published', true)
            ->with(['order', 'productionJob'])
            ->latest('published_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'reference' => $product->reference,
                    'product_name' => $product->display_name,
                    'description' => $product->description,
                    'dimensions' => $product->dimensions,
                    'length' => $product->length,
                    'width' => $product->width,
                    'unit' => $product->unit,
                    'status' => $product->status,
                    'status_label' => ucwords(str_replace('_', ' ', $product->status)),
                    'quality_status' => $product->quality_status,
                    'primary_image' => $product->primary_image ? Storage::url($product->primary_image) : null,
                    'images' => $product->images ? array_map(fn($img) => Storage::url($img), $product->images) : [],
                    'order_reference' => $product->order?->reference,
                    'published_at' => $product->published_at,
                    'notes' => $product->notes,
                ];
            }),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get single finished product details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        // Show any published finished product
        $product = FinishedProduct::where('is_published', true)
            ->where('id', $id)
            ->with(['order', 'productionJob', 'orderItem'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $product->id,
                'reference' => $product->reference,
                'product_name' => $product->display_name,
                'description' => $product->description,
                'dimensions' => $product->dimensions,
                'length' => $product->length,
                'width' => $product->width,
                'unit' => $product->unit,
                'status' => $product->status,
                'status_label' => ucwords(str_replace('_', ' ', $product->status)),
                'quality_status' => $product->quality_status,
                'quality_notes' => $product->quality_notes,
                'storage_location' => $product->storage_location,
                'primary_image' => $product->primary_image ? Storage::url($product->primary_image) : null,
                'images' => $product->images ? array_map(fn($img) => Storage::url($img), $product->images) : [],
                'order' => $product->order ? [
                    'id' => $product->order->id,
                    'reference' => $product->order->reference,
                    'state' => $product->order->state,
                ] : null,
                'published_at' => $product->published_at,
                'notes' => $product->notes,
            ],
        ]);
    }
}
