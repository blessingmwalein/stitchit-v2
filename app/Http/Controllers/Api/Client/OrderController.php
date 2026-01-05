<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Client\PlaceOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Get orders
     */
    public function index(Request $request): JsonResponse
    {
        // Show all orders
        $orders = Order::with(['items', 'payments'])
            ->withCount('items')
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'reference' => $order->reference,
                    'state' => $order->state,
                    'state_label' => ucwords(str_replace('_', ' ', $order->state)),
                    'total_amount' => $order->total_amount,
                    'paid_amount' => $order->paid_amount,
                    'balance' => $order->balance,
                    'items_count' => $order->items_count,
                    'delivery_address' => $order->delivery_address,
                    'delivery_date' => $order->delivery_date,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'description' => $item->description,
                            'width' => $item->width,
                            'height' => $item->height,
                            'quantity' => $item->quantity,
                            'price_per_item' => $item->price_per_item,
                            'total_price' => $item->total_price,
                            'design_image_url' => $item->design_image_url,
                        ];
                    }),
                ];
            }),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Get single order details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        // Show any order
        $order = Order::where('id', $id)
            ->with(['items', 'payments', 'items.productionJobs'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->id,
                'reference' => $order->reference,
                'state' => $order->state,
                'state_label' => ucwords(str_replace('_', ' ', $order->state)),
                'total_amount' => $order->total_amount,
                'paid_amount' => $order->paid_amount,
                'balance' => $order->balance,
                'delivery_address' => $order->delivery_address,
                'delivery_date' => $order->delivery_date,
                'notes' => $order->notes,
                'created_at' => $order->created_at,
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'description' => $item->description,
                        'width' => $item->width,
                        'height' => $item->height,
                        'quantity' => $item->quantity,
                        'price_per_item' => $item->price_per_item,
                        'total_price' => $item->total_price,
                        'design_image_url' => $item->design_image_url,
                        'production_status' => $item->productionJobs->first()?->state,
                    ];
                }),
                'payments' => $order->payments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'payment_method' => $payment->payment_method,
                        'paid_at' => $payment->paid_at,
                        'notes' => $payment->notes,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Place a new order
     */
    public function store(PlaceOrderRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Create order (client_id will be provided in request or null for guest orders)
            $order = Order::create([
                'client_id' => $request->client_id ?? null,
                'state' => 'DRAFT',
                'delivery_address' => $request->delivery_address,
                'notes' => $request->notes,
            ]);

            $totalAmount = 0;

            // Create order items
            foreach ($request->items as $itemData) {
                $designImageUrl = null;
                
                // Handle image upload if provided
                if (isset($itemData['design_image']) && $itemData['design_image']) {
                    $path = $itemData['design_image']->store('order-designs', 'public');
                    $designImageUrl = Storage::url($path);
                }

                // Use price calculated from frontend (via rug pricing calculator)
                $pricePerItem = $itemData['price_per_item'];
                $totalPrice = $pricePerItem * $itemData['quantity'];
                $totalAmount += $totalPrice;

                OrderItem::create([
                    'order_id' => $order->id,
                    'description' => $itemData['description'],
                    'width' => $itemData['width'],
                    'height' => $itemData['height'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'] ?? 'cm',
                    'price_per_item' => $pricePerItem,
                    'total_price' => $totalPrice,
                    'design_image_url' => $designImageUrl,
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            // Update order total
            $order->update([
                'total_amount' => $totalAmount,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => [
                    'id' => $order->id,
                    'reference' => $order->reference,
                    'total_amount' => $order->total_amount,
                    'state' => $order->state,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
