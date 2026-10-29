<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VoucherController extends Controller
{
    /**
     * List all vouchers accessible to current authorized user
     */
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $query = Voucher::with('creator')->latest();

        if ($user->isSuperAdmin()) {
            // Super Admin can view all vouchers
            $vouchers = $query->get();
        } elseif ($user->isAdminEkop()) {
            // Admin Ekop can view global vouchers and regional/their own vouchers
            $vouchers = $query->where(function ($q) use ($user) {
                $q->where('scope', Voucher::SCOPE_GLOBAL)
                  ->orWhere('created_by', $user->id);
            })->get();
        } else {
            // Seller can view global vouchers and their own created vouchers
            $vouchers = $query->where(function ($q) use ($user) {
                $q->where('scope', Voucher::SCOPE_GLOBAL)
                  ->orWhere('created_by', $user->id);
            })->get();
        }

        return response()->json([
            'success' => true,
            'vouchers' => $vouchers,
        ]);
    }

    /**
     * Create a new voucher
     */
    public function store(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isSuperAdmin() && !$user->isAdminEkop() && !$user->isAllowedToSell()) {
            abort(403, 'Hanya penjual terverifikasi, Admin Ekop, atau Super Admin yang dapat membuat voucher.');
        }

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:vouchers,code'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:free_shipping,discount_percent,discount_fixed'],
            'discount_amount' => ['required', 'numeric', 'min:1'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ]);

        $scope = $user->isSuperAdmin() 
            ? Voucher::SCOPE_GLOBAL 
            : ($user->isAdminEkop() ? Voucher::SCOPE_REGIONAL : Voucher::SCOPE_SELLER);

        $voucher = Voucher::create([
            'code' => strtoupper(trim($validated['code'])),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'discount_amount' => $validated['discount_amount'],
            'min_spend' => $validated['min_spend'] ?? 0,
            'max_discount' => $validated['max_discount'] ?? null,
            'scope' => $scope,
            'created_by' => $user->id,
            'expires_at' => $validated['expires_at'] ?? now()->addMonths(1),
            'is_active' => true,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Voucher '{$voucher->code}' berhasil dibuat!",
                'voucher' => $voucher,
            ]);
        }

        return back()->with('success', "Voucher '{$voucher->code}' berhasil dibuat dan aktif digunakan!");
    }

    /**
     * Update an existing voucher
     */
    public function update(Request $request, Voucher $voucher)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isSuperAdmin() && $voucher->created_by !== $user->id) {
            abort(403, 'Anda tidak berhak mengubah voucher ini.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:free_shipping,discount_percent,discount_fixed'],
            'discount_amount' => ['required', 'numeric', 'min:1'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['required', 'boolean'],
        ]);

        $voucher->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'discount_amount' => $validated['discount_amount'],
            'min_spend' => $validated['min_spend'] ?? 0,
            'max_discount' => $validated['max_discount'] ?? null,
            'expires_at' => $validated['expires_at'] ?? $voucher->expires_at,
            'is_active' => $validated['is_active'],
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Voucher '{$voucher->code}' berhasil diperbarui!",
                'voucher' => $voucher,
            ]);
        }

        return back()->with('success', "Voucher '{$voucher->code}' berhasil diperbarui!");
    }

    /**
     * Delete a voucher
     */
    public function destroy(Request $request, Voucher $voucher)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isSuperAdmin() && $voucher->created_by !== $user->id) {
            abort(403, 'Anda tidak berhak menghapus voucher ini.');
        }

        $code = $voucher->code;
        $voucher->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Voucher '{$code}' berhasil dihapus.",
            ]);
        }

        return back()->with('success', "Voucher '{$code}' berhasil dihapus.");
    }
}

