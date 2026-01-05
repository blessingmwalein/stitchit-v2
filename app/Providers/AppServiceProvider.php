<?php

namespace App\Providers;

use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use App\Repositories\Contracts\FinishedProductRepositoryInterface;
use App\Repositories\Eloquent\AccountRepository;
use App\Repositories\Eloquent\ExpenseRepository;
use App\Repositories\Eloquent\FinishedProductRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register repositories
        $this->app->bind(AccountRepositoryInterface::class, AccountRepository::class);
        $this->app->bind(ExpenseRepositoryInterface::class, ExpenseRepository::class);
        $this->app->bind(FinishedProductRepositoryInterface::class, FinishedProductRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
