<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ClientService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function __construct(
        protected ClientService $clientService
    ) {}

    /**
     * Display a listing of clients
     */
    public function index(Request $request)
    {
        $filters = [
            'search' => $request->input('search'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'name' => $request->input('name'),
        ];

        $clients = $this->clientService->getAllPaginated($request->input('per_page', 15), $filters);

        // Return JSON for AJAX requests (but not Inertia requests)
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && !$request->header('X-Inertia')) {
            return response()->json($clients);
        }

        // Return Inertia response for page loads
        return Inertia::render('admin/clients/index', [
            'clients' => $clients,
            'filters' => $filters,
        ]);
    }

    /**
     * Store a newly created client
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:255',
            'full_name' => 'nullable|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:male,female,other',
            'notes' => 'nullable|string',
        ]);

        try {
            $client = $this->clientService->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Client created successfully.',
                'data' => $client,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified client
     */
    public function show(int $id)
    {
        try {
            $client = $this->clientService->getWithStatistics($id);

            return response()->json([
                'success' => true,
                'data' => $client,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified client
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'phone' => 'sometimes|required|string|max:255',
            'full_name' => 'nullable|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:male,female,other',
            'notes' => 'nullable|string',
        ]);

        try {
            $client = $this->clientService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Client updated successfully.',
                'data' => $client,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified client
     */
    public function destroy(int $id)
    {
        try {
            $this->clientService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Client deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Search clients
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $clients = $this->clientService->search($query);

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }
}
