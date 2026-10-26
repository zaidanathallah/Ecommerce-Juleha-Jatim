<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    public function __construct(
        protected PricingService $pricingService
    ) {}

    /**
     * Halaman Utama Marketplace Juleha Jatim (SEO-friendly, Semantic, Anti-Slop)
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

        $rawProducts = $query->paginate(12)->withQueryString();

        $formattedProducts = $rawProducts->through(function ($product) {
            return $this->pricingService->formatForBuyer($product);
        });

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
            ],
        ];

        return Inertia::render('Marketplace/Index', [
            'products' => $formattedProducts,
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
                'price' => (string) ((int) $product->final_price),
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
}
