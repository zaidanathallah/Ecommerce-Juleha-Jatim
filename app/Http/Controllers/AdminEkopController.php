<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use App\Services\PricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminEkopController extends Controller
{
    public function __construct(
        protected PricingService $pricingService
    ) {}

    /**
     * Dashboard Admin Ekop Daerah (Kabupaten / Kota)
     */
    public function dashboard(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $regionCode = $user->region_code;

        $pendingCount = Product::when($regionCode, fn($q) => $q->where('region_code', $regionCode))
            ->where('status', Product::STATUS_PENDING)
            ->count();

        $approvedEkopCount = Product::when($regionCode, fn($q) => $q->where('region_code', $regionCode))
            ->where('status', Product::STATUS_APPROVED_EKOP)
            ->count();

        $liveCount = Product::when($regionCode, fn($q) => $q->where('region_code', $regionCode))
            ->where('status', Product::STATUS_LIVE)
            ->count();

        $memberCount = User::where('role', User::ROLE_USER)
            ->when($regionCode, fn($q) => $q->where('region_code', $regionCode))
            ->count();

        // Daftar produk yang membutuhkan review Ekop
        $reviewQueue = Product::with(['user', 'category'])
            ->when($regionCode, fn($q) => $q->where('region_code', $regionCode))
            ->where('status', Product::STATUS_PENDING)
            ->latest()
            ->get()
            ->map(fn($p) => $this->pricingService->formatForManagement($p, $user));

        // Semua produk wilayah
        $allProducts = Product::with(['user', 'category'])
            ->when($regionCode, fn($q) => $q->where('region_code', $regionCode))
            ->latest()
            ->paginate(15)
            ->through(fn($p) => $this->pricingService->formatForManagement($p, $user));

        return Inertia::render('AdminEkop/Dashboard', [
            'regionName' => $user->region_name ?? 'Wilayah DPD Juleha',
            'regionCode' => $regionCode ?? 'ALL',
            'stats' => [
                'pendingReview' => $pendingCount,
                'waitingSuperAdmin' => $approvedEkopCount,
                'liveProducts' => $liveCount,
                'totalMembers' => $memberCount,
            ],
            'reviewQueue' => $reviewQueue,
            'allProducts' => $allProducts,
        ]);
    }

    /**
     * Proses Persetujuan Produk oleh Admin Ekop (Penetapan margin daerah)
     */
    public function approve(Request $request, Product $product): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Validasi otoritas wilayah
        if (!$user->canManageRegion($product->region_code)) {
            abort(403, 'Anda tidak memiliki hak akses memproses produk di luar yurisdiksi daerah Anda.');
        }

        $validated = $request->validate([
            'ekop_margin' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $product->ekop_margin = (float) $validated['ekop_margin'];
        $product->status = Product::STATUS_APPROVED_EKOP;
        $product->reviewed_by_ekop_id = $user->id;
        $product->rejection_reason = null;
        $product->save();

        return back()->with('success', "Produk '{$product->title}' berhasil disetujui Admin Ekop dengan margin daerah Rp " . number_format($product->ekop_margin, 0, ',', '.') . ". Menunggu persetujuan Super Admin Jatim.");
    }

    /**
     * Penolakan Produk oleh Admin Ekop
     */
    public function reject(Request $request, Product $product): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->canManageRegion($product->region_code)) {
            abort(403, 'Anda tidak memiliki hak akses memproses produk di luar yurisdiksi daerah Anda.');
        }

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $product->status = Product::STATUS_REJECTED;
        $product->rejection_reason = $validated['rejection_reason'];
        $product->reviewed_by_ekop_id = $user->id;
        $product->save();

        return back()->with('success', "Produk '{$product->title}' telah ditolak dengan alasan: {$validated['rejection_reason']}");
    }
}
