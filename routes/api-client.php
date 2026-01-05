<?php

use App\Http\Controllers\Api\Client\AuthController;
use App\Http\Controllers\Api\Client\GoogleAuthController;
use App\Http\Controllers\Api\Client\OrderController;
use App\Http\Controllers\Api\Client\FinishedProductController;
use App\Http\Controllers\Api\ClientRugPricingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Client API Routes
|--------------------------------------------------------------------------
| These routes are for the client-facing mobile app and web portal
*/

// Public auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // Google OAuth routes
    Route::get('/google/redirect', [GoogleAuthController::class, 'redirectToGoogle']);
    Route::get('/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
    Route::post('/google/exchange-session', [GoogleAuthController::class, 'exchangeSession']);
    Route::post('/google/complete-registration', [GoogleAuthController::class, 'completeGoogleRegistration']);
    Route::post('/google/login', [GoogleAuthController::class, 'quickGoogleLogin']);
});

// Public routes (no authentication required)
// Orders
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);

// Finished Products
Route::get('/finished-products', [FinishedProductController::class, 'index']);
Route::get('/finished-products/{id}', [FinishedProductController::class, 'show']);

// Rug Pricing Calculator (for clients to get quotes)
Route::post('/rug-pricing/calculate', [ClientRugPricingController::class, 'calculatePrice']);
Route::get('/rug-pricing/breakdown', [ClientRugPricingController::class, 'getCostBreakdown']);
Route::get('/rug-pricing/recipes', [ClientRugPricingController::class, 'getRecipes']);

// Protected client routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
