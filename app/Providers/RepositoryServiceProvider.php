<?php

namespace App\Providers;

use App\Repositories\Contracts\ClientRepositoryInterface;
use App\Repositories\Contracts\InventoryRepositoryInterface;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\ProductionRepositoryInterface;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use App\Repositories\Eloquent\ClientRepository;
use App\Repositories\Eloquent\InventoryRepository;
use App\Repositories\Eloquent\OrderRepository;
use App\Repositories\Eloquent\ProductionRepository;
use App\Repositories\Eloquent\PurchaseRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(ClientRepositoryInterface::class, ClientRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
        $this->app->bind(InventoryRepositoryInterface::class, InventoryRepository::class);
        $this->app->bind(ProductionRepositoryInterface::class, ProductionRepository::class);
        $this->app->bind(PurchaseRepositoryInterface::class, PurchaseRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
