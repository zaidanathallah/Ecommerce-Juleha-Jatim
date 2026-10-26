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
     *
     * @throws ValidationException
     */
    public function store(Request $request, MemberValidationService $validationService): RedirectResponse
    {
        $accountType = $request->input('account_type');
        if (!$accountType) {
            $accountType = $request->filled('juleha_id') ? 'seller' : 'buyer';
        }

        if ($accountType === 'seller' || $request->filled('juleha_id')) {
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'shop_name' => ['nullable', 'string', 'max:150'],
                'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
                'phone' => ['required', 'string', 'max:30'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'address' => ['required', 'string', 'max:500'],
                'lat' => ['nullable', 'numeric', 'between:-90,90'],
                'lng' => ['nullable', 'numeric', 'between:-180,180'],
                'juleha_id' => ['nullable', 'string', 'max:50'],
                'ktp' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            ]);

            $julehaId = trim((string) $request->input('juleha_id'));
            $isMember = false;
            $regionCode = 'UMUM';
            $regionName = 'Mitra Penjual Umum';

            if (!empty($julehaId)) {
                $memberData = $validationService->verifyAndFetchMember($julehaId);
                $julehaId = $memberData['juleha_id'];
                $regionCode = $memberData['region_code'];
                $regionName = $memberData['region_name'];
                $isMember = true;
            }

            $ktpUrl = null;
            if ($request->hasFile('ktp')) {
                $ktpUrl = app(ImageUploadService::class)->uploadAndCompress($request->file('ktp'), 'ktp_uploads');
            }

            $user = User::create([
                'juleha_id' => !empty($julehaId) ? $julehaId : null,
                'name' => $request->name,
                'shop_name' => $request->shop_name ?: ($request->name . ' Store'),
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => User::ROLE_USER,
                'user_type' => 'seller',
                'is_member' => $isMember,
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
                ->with('success', "Selamat datang, {$user->name}! Akun Penjual Anda berhasil aktif. Anda dapat mulai menambahkan produk jualan Anda.");
        }

        // Pendaftaran Akun Pembeli Umum (Masyarakat Luas / Seluruh Dunia)
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

        return redirect(route('dashboard', absolute: false))
            ->with('success', "Selamat datang, {$user->name}! Akun belanja Anda berhasil dibuat. Silakan memilih produk halal terbaik.");
    }
}
