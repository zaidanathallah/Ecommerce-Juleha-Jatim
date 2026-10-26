<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\PricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function __construct(
        protected PricingService $pricingService
    ) {}

    /**
     * Dashboard Super Admin DPW Juleha Jawa Timur
     */
    public function dashboard(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        // Metric Global Provinsi
        $waitingSuperReviewCount = Product::where('status', Product::STATUS_APPROVED_EKOP)->count();
        $waitingEkopReviewCount = Product::where('status', Product::STATUS_PENDING)->count();
        $liveProductsCount = Product::where('status', Product::STATUS_LIVE)->count();
        $totalMembersCount = User::where('role', User::ROLE_USER)->count();
        $totalEkopAdminsCount = User::where('role', User::ROLE_ADMIN_EKOP)->count();

        // Antrean persetujuan final (Sudah disetujui Ekop)
        $approvalQueue = Product::with(['user', 'category', 'reviewedByEkop'])
            ->where('status', Product::STATUS_APPROVED_EKOP)
            ->latest()
            ->get()
            ->map(fn($p) => $this->pricingService->formatForManagement($p, $user));

        // Semua produk di Jawa Timur
        $allProducts = Product::with(['user', 'category', 'reviewedByEkop'])
            ->latest()
            ->paginate(20)
            ->through(fn($p) => $this->pricingService->formatForManagement($p, $user));

        // Financial & Kas Summary
        $totalKasProvinsi = Order::where('payment_status', Order::PAYMENT_PAID)->sum('total_super_margin');
        $totalKasDaerah = Order::where('payment_status', Order::PAYMENT_PAID)->sum('total_ekop_margin');

        // Recent Orders with transaction & delivery proofs
        $recentOrders = Order::with(['buyer', 'seller', 'items'])
            ->latest()
            ->take(15)
            ->get();

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'waitingSuperReview' => $waitingSuperReviewCount,
                'waitingEkopReview' => $waitingEkopReviewCount,
                'liveProducts' => $liveProductsCount,
                'totalMembers' => $totalMembersCount,
                'totalEkopAdmins' => $totalEkopAdminsCount,
                'totalKasProvinsi' => (float) $totalKasProvinsi,
                'totalKasDaerah' => (float) $totalKasDaerah,
            ],
            'approvalQueue' => $approvalQueue,
            'allProducts' => $allProducts,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Persetujuan Final & Publikasi Produk oleh Super Admin Jatim
     * Menetapkan margin provinsi (super_margin) dan mengubah status menjadi LIVE
     */
    public function publish(Request $request, Product $product): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'super_margin' => ['required', 'numeric', 'min:0'],
        ]);

        $product->super_margin = (float) $validated['super_margin'];
        $product->status = Product::STATUS_LIVE;
        $product->reviewed_by_super_id = $user->id;
        $product->rejection_reason = null;
        $product->save();

        $finalPriceFormatted = number_format($product->final_price, 0, ',', '.');

        return back()->with('success', "Produk '{$product->title}' RESMI DITERBITKAN (LIVE) dengan Margin Provinsi Rp " . number_format($product->super_margin, 0, ',', '.') . " dan Total Harga Final Publik: Rp {$finalPriceFormatted}.");
    }

    /**
     * Penolakan Produk oleh Super Admin Jatim
     */
    public function reject(Request $request, Product $product): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $product->status = Product::STATUS_REJECTED;
        $product->rejection_reason = $validated['rejection_reason'];
        $product->reviewed_by_super_id = $user->id;
        $product->save();

        return back()->with('success', "Produk '{$product->title}' ditolak oleh Super Admin dengan alasan: {$validated['rejection_reason']}");
    }

    /**
     * Update Pengaturan Global & Fitur Islami (Murottal & Adzan)
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'is_global_murottal_active' => ['required', 'boolean'],
            'is_adzan_active' => ['required', 'boolean'],
            'murottal_volume' => ['required', 'integer', 'between:1,100'],
        ]);

        \App\Models\SiteSetting::set('is_global_murottal_active', $validated['is_global_murottal_active']);
        \App\Models\SiteSetting::set('is_adzan_active', $validated['is_adzan_active']);
        \App\Models\SiteSetting::set('murottal_volume', $validated['murottal_volume']);

        return back()->with('success', 'Pengaturan global fitur Islami (Murottal & Adzan) berhasil disimpan.');
    }
}
