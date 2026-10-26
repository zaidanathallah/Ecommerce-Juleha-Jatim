<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;

class PricingService
{
    /**
     * Menghitung Final Price:
     * Final Price = base_price + ekop_margin + super_margin
     */
    public function calculateFinalPrice(float $basePrice, float $ekopMargin = 0, float $superMargin = 0): float
    {
        return round($basePrice + $ekopMargin + $superMargin, 2);
    }

    /**
     * Memformat data produk untuk pembeli publik:
     * Margin internal (base_price, ekop_margin, super_margin) DISEMBUNYIKAN secara ketat dari frontend pembeli.
     */
    public function formatForBuyer(Product $product): array
    {
        return [
            'id' => $product->id,
            'title' => $product->title,
            'slug' => $product->slug,
            'description' => $product->description,
            'image_url' => $product->image_url,
            'gallery' => $product->gallery ?? [],
            'price' => (float) $product->final_price,
            'is_flash_sale' => (bool) $product->is_flash_sale,
            'flash_sale_price' => $product->flash_sale_price ? (float) $product->flash_sale_price : null,
            'flash_sale_discount_percent' => (int) ($product->flash_sale_discount_percent ?? 0),
            'flash_sale_stock' => (int) ($product->flash_sale_stock ?? 0),
            'flash_sale_end' => $product->flash_sale_end?->toIso8601String(),
            'stock' => $product->stock,
            'weight_gram' => $product->weight_gram,
            'region_name' => $product->region_name,
            'region_code' => $product->region_code,
            'rating_avg' => round((float) ($product->rating_avg ?? 5.0), 1),
            'reviews_count' => (int) ($product->reviews_count ?? 0),
            'sold_count' => (int) ($product->sold_count ?? 0),
            'reviews' => $product->relationLoaded('reviews') ? $product->reviews->map(function ($rev) {
                return [
                    'id' => $rev->id,
                    'user_name' => $rev->user->name ?? 'Pembeli Terverifikasi',
                    'rating' => (int) $rev->rating,
                    'comment' => $rev->comment,
                    'is_verified_buyer' => (bool) $rev->is_verified_buyer,
                    'created_at' => $rev->created_at?->diffForHumans() ?? 'Baru saja',
                ];
            })->values()->all() : [],
            'seller' => [
                'id' => $product->user_id,
                'name' => $product->user->name ?? 'Penjual Terverifikasi Juleha',
                'region_name' => $product->user->region_name ?? $product->region_name,
                'is_verified' => (bool) ($product->user->is_verified ?? true),
                'lat' => $product->user->lat ?? null,
                'lng' => $product->user->lng ?? null,
                'is_pg_active' => (bool) ($product->user->is_pg_active ?? true),
                'is_shipping_api_active' => (bool) ($product->user->is_shipping_api_active ?? true),
                'seller_bank_details' => $product->user->seller_bank_details ?? null,
            ],
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'created_at' => $product->created_at?->toIso8601String(),
        ];
    }

    /**
     * Memformat data produk untuk admin/penjual:
     * Menyertakan rincian hierarki harga lengkap untuk audit.
     */
    public function formatForManagement(Product $product, ?User $viewer = null): array
    {
        $canSeeEkop = $viewer && ($viewer->isAdminEkop() || $viewer->isSuperAdmin() || $viewer->id === $product->user_id);
        $canSeeSuper = $viewer && $viewer->isSuperAdmin();

        return [
            'id' => $product->id,
            'user_id' => $product->user_id,
            'seller_name' => $product->user->name ?? '-',
            'title' => $product->title,
            'slug' => $product->slug,
            'description' => $product->description,
            'image_url' => $product->image_url,
            'stock' => $product->stock,
            'weight_gram' => $product->weight_gram,
            'region_code' => $product->region_code,
            'region_name' => $product->region_name,
            'status' => $product->status,
            'rejection_reason' => $product->rejection_reason,
            'base_price' => (float) $product->base_price,
            'ekop_margin' => $canSeeEkop ? (float) $product->ekop_margin : null,
            'super_margin' => $canSeeSuper ? (float) $product->super_margin : null,
            'final_price' => (float) $product->final_price,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'created_at' => $product->created_at?->format('d M Y H:i'),
        ];
    }
}
