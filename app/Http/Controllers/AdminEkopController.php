<?php

namespace App\Http\Controllers;

use App\Models\CentralRegion;
use App\Models\Order;
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
        $regionCode = strtoupper(trim((string) $user->region_code));
        $regionName = $user->region_name ?: CentralRegion::findRegionName($regionCode);

        $pendingCount = Product::when($regionCode, fn($q) => $q->where('region_code', $regionCode))
            ->where('status', Product::STATUS_PENDING)
            ->count();

        $approvedEkopCount = Product::when($regionCode, fn($q) => $q->where('region_code', $regionCode))
            ->where('status', Product::STATUS_APPROVED_EKOP)
            ->count();

        $liveCount = Product::when($regionCode, fn($q) => $q->where('region_code', $regionCode))
            ->where('status', Product::STATUS_LIVE)
            ->count();

        // Anggota terdaftar di wilayah ini (berdasarkan region_code atau prefix Juleha ID)
        $memberCount = User::where(function ($q) use ($regionCode) {
            $q->where('region_code', $regionCode)
              ->orWhere('juleha_id', 'like', "{$regionCode}%");
        })->where('role', User::ROLE_USER)->count();

        // Total Kas Daerah (ekop_margin) dari seluruh pesanan LUNAS penjual di wilayah ini
        $totalKasEkopDaerah = Order::whereHas('seller', function ($q) use ($regionCode) {
            $q->where('region_code', $regionCode)
              ->orWhere('juleha_id', 'like', "{$regionCode}%");
        })->where('payment_status', Order::PAYMENT_PAID)->sum('total_ekop_margin');

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

        // Daftar pesanan dengan Hutang Margin Penjual ke Kas (karena Penjual menggunakan Transfer Rekening Pribadi)
        $unsettledDebts = Order::with(['seller', 'items'])
            ->when($regionCode, function ($q) use ($regionCode) {
                $q->whereHas('seller', function ($sq) use ($regionCode) {
                    $sq->where('region_code', $regionCode)
                       ->orWhere('juleha_id', 'like', "{$regionCode}%");
                });
            })
            ->where('margin_settlement_status', Order::MARGIN_UNSETTLED_DEBT)
            ->latest()
            ->get();

        $totalUnsettledEkop = $unsettledDebts->sum('total_ekop_margin');
        $totalUnsettledSuper = $unsettledDebts->sum('total_super_margin');

        // Daftar Penjual / Anggota Terdaftar di Wilayah Ini (Sinkronisasi ID seperti SBY22008, LMG220030, SDA220001)
        $registeredSellers = User::where(function ($q) use ($regionCode) {
            $q->where('region_code', $regionCode)
              ->orWhere('juleha_id', 'like', "{$regionCode}%");
        })
        ->where(function ($q) {
            $q->where('role', User::ROLE_USER)
              ->orWhere('role', 'seller')
              ->orWhere('role', User::ROLE_ADMIN_EKOP);
        })
        ->withCount(['products as live_products_count' => fn($q) => $q->where('status', Product::STATUS_LIVE)])
        ->withCount(['products as total_products_count'])
        ->get()
        ->map(function ($s) {
            $paidOrders = Order::where('seller_id', $s->id)->where('payment_status', Order::PAYMENT_PAID)->get();
            $totalMargin = (float) $paidOrders->sum('total_ekop_margin');
            $totalOrders = $paidOrders->count();

            return [
                'id' => $s->id,
                'name' => $s->name,
                'juleha_id' => $s->juleha_id ?: '-',
                'shop_name' => $s->shop_name ?: $s->name,
                'phone' => $s->phone ?: '-',
                'email' => $s->email,
                'address' => $s->address ?: '-',
                'is_verified' => (bool) $s->is_verified,
                'live_products_count' => $s->live_products_count,
                'total_products_count' => $s->total_products_count,
                'total_orders_count' => $totalOrders,
                'total_ekop_margin' => $totalMargin,
            ];
        });

        // Pantau Transaksi & Pesanan Masuk Penjual di Wilayah Ini
        $regionalOrders = Order::with(['seller', 'buyer', 'items'])
            ->whereHas('seller', function ($q) use ($regionCode) {
                $q->where('region_code', $regionCode)
                  ->orWhere('juleha_id', 'like', "{$regionCode}%");
            })
            ->latest()
            ->take(25)
            ->get()
            ->map(function ($o) {
                return [
                    'id' => $o->id,
                    'order_number' => $o->order_number,
                    'created_at' => $o->created_at ? $o->created_at->format('d/m/Y H:i') : '-',
                    'seller_name' => $o->seller?->name ?? 'Penjual',
                    'seller_juleha_id' => $o->seller?->juleha_id ?? '-',
                    'shop_name' => $o->seller?->shop_name ?? '-',
                    'buyer_name' => $o->buyer?->name ?? 'Pembeli',
                    'items_summary' => $o->items->map(fn($it) => $it->product_title . ' (' . $it->quantity . 'x)')->join(', '),
                    'grand_total' => (float) $o->grand_total,
                    'total_ekop_margin' => (float) $o->total_ekop_margin,
                    'total_super_margin' => (float) $o->total_super_margin,
                    'payment_status' => $o->payment_status,
                    'payment_method_type' => $o->payment_method_type,
                    'shipping_status' => $o->shipping_status,
                    'shipping_courier' => $o->shipping_courier,
                    'waybill' => $o->biteship_waybill_id,
                ];
            });

        return Inertia::render('AdminEkop/Dashboard', [
            'regionName' => $regionName,
            'regionCode' => $regionCode ?: 'ALL',
            'stats' => [
                'pendingReview' => $pendingCount,
                'waitingSuperAdmin' => $approvedEkopCount,
                'liveProducts' => $liveCount,
                'totalMembers' => $memberCount,
                'totalKasEkopDaerah' => (float) $totalKasEkopDaerah,
                'totalRegisteredSellers' => $registeredSellers->count(),
                'unsettledDebtOrdersCount' => $unsettledDebts->count(),
                'totalUnsettledEkopDebt' => (float) $totalUnsettledEkop,
                'totalUnsettledSuperDebt' => (float) $totalUnsettledSuper,
            ],
            'reviewQueue' => $reviewQueue,
            'allProducts' => $allProducts,
            'unsettledDebts' => $unsettledDebts,
            'registeredSellers' => $registeredSellers,
            'regionalOrders' => $regionalOrders,
            'categories' => \App\Models\Category::latest()->get(['id', 'name', 'slug', 'description', 'icon', 'is_active']),
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

    /**
     * Konfirmasi Pelunasan Setoran Margin Kas dari Penjual (Hutang Penjual ke Kas)
     */
    public function settleDebt(Request $request, Order $order): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->canManageRegion($order->seller->region_code ?? null)) {
            abort(403, 'Anda tidak memiliki hak akses menagih toko di luar daerah Anda.');
        }

        $order->margin_settlement_status = Order::MARGIN_PAID_TREASURY;
        $order->save();

        return back()->with('success', "Setoran Margin Toko untuk Pesanan {$order->order_number} sebesar Rp " . number_format($order->total_ekop_margin + $order->total_super_margin, 0, ',', '.') . " berhasil ditandai LUNAS disetor ke Kas Organisasi Juleha Jatim.");
    }
}
