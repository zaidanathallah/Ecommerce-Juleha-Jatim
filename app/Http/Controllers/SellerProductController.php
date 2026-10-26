<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Services\ImageUploadService;
use App\Services\PricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SellerProductController extends Controller
{
    public function __construct(
        protected PricingService $pricingService,
        protected ImageUploadService $imageService
    ) {}

    /**
     * Daftar produk yang dijual oleh user saat ini
     */
    public function index(): Response
    {
        $user = Auth::user();

        $products = Product::with(['category'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(15)
            ->through(fn ($p) => $this->pricingService->formatForManagement($p, $user));

        return Inertia::render('Seller/Products/Index', [
            'products' => $products,
            'categories' => Category::latest()->get(['id', 'name', 'slug', 'description', 'icon', 'is_active']),
        ]);
    }

    /**
     * Form tambah produk baru
     */
    public function create(): Response
    {
        $categories = Category::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Seller/Products/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Simpan produk baru
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string', 'min:20', 'max:5000'],
            'base_price' => ['required', 'numeric', 'min:1000'],
            'stock' => ['required', 'integer', 'min:1'],
            'weight_gram' => ['required', 'integer', 'min:50'],
            'length_cm' => ['nullable', 'integer', 'min:1'],
            'width_cm' => ['nullable', 'integer', 'min:1'],
            'height_cm' => ['nullable', 'integer', 'min:1'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = $this->imageService->uploadAndCompress($request->file('image'), 'product_images');
        }

        $baseSlug = Str::slug($validated['title']);
        $uniqueSlug = $baseSlug . '-' . Str::lower(Str::random(6));

        Product::create([
            'user_id' => $user->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'slug' => $uniqueSlug,
            'description' => strip_tags($validated['description'], '<p><br><b><strong><i><ul><ol><li>'),
            'image_url' => $imageUrl,
            'weight_gram' => $validated['weight_gram'],
            'length_cm' => $validated['length_cm'] ?? 10,
            'width_cm' => $validated['width_cm'] ?? 10,
            'height_cm' => $validated['height_cm'] ?? 10,
            'base_price' => $validated['base_price'],
            'ekop_margin' => 0.00,
            'super_margin' => 0.00,
            'final_price' => $validated['base_price'],
            'stock' => $validated['stock'],
            'region_code' => $user->region_code,
            'region_name' => $user->region_name,
            'status' => Product::STATUS_PENDING,
        ]);

        return redirect()->route('seller.products.index')
            ->with('success', 'Produk berhasil diupload dan menunggu persetujuan dari Admin Ekop wilayah Anda.');
    }

    /**
     * Form edit produk
     */
    public function edit(Product $product): Response
    {
        $user = Auth::user();

        if ($product->user_id !== $user->id && !$user->isSuperAdmin()) {
            abort(403, 'Anda tidak berhak mengedit produk ini.');
        }

        $categories = Category::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Seller/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update produk.
     * Aturan SRS: Jika penjual mengedit harga atau foto produk yang sudah LIVE,
     * status otomatis kembali ke 'pending' (butuh re-ACC admin).
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $user = Auth::user();

        if ($product->user_id !== $user->id && !$user->isSuperAdmin()) {
            abort(403, 'Anda tidak berhak mengubah produk ini.');
        }

        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string', 'min:20', 'max:5000'],
            'base_price' => ['required', 'numeric', 'min:1000'],
            'stock' => ['required', 'integer', 'min:0'],
            'weight_gram' => ['required', 'integer', 'min:50'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $priceChanged = (float) $product->base_price !== (float) $validated['base_price'];
        $hasNewImage = $request->hasFile('image');

        if ($hasNewImage) {
            $product->image_url = $this->imageService->uploadAndCompress($request->file('image'), 'product_images');
        }

        $product->category_id = $validated['category_id'];
        $product->title = $validated['title'];
        $product->description = strip_tags($validated['description'], '<p><br><b><strong><i><ul><ol><li>');
        $product->base_price = $validated['base_price'];
        $product->stock = $validated['stock'];
        $product->weight_gram = $validated['weight_gram'];

        // Core Directive & SRS: Kembalikan ke pending jika Live dan terjadi perubahan sensitif (harga/gambar)
        if ($product->status === Product::STATUS_LIVE && ($priceChanged || $hasNewImage)) {
            $product->status = Product::STATUS_PENDING;
            $product->rejection_reason = null;
            $product->ekop_margin = 0.00;
            $product->super_margin = 0.00;
            $message = 'Produk berhasil diperbarui. Karena ada perubahan harga/foto, status dikembalikan ke PENDING untuk re-verifikasi admin.';
        } else {
            $message = 'Produk berhasil diperbarui.';
        }

        $product->save();

        return redirect()->route('seller.products.index')->with('success', $message);
    }

    /**
     * Tambah Kategori Baru oleh Penjual (Jual Produk Apa Saja)
     */
    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:categories,name'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $slug = Str::slug($validated['name']);
        if (Category::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::lower(Str::random(4));
        }

        Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? "Kategori produk {$validated['name']} di Juleha Jatim",
            'icon' => 'Tag',
            'is_active' => true,
        ]);

        return back()->with('success', "Kategori '{$validated['name']}' berhasil ditambahkan dan siap digunakan!");
    }
}
