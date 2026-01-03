<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductionController;
use App\Http\Controllers\Admin\PurchaseController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\JournalEntryController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome-new', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// Admin Routes
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    
    // Clients
    Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
    Route::get('clients/search', [ClientController::class, 'search'])->name('clients.search');
    Route::post('clients', [ClientController::class, 'store'])->name('clients.store');
    Route::get('clients/{id}', [ClientController::class, 'show'])->name('clients.show');
    Route::put('clients/{id}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('clients/{id}', [ClientController::class, 'destroy'])->name('clients.destroy');

    // Orders
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{id}', [OrderController::class, 'show'])->name('orders.show');
    Route::put('orders/{id}', [OrderController::class, 'update'])->name('orders.update');
    Route::delete('orders/{id}', [OrderController::class, 'destroy'])->name('orders.destroy');
    Route::post('orders/{id}/transition', [OrderController::class, 'transition'])->name('orders.transition');
    Route::post('orders/{id}/payment', [OrderController::class, 'recordPayment'])->name('orders.payment');
    Route::post('orders/{id}/convert-to-production', [OrderController::class, 'convertToProduction'])->name('orders.convert');
    Route::get('orders/{id}/download-pdf', [OrderController::class, 'downloadPdf'])->name('orders.pdf');

    // Inventory
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('inventory/needs-reorder', [InventoryController::class, 'needsReorder'])->name('inventory.reorder');
    Route::post('inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::get('inventory/{id}', [InventoryController::class, 'show'])->name('inventory.show');
    Route::put('inventory/{id}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('inventory/{id}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::post('inventory/{id}/adjust', [InventoryController::class, 'adjustStock'])->name('inventory.adjust');

    // Production
    Route::get('production', [ProductionController::class, 'index'])->name('production.index');
    Route::get('production/create', [ProductionController::class, 'create'])->name('production.create');
    Route::post('production', [ProductionController::class, 'store'])->name('production.store');
    Route::get('production/{id}', [ProductionController::class, 'show'])->name('production.show');
    Route::put('production/{id}', [ProductionController::class, 'update'])->name('production.update');
    Route::delete('production/{id}', [ProductionController::class, 'destroy'])->name('production.destroy');
    Route::post('production/{id}/transition', [ProductionController::class, 'transition'])->name('production.transition');
    Route::post('production/{id}/allocate', [ProductionController::class, 'allocateMaterials'])->name('production.allocate');
    Route::post('production/{id}/consume', [ProductionController::class, 'recordConsumption'])->name('production.consume');
    Route::put('production/{id}/consume/{consumptionId}', [ProductionController::class, 'updateConsumption'])->name('production.consume.update');
    Route::delete('production/{id}/consume/{consumptionId}', [ProductionController::class, 'deleteConsumption'])->name('production.consume.delete');
    Route::post('production/{id}/assign', [ProductionController::class, 'assign'])->name('production.assign');

    // Purchases
    Route::get('purchases', [PurchaseController::class, 'index'])->name('purchases.index');
    Route::post('purchases', [PurchaseController::class, 'store'])->name('purchases.store');
    Route::get('purchases/{id}', [PurchaseController::class, 'show'])->name('purchases.show')->where('id', '[0-9]+');
    Route::put('purchases/{id}', [PurchaseController::class, 'update'])->name('purchases.update');
    Route::delete('purchases/{id}', [PurchaseController::class, 'destroy'])->name('purchases.destroy');
    Route::post('purchases/{id}/send', [PurchaseController::class, 'send'])->name('purchases.send');
    Route::post('purchases/{id}/receive', [PurchaseController::class, 'receiveGoods'])->name('purchases.receive');
    Route::post('purchases/{id}/close', [PurchaseController::class, 'close'])->name('purchases.close');

    // Suppliers
    Route::get('suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::post('suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::get('suppliers/{id}', [SupplierController::class, 'show'])->name('suppliers.show');
    Route::put('suppliers/{id}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('suppliers/{id}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

    // Media
    Route::post('media/upload', [MediaController::class, 'upload'])->name('media.upload');
    Route::delete('media/delete', [MediaController::class, 'delete'])->name('media.delete');
    Route::get('media/list', [MediaController::class, 'list'])->name('media.list');

    // Accounting - Chart of Accounts
    Route::get('accounting/accounts', [AccountController::class, 'index'])->name('accounting.accounts.index');
    Route::post('accounting/accounts', [AccountController::class, 'store'])->name('accounting.accounts.store');
    Route::put('accounting/accounts/{id}', [AccountController::class, 'update'])->name('accounting.accounts.update');
    Route::delete('accounting/accounts/{id}', [AccountController::class, 'destroy'])->name('accounting.accounts.destroy');

    // Accounting - Expenses
    Route::get('accounting/expenses', [ExpenseController::class, 'index'])->name('accounting.expenses.index');
    Route::post('accounting/expenses', [ExpenseController::class, 'store'])->name('accounting.expenses.store');
    Route::get('accounting/expenses/{id}', [ExpenseController::class, 'show'])->name('accounting.expenses.show');
    Route::delete('accounting/expenses/{id}', [ExpenseController::class, 'destroy'])->name('accounting.expenses.destroy');

    // Accounting - Journal Entries
    Route::get('accounting/journal-entries', [JournalEntryController::class, 'index'])->name('accounting.journal-entries.index');
    Route::post('accounting/journal-entries', [JournalEntryController::class, 'store'])->name('accounting.journal-entries.store');
    Route::get('accounting/journal-entries/{id}', [JournalEntryController::class, 'show'])->name('accounting.journal-entries.show');
    Route::post('accounting/journal-entries/{id}/post', [JournalEntryController::class, 'post'])->name('accounting.journal-entries.post');
    Route::post('accounting/journal-entries/{id}/void', [JournalEntryController::class, 'void'])->name('accounting.journal-entries.void');

    // Accounting - Reports
    Route::get('accounting/reports/trial-balance', [ReportController::class, 'trialBalance'])->name('accounting.reports.trial-balance');
    Route::get('accounting/reports/income-statement', [ReportController::class, 'incomeStatement'])->name('accounting.reports.income-statement');
    Route::get('accounting/reports/balance-sheet', [ReportController::class, 'balanceSheet'])->name('accounting.reports.balance-sheet');
    Route::get('accounting/reports/manufacturing-account', [ReportController::class, 'manufacturingAccount'])->name('accounting.reports.manufacturing-account');
});

require __DIR__.'/settings.php';
