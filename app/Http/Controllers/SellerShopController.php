<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SellerShopController extends Controller
{
    /**
     * Tampilkan halaman Pengaturan Toko Penjual
     */
    public function edit(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('Seller/ShopSettings', [
            'settings' => [
                'is_pg_active' => (bool) $user->is_pg_active,
                'is_shipping_api_active' => (bool) $user->is_shipping_api_active,
                'seller_bank_details' => $user->seller_bank_details ?? '',
            ],
        ]);
    }

    /**
     * Simpan perubahan pengaturan toko (Payment Gateway toggle & Shipping API toggle)
     */
    public function update(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'is_pg_active' => ['required', 'boolean'],
            'is_shipping_api_active' => ['required', 'boolean'],
            'seller_bank_details' => [
                'nullable',
                'string',
                'max:1000',
                function ($attribute, $value, $fail) use ($request) {
                    if (!$request->boolean('is_pg_active') && empty(trim((string) $value))) {
                        $fail('Nama Bank, Nomor Rekening, dan Atas Nama wajib diisi jika Payment Gateway QRIS Dinamis dinonaktifkan.');
                    }
                },
            ],
        ]);

        $user->is_pg_active = (bool) $validated['is_pg_active'];
        $user->is_shipping_api_active = (bool) $validated['is_shipping_api_active'];
        $user->seller_bank_details = $validated['seller_bank_details'] ? trim($validated['seller_bank_details']) : null;
        $user->save();

        return back()->with('success', 'Pengaturan metode pembayaran dan pengiriman toko Anda berhasil diperbarui.');
    }
}
