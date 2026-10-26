<?php

use App\Http\Controllers\AdminEkopController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SellerProductController;
use App\Http\Controllers\SuperAdminController;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Public Marketplace & Product Detail
Route::get('/', [MarketplaceController::class, 'index'])->name('home');
Route::get('/products/{slug}', [MarketplaceController::class, 'show'])->name('products.show');

Route::get('/sitemap.xml', function () {
    $products = Product::live()->latest()->get(['slug', 'updated_at']);

    $xml = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    $xml .= '<url><loc>' . url('/') . '</loc><changefreq>daily</changefreq><priority>1.0</priority></url>';

    foreach ($products as $product) {
        $xml .= '<url>';
        $xml .= '<loc>' . url("/products/{$product->slug}") . '</loc>';
        $xml .= '<lastmod>' . ($product->updated_at ? $product->updated_at->toAtomString() : date('Y-m-d')) . '</lastmod>';
        $xml .= '<changefreq>weekly</changefreq>';
        $xml .= '<priority>0.8</priority>';
        $xml .= '</url>';
    }

    $xml .= '</urlset>';

    return response($xml, 200)->header('Content-Type', 'application/xml');
});

// 2. Member Dashboard (Role: User / Anggota)
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        $user = Auth::user();

        // Redirect admin users to their specialized control centers
        if ($user->isSuperAdmin()) {
            return redirect()->route('superadmin.dashboard');
        }
        if ($user->isAdminEkop()) {
            return redirect()->route('ekop.dashboard');
        }

        // Regular Juleha Member stats
        $sellingProducts = Product::where('user_id', $user->id)->get();

        return Inertia::render('Dashboard', [
            'myProductsCount' => $sellingProducts->count(),
            'myLiveCount' => $sellingProducts->where('status', Product::STATUS_LIVE)->count(),
            'myPendingCount' => $sellingProducts->where('status', Product::STATUS_PENDING)->count(),
            'recentProducts' => $sellingProducts->take(5)->values(),
        ]);
    })->name('dashboard');

    // Seller Product Management (Anggota)
    Route::prefix('seller')->name('seller.')->group(function () {
        Route::get('/products', [SellerProductController::class, 'index'])->name('products.index');
        Route::get('/products/create', [SellerProductController::class, 'create'])->name('products.create');
        Route::post('/products', [SellerProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}/edit', [SellerProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [SellerProductController::class, 'update'])->name('products.update');

        // Seller Shop Settings (Toggles: DOKU PG & Biteship API)
        Route::get('/shop/settings', [\App\Http\Controllers\SellerShopController::class, 'edit'])->name('shop.edit');
        Route::put('/shop/settings', [\App\Http\Controllers\SellerShopController::class, 'update'])->name('shop.update');
    });

    // Dynamic Checkout Engine
    Route::get('/checkout/{slug}', [\App\Http\Controllers\CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout/calculate-shipping', [\App\Http\Controllers\CheckoutController::class, 'calculateShipping'])->name('checkout.calculate-shipping');
    Route::post('/checkout/process', [\App\Http\Controllers\CheckoutController::class, 'process'])->name('checkout.process');
    Route::get('/orders/{order_number}', [\App\Http\Controllers\CheckoutController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order_number}/upload-transfer-receipt', [\App\Http\Controllers\CheckoutController::class, 'uploadTransferReceipt'])->name('orders.upload-transfer-receipt');
    Route::post('/orders/{order_number}/confirm-delivery', [\App\Http\Controllers\CheckoutController::class, 'confirmDelivery'])->name('orders.confirm-delivery');
    Route::post('/orders/{order_number}/confirm-payment', [\App\Http\Controllers\CheckoutController::class, 'confirmPaymentReceived'])->name('orders.confirm-payment');

    // Profile Settings
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// 3. Admin Ekop (Daerah Kab/Kota)
Route::prefix('ekop')->name('ekop.')->middleware(['auth', 'role:admin_ekop,super_admin'])->group(function () {
    Route::get('/dashboard', [AdminEkopController::class, 'dashboard'])->name('dashboard');
    Route::post('/products/{product}/approve', [AdminEkopController::class, 'approve'])->name('products.approve');
    Route::post('/products/{product}/reject', [AdminEkopController::class, 'reject'])->name('products.reject');
    Route::post('/orders/{order}/settle-debt', [AdminEkopController::class, 'settleDebt'])->name('orders.settle-debt');
});

// 4. Super Admin (Provinsi Jatim)
Route::prefix('superadmin')->name('superadmin.')->middleware(['auth', 'role:super_admin'])->group(function () {
    Route::get('/dashboard', [SuperAdminController::class, 'dashboard'])->name('dashboard');
    Route::post('/products/{product}/publish', [SuperAdminController::class, 'publish'])->name('products.publish');
    Route::post('/products/{product}/reject', [SuperAdminController::class, 'reject'])->name('products.reject');
    Route::put('/settings', [SuperAdminController::class, 'updateSettings'])->name('settings.update');
});

// 5. Biteship Sandbox Activation Simulator (UI & API)
Route::get('/biteship/simulation', [\App\Http\Controllers\BiteshipSimulationController::class, 'show'])
    ->middleware(['auth', 'role:super_admin,admin_ekop'])
    ->name('biteship.simulation');
Route::match(['get', 'post'], '/api/biteship-simulate', [\App\Http\Controllers\BiteshipSimulationController::class, 'apiSimulate'])
    ->name('biteship.api-simulate');
Route::match(['get', 'post'], '/api/biteship-simulate-rates', [\App\Http\Controllers\BiteshipSimulationController::class, 'apiSimulateRates'])
    ->name('biteship.api-simulate-rates');

// 6. DOKU Webhook Notification Endpoint (CSRF-exempted)
Route::post('/webhook/doku', [\App\Http\Controllers\DokuWebhookController::class, 'handle'])
    ->name('webhook.doku');

// 7. Al-Qur'an Digital (EQuran API v2)
Route::get('/quran', [\App\Http\Controllers\QuranController::class, 'index'])->name('quran.index');
Route::get('/quran/{nomor}', [\App\Http\Controllers\QuranController::class, 'show'])->name('quran.show');

require __DIR__.'/auth.php';

