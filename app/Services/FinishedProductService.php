<?php

namespace App\Services;

use App\Models\FinishedProduct;
use App\Models\ProductionJob;
use App\Repositories\Contracts\FinishedProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FinishedProductService
{
    public function __construct(
        protected FinishedProductRepositoryInterface $finishedProductRepository,
    ) {}

    /**
     * Get finished products
     */
    public function getProducts(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->finishedProductRepository->getWithRelations($filters, $perPage);
    }

    /**
     * Create finished product from production job
     */
    public function createFromProductionJob(ProductionJob $job, array $data): FinishedProduct
    {
        return DB::transaction(function () use ($job, $data) {
            $orderItem = $job->orderItem;
            $order = $orderItem?->order;

            // Handle primary image upload
            $primaryImagePath = null;
            if (isset($data['primary_image']) && is_file($data['primary_image'])) {
                $primaryImagePath = $data['primary_image']->store('finished-products', 'public');
            }

            $productData = [
                'production_job_id' => $job->id,
                'order_id' => $order?->id,
                'order_item_id' => $orderItem?->id,
                'client_id' => $order?->client_id,
                'product_name' => $data['product_name'] ?? $orderItem?->description,
                'description' => $data['description'] ?? null,
                'length' => $data['length'] ?? $orderItem?->height,
                'width' => $data['width'] ?? $orderItem?->width,
                'unit' => $data['unit'] ?? 'cm',
                'quality_status' => $data['quality_status'] ?? 'PASSED',
                'quality_notes' => $data['quality_notes'] ?? null,
                'quality_checked_by' => auth()->id(),
                'quality_checked_at' => now(),
                'storage_location' => $data['storage_location'] ?? null,
                'status' => $data['status'] ?? 'IN_STOCK',
                'cost_price' => $data['cost_price'] ?? $job->actual_material_cost,
                'selling_price' => $data['selling_price'] ?? $orderItem?->price_per_item,
                'primary_image' => $primaryImagePath,
                'notes' => $data['notes'] ?? null,
                'is_published' => $data['is_published'] ?? false,
                'published_at' => ($data['is_published'] ?? false) ? now() : null,
            ];

            $product = $this->finishedProductRepository->create($productData);

            // Handle additional images upload if provided
            if (isset($data['images']) && is_array($data['images'])) {
                $this->handleAdditionalImageUploads($product, $data['images']);
            }

            return $product->fresh(['productionJob', 'order', 'client']);
        });
    }

    /**
     * Create finished product without production job
     */
    public function createStandalone(array $data): FinishedProduct
    {
        return DB::transaction(function () use ($data) {
            // Handle primary image upload
            $primaryImagePath = null;
            if (isset($data['primary_image']) && is_file($data['primary_image'])) {
                $primaryImagePath = $data['primary_image']->store('finished-products', 'public');
            }

            $productData = [
                'product_name' => $data['product_name'],
                'description' => $data['description'] ?? null,
                'quality_status' => $data['quality_status'],
                'quality_notes' => $data['quality_notes'] ?? null,
                'quality_checked_by' => auth()->id(),
                'quality_checked_at' => now(),
                'storage_location' => $data['storage_location'] ?? null,
                'status' => $data['status'],
                'primary_image' => $primaryImagePath,
                'notes' => $data['notes'] ?? null,
                'is_published' => $data['is_published'] ?? false,
                'published_at' => ($data['is_published'] ?? false) ? now() : null,
            ];

            $product = $this->finishedProductRepository->create($productData);

            // Handle additional images upload if provided
            if (isset($data['additional_images']) && is_array($data['additional_images'])) {
                $this->handleAdditionalImageUploads($product, $data['additional_images']);
            }

            return $product->fresh();
        });
    }

    /**
     * Update finished product
     */
    public function update(int $id, array $data): FinishedProduct
    {
        return DB::transaction(function () use ($id, $data) {
            $product = $this->finishedProductRepository->findOrFail($id);

            // Handle primary image deletion
            if (isset($data['delete_primary_image']) && $data['delete_primary_image']) {
                if ($product->getRawOriginal('primary_image')) {
                    Storage::disk('public')->delete($product->getRawOriginal('primary_image'));
                }
                $primaryImagePath = null;
            } else {
                $primaryImagePath = $product->getRawOriginal('primary_image');
            }

            // Handle primary image upload if provided
            if (isset($data['primary_image']) && is_file($data['primary_image'])) {
                // Delete old primary image
                if ($product->getRawOriginal('primary_image')) {
                    Storage::disk('public')->delete($product->getRawOriginal('primary_image'));
                }
                $primaryImagePath = $data['primary_image']->store('finished-products', 'public');
            }

            $updateData = [
                'product_name' => $data['product_name'] ?? $product->product_name,
                'description' => $data['description'] ?? $product->description,
                'quality_status' => $data['quality_status'] ?? $product->quality_status,
                'quality_notes' => $data['quality_notes'] ?? $product->quality_notes,
                'storage_location' => $data['storage_location'] ?? $product->storage_location,
                'status' => $data['status'] ?? $product->status,
                'notes' => $data['notes'] ?? $product->notes,
                'primary_image' => $primaryImagePath,
                'is_published' => $data['is_published'] ?? $product->is_published,
            ];

            // Update published_at if publishing for the first time
            if (isset($data['is_published']) && $data['is_published'] && !$product->is_published) {
                $updateData['published_at'] = now();
            }

            $product = $this->finishedProductRepository->update($id, $updateData);

            // Handle additional images
            $this->handleAdditionalImagesUpdate($product, $data);

            return $product->fresh(['productionJob', 'order', 'client']);
        });
    }

    /**
     * Publish product to client portal
     */
    public function publish(int $id): FinishedProduct
    {
        return $this->finishedProductRepository->update($id, [
            'is_published' => true,
            'published_at' => now(),
        ]);
    }

    /**
     * Unpublish product
     */
    public function unpublish(int $id): FinishedProduct
    {
        return $this->finishedProductRepository->update($id, [
            'is_published' => false,
        ]);
    }

    /**
     * Get client products
     */
    public function getClientProducts(int $clientId, array $filters = [])
    {
        return $this->finishedProductRepository->getByClient($clientId, $filters);
    }

    /**
     * Get published products
     */
    public function getPublishedProducts(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->finishedProductRepository->getPublished($filters, $perPage);
    }

    /**
     * Handle additional image uploads (not primary)
     */
    protected function handleAdditionalImageUploads(FinishedProduct $product, array $images): void
    {
        $uploadedImages = [];
        
        foreach ($images as $image) {
            if (is_file($image)) {
                $path = $image->store('finished-products', 'public');
                $uploadedImages[] = $path;
            }
        }

        if (!empty($uploadedImages)) {
            $existingImages = $product->getRawOriginal('images') 
                ? json_decode($product->getRawOriginal('images'), true) 
                : [];
            $product->update([
                'images' => array_merge($existingImages, $uploadedImages),
            ]);
        }
    }

    /**
     * Handle additional images update (with deletion support)
     */
    protected function handleAdditionalImagesUpdate(FinishedProduct $product, array $data): void
    {
        // Get the raw images from database (JSON string)
        $currentImages = $product->getRawOriginal('images') 
            ? json_decode($product->getRawOriginal('images'), true) 
            : [];
        
        // Get existing images that should be kept (sent from frontend)
        $existingImagesToKeep = isset($data['existing_images']) && is_array($data['existing_images'])
            ? $data['existing_images']
            : [];
        
        // Extract path from full URLs for comparison
        $pathsToKeep = array_map(function($url) {
            // Extract the path after /storage/
            if (preg_match('/\/storage\/(.+)$/', $url, $matches)) {
                return $matches[1];
            }
            return $url;
        }, $existingImagesToKeep);
        
        // Delete images that were removed
        foreach ($currentImages as $imagePath) {
            if (!in_array($imagePath, $pathsToKeep)) {
                Storage::disk('public')->delete($imagePath);
            }
        }
        
        // Filter current images to only keep the ones still needed
        $remainingImages = array_filter($currentImages, function($imagePath) use ($pathsToKeep) {
            return in_array($imagePath, $pathsToKeep);
        });
        
        // Upload new images
        $newImages = [];
        if (isset($data['new_images']) && is_array($data['new_images'])) {
            foreach ($data['new_images'] as $image) {
                if (is_file($image)) {
                    $path = $image->store('finished-products', 'public');
                    $newImages[] = $path;
                }
            }
        }
        
        // Combine remaining images with new images
        $allImages = array_merge(array_values($remainingImages), $newImages);
        
        // Update product with new image list
        $product->update([
            'images' => $allImages,
        ]);
    }

    /**
     * Handle image uploads (legacy method kept for backward compatibility)
     */
    protected function handleImageUploads(FinishedProduct $product, array $images): void
    {
        $uploadedImages = [];
        
        foreach ($images as $index => $image) {
            if (is_file($image)) {
                $path = $image->store('finished-products', 'public');
                $uploadedImages[] = $path;
                
                // Set first image as primary
                if ($index === 0 && !$product->primary_image) {
                    $product->update(['primary_image' => $path]);
                }
            }
        }

        if (!empty($uploadedImages)) {
            $existingImages = $product->images ?? [];
            $product->update([
                'images' => array_merge($existingImages, $uploadedImages),
            ]);
        }
    }

    /**
     * Delete product
     */
    public function delete(int $id): bool
    {
        $product = $this->finishedProductRepository->findOrFail($id);
        
        // Delete associated images
        if ($product->images) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        return $this->finishedProductRepository->delete($id);
    }
}
