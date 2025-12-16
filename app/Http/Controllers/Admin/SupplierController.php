<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers
     */
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->latest()->paginate($request->input('per_page', 15));

        // Return JSON for AJAX requests
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && !$request->header('X-Inertia')) {
            return response()->json($suppliers);
        }

        return Inertia::render('admin/suppliers/index', [
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Store a newly created supplier
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $supplier = Supplier::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Supplier created successfully.',
                'data' => $supplier,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified supplier
     */
    public function show(int $id)
    {
        try {
            $supplier = Supplier::with('purchaseOrders')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $supplier,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Supplier not found',
            ], 404);
        }
    }

    /**
     * Update the specified supplier
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $supplier = Supplier::findOrFail($id);
            $supplier->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Supplier updated successfully.',
                'data' => $supplier,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified supplier
     */
    public function destroy(int $id)
    {
        try {
            $supplier = Supplier::findOrFail($id);
            
            // Check if supplier has purchase orders
            if ($supplier->purchaseOrders()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete supplier with existing purchase orders.',
                ], 422);
            }

            $supplier->delete();

            return response()->json([
                'success' => true,
                'message' => 'Supplier deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
