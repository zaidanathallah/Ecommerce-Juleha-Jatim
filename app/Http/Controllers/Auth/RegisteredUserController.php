<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
        // 1. Validasi form dasar
        $request->validate([
            'juleha_id' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'address' => ['required', 'string', 'max:500'],
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'ktp' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
        ]);

        // 2. Verifikasi cross-database real-time ke julehaaja_members.members
        $memberData = $validationService->verifyAndFetchMember($request->input('juleha_id'));

        // 3. Handle upload KTP bila ada
        $ktpUrl = null;
        if ($request->hasFile('ktp')) {
            $path = $request->file('ktp')->store('ktp_uploads', 'public');
            $ktpUrl = '/storage/' . $path;
        }

        // 4. Create user
        $user = User::create([
            'juleha_id' => $memberData['juleha_id'],
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => User::ROLE_USER,
            'region_code' => $memberData['region_code'],
            'region_name' => $memberData['region_name'],
            'address' => $request->address,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'ktp_url' => $ktpUrl,
            'is_verified' => true,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false))
            ->with('success', "Selamat datang, {$user->name}! Akun anggota Juleha Anda berhasil terdaftar.");
    }
}
