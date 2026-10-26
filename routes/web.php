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
    });

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
});

// 4. Super Admin (Provinsi Jatim)
Route::prefix('superadmin')->name('superadmin.')->middleware(['auth', 'role:super_admin'])->group(function () {
    Route::get('/dashboard', [SuperAdminController::class, 'dashboard'])->name('dashboard');
    Route::post('/products/{product}/publish', [SuperAdminController::class, 'publish'])->name('products.publish');
    Route::post('/products/{product}/reject', [SuperAdminController::class, 'reject'])->name('products.reject');
});

require __DIR__.'/auth.php';
