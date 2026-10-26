<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Memastikan hanya Seller Terdaftar, Admin Ekop, atau Super Admin yang dapat mengelola Kategori.
     */
    protected function authorizeManage(Request $request): void
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'Silakan login terlebih dahulu.');
        }

        $isPrivileged = in_array($user->role, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_EKOP]) 
            || ($user->user_type === 'seller' || $user->is_member);

        if (!$isPrivileged) {
            abort(403, 'Akses Ditolak: Hanya Penjual Anggota Juleha, Admin Ekop, dan Super Admin yang berwenang mengelola kategori produk.');
        }
    }

    /**
     * Ambil daftar kategori produk (JSON API).
     */
    public function index(Request $request): JsonResponse
    {
        $categories = Category::latest()->get();
        return response()->json($categories);
    }

    /**
     * Tambah Kategori Baru (Bisa dilakukan Penjual, Admin Ekop, Super Admin).
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:categories,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $slug = Str::slug($validated['name']);
        if (Category::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::lower(Str::random(4));
        }

        Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? "Kategori produk {$validated['name']} di Marketplace Juleha Jatim",
            'icon' => $validated['icon'] ?: 'Tag',
            'is_active' => true,
        ]);

        return back()->with('success', "Kategori '{$validated['name']}' berhasil ditambahkan dengan ikon {$validated['icon']}!");
    }

    /**
     * Update Kategori Produk (Bisa dilakukan Penjual, Admin Ekop, Super Admin).
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $this->authorizeManage($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:categories,name,' . $category->id],
            'description' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category->name = $validated['name'];
        if ($category->isDirty('name')) {
            $category->slug = Str::slug($validated['name']);
        }
        $category->description = $validated['description'] ?? $category->description;
        if (!empty($validated['icon'])) {
            $category->icon = $validated['icon'];
        }
        if (isset($validated['is_active'])) {
            $category->is_active = (bool) $validated['is_active'];
        }

        $category->save();

        return back()->with('success', "Kategori '{$category->name}' berhasil diperbarui!");
    }

    /**
     * Hapus Kategori Produk (Bisa dilakukan Penjual, Admin Ekop, Super Admin).
     */
    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $this->authorizeManage($request);

        $productCount = $category->products()->count();
        if ($productCount > 0) {
            $category->update(['is_active' => false]);
            return back()->with('info', "Kategori '{$category->name}' memiliki {$productCount} produk terkait, sehingga statusnya dinonaktifkan (archived).");
        }

        $name = $category->name;
        $category->delete();

        return back()->with('success', "Kategori '{$name}' berhasil dihapus secara permanen.");
    }
}
