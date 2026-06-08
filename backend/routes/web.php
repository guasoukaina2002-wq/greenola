<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GranolaController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| Routes API (préfixe /api)
|--------------------------------------------------------------------------
| Toutes les routes sont préfixées avec /api.
| Certaines sont publiques, d'autres nécessitent l'authentification Sanctum.
*/

Route::prefix('api')->group(function () {

    // ── Routes publiques ──────────────────────────────────────────────────
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // Granolas & ingrédients (lecture publique)
    Route::get('/granolas',            [GranolaController::class, 'index']);
    Route::get('/granolas/{id}',       [GranolaController::class, 'show']);
    Route::get('/ingredients',         [IngredientController::class, 'index']);

    // ── Routes authentifiées (Sanctum) ────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      fn(\Illuminate\Http\Request $r) => response()->json($r->user()));

        // Panier
        Route::get('/cart',          [CartController::class, 'index']);
        Route::post('/cart',         [CartController::class, 'store']);
        Route::put('/cart/{id}',     [CartController::class, 'update']);
        Route::delete('/cart/{id}',  [CartController::class, 'destroy']);
        Route::delete('/cart',       [CartController::class, 'clear']);

        // Commandes (client)
        Route::get('/orders',  [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);

        // ── Admin ─────────────────────────────────────────────────────────
        // Granolas CRUD
        Route::post('/granolas',          [GranolaController::class, 'store']);
        Route::put('/granolas/{id}',      [GranolaController::class, 'update']);
        Route::delete('/granolas/{id}',   [GranolaController::class, 'destroy']);

        // Ingrédients CRUD
        Route::post('/ingredients',         [IngredientController::class, 'store']);
        Route::put('/ingredients/{id}',     [IngredientController::class, 'update']);
        Route::delete('/ingredients/{id}',  [IngredientController::class, 'destroy']);

        // Commandes admin
        Route::get('/admin/orders',              [OrderController::class, 'allOrders']);
        Route::put('/admin/orders/{id}/status',  [OrderController::class, 'updateStatus']);
    });
});

// ── Route de secours (Fallback) API ──────────────────────────────────────
Route::get('/{any?}', function () {
    return response()->json([
        'name' => 'Greenola API',
        'status' => 'running',
        'message' => 'Veuillez utiliser le serveur frontend React pour accéder à l\'application.'
    ]);
})->where('any', '.*');
