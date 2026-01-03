<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\ProductionJob;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with real-time statistics
     */
    public function index(): Response
    {
        // Get counts
        $totalClients = Client::count();
        $activeOrders = Order::whereIn('state', ['draft', 'confirmed', 'in_production'])->count();
        $inProduction = ProductionJob::whereIn('state', ['pending', 'in_progress'])->count();
        $lowStockItems = InventoryItem::where('is_active', true)
            ->whereRaw('current_stock <= reorder_point')
            ->count();

        // Get recent activity
        $recentOrders = Order::with('client')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'reference' => $order->reference,
                    'client_name' => $order->client?->display_name ?? 'Unknown',
                    'state' => $order->state,
                    'total_amount' => $order->total_amount,
                    'created_at' => $order->created_at->diffForHumans(),
                ];
            });

        $recentProduction = ProductionJob::with('orderItem.order.client')
            ->whereIn('state', ['pending', 'in_progress'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'reference' => $job->reference,
                    'client_name' => $job->orderItem?->order?->client?->display_name ?? 'Unknown',
                    'state' => $job->state,
                    'progress' => $this->calculateJobProgress($job),
                ];
            });

        // Low stock items
        $lowStock = InventoryItem::where('is_active', true)
            ->whereRaw('current_stock <= reorder_point')
            ->orderBy('current_stock', 'asc')
            ->take(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'current_stock' => $item->current_stock,
                    'reorder_point' => $item->reorder_point,
                    'unit' => $item->unit,
                ];
            });

        // Calculate trends (compare with last month)
        $lastMonthClients = Client::whereMonth('created_at', now()->subMonth()->month)->count();
        $clientTrend = $lastMonthClients > 0 
            ? round((($totalClients - $lastMonthClients) / $lastMonthClients) * 100, 1)
            : 0;

        $lastMonthOrders = Order::whereMonth('created_at', now()->subMonth()->month)->count();
        $orderTrend = $lastMonthOrders > 0
            ? round((($activeOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
            : 0;

        return Inertia::render('dashboard', [
            'stats' => [
                'total_clients' => $totalClients,
                'active_orders' => $activeOrders,
                'in_production' => $inProduction,
                'low_stock_items' => $lowStockItems,
                'client_trend' => $clientTrend,
                'order_trend' => $orderTrend,
            ],
            'recent_orders' => $recentOrders,
            'recent_production' => $recentProduction,
            'low_stock' => $lowStock,
        ]);
    }

    /**
     * Calculate job progress percentage
     */
    private function calculateJobProgress(ProductionJob $job): int
    {
        if ($job->state === 'completed') {
            return 100;
        }

        if ($job->state === 'pending') {
            return 0;
        }

        // If in progress, calculate based on time or material consumption
        if ($job->actual_start_at && $job->planned_end_at) {
            $totalDuration = $job->actual_start_at->diffInMinutes($job->planned_end_at);
            $elapsed = $job->actual_start_at->diffInMinutes(now());
            
            if ($totalDuration > 0) {
                return min(95, round(($elapsed / $totalDuration) * 100));
            }
        }

        // Default progress for in_progress state
        return 50;
    }
}
