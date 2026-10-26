<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ImageUploadService;
use App\Services\MemberValidationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Real-time Debounced API Check for Juleha ID
     */
    public function verifyJuleha(Request $request, MemberValidationService $validationService): JsonResponse
    {
        $request->validate([
            'juleha_id' => 'required|string|max:50',
        ]);

        try {
            $memberData = $validationService->verifyAndFetchMember($request->input('juleha_id'));

            return response()->json([
                'success' => true,
                'member' => $memberData,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->validator->errors()->first('juleha_id'),
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Handle an incoming registration request.
     * Aturan Bisnis Mutlak:
     * 1. Pembeli (Buyer): Terbuka untuk seluruh dunia/masyarakat umum.
     * 2. Penjual (Seller): HANYA ANGGOTA RESMI JULEHA JAWA TIMUR dengan ID Juleha aktif.
     *
     * @throws ValidationException
     */
    public function store(Request $request, MemberValidationService $validationService): RedirectResponse
    {
        $accountType = $request->input('account_type', 'buyer');

        // Mode 1: PENDAFTARAN PENJUAL (KHUSUS ANGGOTA RESMI JULEHA JATIM)
        if ($accountType === 'seller') {
            $request->validate([
                'juleha_id' => ['required', 'string', 'max:50'],
                'name' => ['required', 'string', 'max:255'],
                'shop_name' => ['required', 'string', 'max:150'],
                'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
                'phone' => ['required', 'string', 'max:30'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'address' => ['required', 'string', 'max:500'],
                'lat' => ['nullable', 'numeric', 'between:-90,90'],
                'lng' => ['nullable', 'numeric', 'between:-180,180'],
                'ktp' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            ], [
                'juleha_id.required' => 'Nomor ID Juleha wajib diisi! Hanya anggota resmi Juleha Jawa Timur yang dapat mendaftar sebagai penjual.',
                'shop_name.required' => 'Nama toko atau usaha penjual wajib diisi.',
            ]);

            $julehaId = trim((string) $request->input('juleha_id'));
            
            // Validasi keaslian anggota di database keanggotaan Juleha Jatim
            $memberData = $validationService->verifyAndFetchMember($julehaId);
            $julehaId = $memberData['juleha_id'];
            $regionCode = $memberData['region_code'];
            $regionName = $memberData['region_name'];

            $ktpUrl = null;
            if ($request->hasFile('ktp')) {
                $ktpUrl = app(ImageUploadService::class)->uploadAndCompress($request->file('ktp'), 'ktp_uploads');
            }

            $user = User::create([
                'juleha_id' => $julehaId,
                'name' => ($memberData['name'] ?? null) ?: $request->name,
                'shop_name' => $request->shop_name ?: ($request->name . ' Store'),
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => User::ROLE_USER,
                'user_type' => 'seller',
                'is_member' => true,
                'region_code' => $regionCode,
                'region_name' => $regionName,
                'address' => $request->address,
                'lat' => $request->lat ?? -7.2575,
                'lng' => $request->lng ?? 112.7521,
                'ktp_url' => $ktpUrl,
                'is_verified' => true,
            ]);

            event(new Registered($user));
            Auth::login($user);

            return redirect(route('dashboard', absolute: false))
                ->with('success', "Selamat datang Anggota Juleha {$user->name}! Toko Anda berhasil dibuat dan aktif.");
        }

        // Mode 2: PENDAFTARAN PEMBELI UMUM (SELURUH DUNIA / MASYARAKAT UMUM)
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'address' => ['required', 'string', 'max:500'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $user = User::create([
            'juleha_id' => null,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => User::ROLE_USER,
            'user_type' => 'buyer',
            'is_member' => false,
            'region_code' => 'UMUM',
            'region_name' => 'Pembeli Umum',
            'address' => $request->address,
            'lat' => $request->lat ?? -7.2575,
            'lng' => $request->lng ?? 112.7521,
            'is_verified' => true,
        ]);

        event(new Registered($user));
        Auth::login($user);

        // Pengguna pembeli langsung diarahkan ke halaman produk/katalog marketplace
        return redirect(route('home', absolute: false))
            ->with('success', "Selamat datang, {$user->name}! Akun belanja Anda berhasil aktif. Silakan memilih produk sembelih dan kebutuhan halal terbaik.");
    }
}
