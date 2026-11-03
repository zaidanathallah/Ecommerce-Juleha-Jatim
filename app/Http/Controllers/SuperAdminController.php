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
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
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

        // Matrix Daerah & Akun Admin Ekop se-Jawa Timur
        $allRegions = CentralRegion::getAllRegions();
        $adminEkopUsers = User::where('role', User::ROLE_ADMIN_EKOP)->latest()->get();
        $adminEkopByRegion = $adminEkopUsers->groupBy(fn($u) => strtoupper(trim((string) $u->region_code)));

        $ekopRegions = $allRegions->map(function ($reg) use ($adminEkopByRegion) {
            $code = strtoupper($reg['initial']);
            $admins = $adminEkopByRegion->get($code, collect());
            
            // Hitung anggota & penjual di daerah ini
            $membersCount = User::where(function ($q) use ($code) {
                $q->where('region_code', $code)
                  ->orWhere('juleha_id', 'like', "{$code}%");
            })->where('role', User::ROLE_USER)->count();

            // Hitung total kas daerah yang sudah terkumpul
            $kasDaerah = Order::whereHas('seller', function ($q) use ($code) {
                $q->where('region_code', $code)
                  ->orWhere('juleha_id', 'like', "{$code}%");
            })->where('payment_status', Order::PAYMENT_PAID)->sum('total_ekop_margin');

            return [
                'initial' => $code,
                'name' => $reg['name'],
                'is_registered' => $admins->isNotEmpty(),
                'admins_count' => $admins->count(),
                'members_count' => $membersCount,
                'total_kas_ekop' => (float) $kasDaerah,
                'admins' => $admins->map(fn($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'email' => $a->email,
                    'phone' => $a->phone ?? '-',
                    'juleha_id' => $a->juleha_id ?? '-',
                    'shop_name' => $a->shop_name ?? '-',
                    'region_code' => $a->region_code,
                    'region_name' => $a->region_name,
                    'created_at' => $a->created_at ? $a->created_at->format('d/m/Y') : '-',
                ])->values()->all(),
            ];
        });

        $totalRegisteredRegions = $ekopRegions->filter(fn($r) => $r['is_registered'])->count();
        $totalAllRegions = $ekopRegions->count();

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'waitingSuperReview' => $waitingSuperReviewCount,
                'waitingEkopReview' => $waitingEkopReviewCount,
                'liveProducts' => $liveProductsCount,
                'totalMembers' => $totalMembersCount,
                'totalEkopAdmins' => $totalEkopAdminsCount,
                'totalKasProvinsi' => (float) $totalKasProvinsi,
                'totalKasDaerah' => (float) $totalKasDaerah,
                'totalRegisteredRegions' => $totalRegisteredRegions,
                'totalAllRegions' => $totalAllRegions,
            ],
            'approvalQueue' => $approvalQueue,
            'allProducts' => $allProducts,
            'recentOrders' => $recentOrders,
            'categories' => \App\Models\Category::latest()->get(['id', 'name', 'slug', 'description', 'icon', 'is_active']),
            'ekopRegions' => $ekopRegions,
            'allRegionsList' => $allRegions,
            'adminEkopList' => $adminEkopUsers->map(fn($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'email' => $a->email,
                'phone' => $a->phone ?? '-',
                'juleha_id' => $a->juleha_id ?? '-',
                'shop_name' => $a->shop_name ?? '-',
                'region_code' => $a->region_code,
                'region_name' => $a->region_name ?? CentralRegion::findRegionName($a->region_code),
                'created_at' => $a->created_at ? $a->created_at->format('d/m/Y H:i') : '-',
            ]),
        ]);
    }

    /**
     * Buat Akun Admin Ekop Daerah Baru (Khusus Super Admin)
     */
    public function storeAdminEkop(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:6'],
            'region_code' => ['required', 'string', 'max:10'],
            'region_name' => ['nullable', 'string', 'max:100'],
            'juleha_id' => ['nullable', 'string', 'max:50'],
            'shop_name' => ['nullable', 'string', 'max:100'],
        ]);

        $regionCode = strtoupper(trim($validated['region_code']));
        $regionName = !empty($validated['region_name']) 
            ? trim($validated['region_name']) 
            : CentralRegion::findRegionName($regionCode);

        // Jika Juleha ID kosong, buatkan nomor registrasi standar Ekop
        $julehaId = !empty($validated['juleha_id'])
            ? trim($validated['juleha_id'])
            : ($regionCode . '-EKOP-' . rand(100, 999));

        $shopName = !empty($validated['shop_name'])
            ? trim($validated['shop_name'])
            : ('Ekop ' . $regionName);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_ADMIN_EKOP,
            'user_type' => 'seller',
            'is_verified' => true,
            'is_member' => true,
            'region_code' => $regionCode,
            'region_name' => $regionName,
            'juleha_id' => $julehaId,
            'shop_name' => $shopName,
            'address' => "Kantor Ekop Juleha {$regionName}",
            'is_pg_active' => true,
            'is_shipping_api_active' => true,
        ]);

        return back()->with('success', "Akun Admin Ekop untuk wilayah {$regionName} ({$regionCode}) atas nama {$validated['name']} berhasil didaftarkan.");
    }

    /**
     * Perbarui Data Akun Admin Ekop Daerah (Khusus Super Admin)
     */
    public function updateAdminEkop(Request $request, User $user): RedirectResponse
    {
        if ($user->role !== User::ROLE_ADMIN_EKOP) {
            abort(403, 'User ini bukan akun Admin Ekop.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:6'],
            'region_code' => ['required', 'string', 'max:10'],
            'region_name' => ['nullable', 'string', 'max:100'],
            'juleha_id' => ['nullable', 'string', 'max:50'],
            'shop_name' => ['nullable', 'string', 'max:100'],
        ]);

        $regionCode = strtoupper(trim($validated['region_code']));
        $regionName = !empty($validated['region_name'])
            ? trim($validated['region_name'])
            : CentralRegion::findRegionName($regionCode);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'region_code' => $regionCode,
            'region_name' => $regionName,
            'juleha_id' => $validated['juleha_id'] ?? $user->juleha_id,
            'shop_name' => $validated['shop_name'] ?? $user->shop_name,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return back()->with('success', "Data Akun Admin Ekop {$user->name} ({$regionName}) berhasil diperbarui.");
    }

    /**
     * Hapus Akun Admin Ekop Daerah (Khusus Super Admin)
     */
    public function deleteAdminEkop(User $user): RedirectResponse
    {
        if ($user->role !== User::ROLE_ADMIN_EKOP) {
            abort(403, 'Akses ditolak. Hanya akun Admin Ekop yang dapat dihapus dari panel ini.');
        }

        $adminName = $user->name;
        $regionName = $user->region_name ?? $user->region_code;

        $user->delete();

        return back()->with('success', "Akun Admin Ekop {$adminName} untuk wilayah {$regionName} berhasil dihapus dari sistem.");
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
