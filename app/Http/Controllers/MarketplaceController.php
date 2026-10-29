<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Voucher;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    public function __construct(
        protected PricingService $pricingService
    ) {}

    /**
     * Halaman Utama Marketplace Juleha Jatim (Shopee-Style, SEO Advanced, Flash Sale & Vouchers)
     */
    public function index(Request $request): Response
    {
        $selectedCategory = $request->query('category');
        $search = $request->query('search');

        $query = Product::with(['user', 'category'])->live()->latest();

        if (!empty($selectedCategory)) {
            $query->whereHas('category', function ($q) use ($selectedCategory) {
                $q->where('slug', $selectedCategory);
            });
        }

        if (!empty($search)) {
            $cleanSearch = trim($search);
            $query->where(function ($q) use ($cleanSearch) {
                $q->where('title', 'like', "%{$cleanSearch}%")
                  ->orWhere('description', 'like', "%{$cleanSearch}%");
            });
        }

        $rawProducts = $query->paginate(16)->withQueryString();

        $formattedProducts = $rawProducts->through(function ($product) {
            return $this->pricingService->formatForBuyer($product);
        });

        // Flash Sale Products
        $flashSaleProducts = Product::with(['user', 'category'])
            ->where('is_flash_sale', true)
            ->live()
            ->latest()
            ->take(8)
            ->get()
            ->map(fn($p) => $this->pricingService->formatForBuyer($p));

        // Active Vouchers (Gratis Ongkir & Diskon)
        $vouchers = Voucher::active()->latest()->take(6)->get();

        $categories = Category::where('is_active', true)->get(['id', 'name', 'slug', 'icon']);

        // Schema.org Website & Organization Schema for Agentic AI & Google Top Ranking
        $schemaOrgJson = [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => 'Marketplace Juru Sembelih Halal (Juleha) Jawa Timur',
            'url' => url('/'),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => url('/?search={search_term_string}'),
                'query-input' => 'required name=search_term_string',
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'Juru Sembelih Halal (Juleha) Jawa Timur',
                'url' => 'https://julehajatim.com',
                'logo' => url('/logo-juleha.jpg'),
                'address' => [
                    '@type' => 'PostalAddress',
                    'streetAddress' => 'Jl. Simo Gunung Kramat Barat 1/28',
                    'addressLocality' => 'Surabaya',
                    'addressRegion' => 'Jawa Timur',
                    'postalCode' => '60255',
                    'addressCountry' => 'ID',
                ],
                'contactPoint' => [
                    '@type' => 'ContactPoint',
                    'telephone' => '+6281262227663',
                    'contactType' => 'customer service',
                    'areaServed' => 'ID',
                    'availableLanguage' => ['Indonesian'],
                ],
            ],
        ];

        return Inertia::render('Marketplace/Index', [
            'products' => $formattedProducts,
            'flashSaleProducts' => $flashSaleProducts,
            'vouchers' => $vouchers,
            'categories' => $categories,
            'filters' => [
                'category' => $selectedCategory,
                'search' => $search,
            ],
            'schemaJson' => $schemaOrgJson,
        ]);
    }

    /**
     * Halaman Detail Produk Publik (JSON-LD Rich Snippet Schema.org/Product)
     */
    public function show(string $slug): Response
    {
        $product = Product::with(['user', 'category', 'reviews.user'])
            ->where('slug', $slug)
            ->live()
            ->firstOrFail();

        $buyerProduct = $this->pricingService->formatForBuyer($product);

        // Cek status keanggotaan penjual di database pusat
        $sellerIsActive = true;
        if ($product->user && $product->user->isAnggota() && !empty($product->user->juleha_id)) {
            try {
                $central = \App\Models\CentralMember::where('juleha_id', $product->user->juleha_id)->first();
                if ($central && !$central->is_active) {
                    $sellerIsActive = false;
                }
            } catch (\Exception $e) {}
        }

        // Rich Snippets Schema.org/Product for Google No. 1 and AI Agent Search
        $productSchema = [
            '@context' => 'https://schema.org/',
            '@type' => 'Product',
            'name' => $product->title,
            'image' => [$product->image_url],
            'description' => strip_tags($product->description),
            'sku' => "JLH-PRD-{$product->id}",
            'aggregateRating' => $product->reviews_count > 0 ? [
                '@type' => 'AggregateRating',
                'ratingValue' => (string) round((float) $product->rating_avg, 1),
                'reviewCount' => (string) $product->reviews_count,
            ] : null,
            'offers' => [
                '@type' => 'Offer',
                'url' => url("/products/{$product->slug}"),
                'priceCurrency' => 'IDR',
                'price' => (string) ((int) ($product->is_flash_sale && $product->flash_sale_price ? $product->flash_sale_price : $product->final_price)),
                'priceValidUntil' => date('Y-12-31'),
                'itemCondition' => 'https://schema.org/NewCondition',
                'availability' => $product->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                'seller' => [
                    '@type' => 'Organization',
                    'name' => $product->user->name ?? 'Juleha Jatim Partner',
                ],
            ],
            'brand' => [
                '@type' => 'Brand',
                'name' => 'Juleha Official Partner',
            ],
        ];

        return Inertia::render('Marketplace/Show', [
            'product' => $buyerProduct,
            'sellerIsActive' => $sellerIsActive,
            'schemaJson' => $productSchema,
        ]);
    }

    /**
     * Simpan Ulasan dan Rating Bintang Produk
     */
    public function storeReview(Request $request, string $slug)
    {
        $user = Auth::user();
        $product = Product::where('slug', $slug)->live()->firstOrFail();

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        \App\Models\Review::updateOrCreate(
            [
                'user_id' => $user->id,
                'product_id' => $product->id,
            ],
            [
                'rating' => $validated['rating'],
                'comment' => strip_tags($validated['comment']),
                'is_verified_buyer' => true,
            ]
        );

        $product->updateRatingStats();

        return back()->with('success', 'Terima kasih! Ulasan dan rating bintang Anda berhasil disimpan.');
    }

    /**
     * Terapkan Kode Voucher (Gratis Ongkir atau Diskon)
     */
    public function applyVoucher(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'shipping_fee' => ['nullable', 'numeric', 'min:0'],
        ]);

        $code = strtoupper(trim($request->code));
        $voucher = Voucher::where('code', $code)->active()->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => "Kode voucher '{$code}' tidak valid atau telah berakhir.",
            ], 422);
        }

        $subtotal = (float) $request->subtotal;
        $shippingFee = (float) ($request->shipping_fee ?? 0);

        if ($subtotal < (float) $voucher->min_spend) {
            return response()->json([
                'success' => false,
                'message' => "Minimal belanja untuk voucher ini adalah Rp " . number_format($voucher->min_spend, 0, ',', '.'),
            ], 422);
        }

        $discount = $voucher->calculateDiscount($subtotal, $shippingFee);

        return response()->json([
            'success' => true,
            'voucher' => [
                'id' => $voucher->id,
                'code' => $voucher->code,
                'title' => $voucher->title,
                'type' => $voucher->type,
                'discount' => $discount,
            ],
            'message' => "Voucher '{$voucher->title}' berhasil dipasang! Potongan Rp " . number_format($discount, 0, ',', '.'),
        ]);
    }

    /**
     * Buat Voucher Baru (Oleh Penjual, Admin Ekop, atau Super Admin)
     */
    public function storeVoucher(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:vouchers,code'],
            'title' => ['required', 'string', 'max:150'],
            'type' => ['required', 'in:free_shipping,discount_percent,discount_fixed'],
            'discount_amount' => ['required', 'numeric', 'min:1'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ]);

        $scope = $user->isSuperAdmin() ? Voucher::SCOPE_GLOBAL : ($user->isAdminEkop() ? Voucher::SCOPE_REGIONAL : Voucher::SCOPE_SELLER);

        Voucher::create([
            'code' => strtoupper(trim($validated['code'])),
            'title' => $validated['title'],
            'type' => $validated['type'],
            'discount_amount' => $validated['discount_amount'],
            'min_spend' => $validated['min_spend'] ?? 0,
            'max_discount' => $validated['max_discount'] ?? null,
            'scope' => $scope,
            'created_by' => $user->id,
            'expires_at' => $validated['expires_at'] ?? now()->addMonths(1),
            'is_active' => true,
        ]);

        return back()->with('success', "Voucher '{$validated['code']}' berhasil diterbitkan dan aktif!");
    }

    /**
     * Halaman Jadwal Waktu Sholat Realtime & Jam Digital Daerah User
     */
    public function prayerSchedule(Request $request): Response
    {
        return Inertia::render('Islamic/PrayerSchedule');
    }
}
