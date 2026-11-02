<?php

namespace App\Http\Controllers;

use App\Models\CentralMember;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use App\Services\BiteshipService;
use App\Services\ImageUploadService;
use App\Services\PricingService;
use App\Services\WijayaPayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected PricingService $pricingService,
        protected BiteshipService $biteshipService,
        protected WijayaPayService $wijayaPayService,
        protected ImageUploadService $imageUploadService
    ) {}

    /**
     * Tampilkan Halaman Checkout Dinamis
     */
    public function index(Request $request, string $slug): Response|\Illuminate\Http\RedirectResponse
    {
        /** @var User $buyer */
        $buyer = Auth::user();

        $product = Product::with(['user', 'category'])
            ->where('slug', $slug)
            ->live()
            ->firstOrFail();

        $seller = $product->user;

        // Cek sinkronisasi keanggotaan aktif penjual dari database pusat
        if ($seller && $seller->isAnggota() && !empty($seller->juleha_id)) {
            try {
                $central = CentralMember::where('juleha_id', $seller->juleha_id)->first();
                if ($central && !$central->is_active) {
                    return redirect()->route('products.show', $product->slug)
                        ->with('error', "Status keanggotaan penjual produk ini ({$seller->juleha_id}) sedang NON-AKTIF di database pusat members.julehajatim.com. Pembelian ditangguhkan sampai diaktifkan kembali.");
                }
            } catch (\Exception $e) {}
        }

        $isFlashSaleRequested = $request->query('flash_sale') === '1' || ($request->query('flash_sale') !== '0' && $product->is_flash_sale && $product->flash_sale_price > 0 && (!$product->flash_sale_end || $product->flash_sale_end >= now()));
        $formattedProduct = $this->pricingService->formatForBuyer($product, $isFlashSaleRequested);

        $availableVouchers = Voucher::active()->latest()->get()->map(function ($v) {
            return [
                'id' => $v->id,
                'code' => $v->code,
                'title' => $v->title,
                'description' => $v->description,
                'type' => $v->type,
                'discount_amount' => (float) $v->discount_amount,
                'min_spend' => (float) $v->min_spend,
                'max_discount' => $v->max_discount ? (float) $v->max_discount : null,
            ];
        });

        // Ambil channel pembayaran resmi real-time dari WijayaPay
        $paymentChannels = $seller->is_pg_active
            ? $this->wijayaPayService->getPaymentChannels()
            : [];

        return Inertia::render('Checkout/Index', [
            'product' => $formattedProduct,
            'availableVouchers' => $availableVouchers,
            'paymentChannels' => $paymentChannels,
            'seller' => [
                'id' => $seller->id,
                'name' => $seller->name,
                'region_name' => $seller->region_name,
                'lat' => $seller->lat ?? -7.4726,
                'lng' => $seller->lng ?? 112.7058,
                'is_pg_active' => (bool) $seller->is_pg_active,
                'is_shipping_api_active' => (bool) $seller->is_shipping_api_active,
                'seller_bank_details' => $seller->seller_bank_details,
            ],
            'buyer' => [
                'id' => $buyer->id,
                'name' => $buyer->name,
                'phone' => $buyer->phone ?? '',
                'address' => $buyer->address ?? '',
                'lat' => $buyer->lat ?? -7.2575,
                'lng' => $buyer->lng ?? 112.7521,
            ],
        ]);
    }

    /**
     * API Endpoint untuk mendapatkan daftar channel pembayaran aktif WijayaPay
     */
    public function paymentChannels(): JsonResponse
    {
        $channels = $this->wijayaPayService->getPaymentChannels();
        return response()->json([
            'success' => true,
            'channels' => $channels,
        ]);
    }

    /**
     * Cek Tarif Ongkir Real-time via Biteship API
     */
    public function calculateShipping(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'destination_lat' => 'required|numeric',
            'destination_lng' => 'required|numeric',
            'destination_postal_code' => 'nullable|string',
        ]);

        $product = Product::with('user')->findOrFail($request->product_id);
        $seller = $product->user;

        if (!$seller->is_shipping_api_active) {
            return response()->json([
                'success' => true,
                'is_manual' => true,
                'message' => 'Toko ini menggunakan Kurir Mandiri / COD Penjual.',
                'pricing' => [],
            ]);
        }

        $origin = [
            'lat' => $seller->lat ?? -7.4726,
            'lng' => $seller->lng ?? 112.7058,
        ];

        $destination = [
            'lat' => (float) $request->destination_lat,
            'lng' => (float) $request->destination_lng,
            'postal_code' => $request->destination_postal_code,
        ];

        $items = [
            [
                'name' => $product->title,
                'description' => 'Bilah / Sarana Sembelih Halal',
                'value' => (int) $product->final_price,
                'quantity' => 1,
                'weight_gram' => $product->weight_gram,
                'length_cm' => $product->length_cm ?? 10,
                'width_cm' => $product->width_cm ?? 10,
                'height_cm' => $product->height_cm ?? 10,
            ],
        ];

        $ratesResponse = $this->biteshipService->getRates($origin, $destination, $items);

        if ($ratesResponse['success'] && !empty($ratesResponse['pricing'])) {
            $formattedPricing = array_map(function ($p) {
                return [
                    'courier_name' => $p['courier_name'] ?? strtoupper($p['courier_code'] ?? 'Kurir'),
                    'courier_code' => strtolower($p['courier_code'] ?? 'courier'),
                    'courier_service_name' => $p['courier_service_name'] ?? 'Reguler',
                    'courier_service_code' => strtolower($p['courier_service_code'] ?? 'reg'),
                    'duration' => str_replace('days', 'Hari', $p['duration'] ?? '1 - 2 Hari'),
                    'price' => (float) ($p['price'] ?? 0),
                    'type' => ucfirst($p['service_type'] ?? 'standard') . ' (' . ucfirst($p['shipping_type'] ?? 'paket') . ')',
                    'description' => $p['description'] ?? '',
                ];
            }, $ratesResponse['pricing']);

            // Urutkan tarif termurah terlebih dahulu
            usort($formattedPricing, fn ($a, $b) => $a['price'] <=> $b['price']);

            return response()->json([
                'success' => true,
                'pricing' => $formattedPricing,
                'is_live_biteship' => true,
                'origin' => $origin,
                'destination' => $destination,
            ]);
        }

        // Fallback jika API Biteship offline
        $fallbackPricing = [
            [
                'courier_name' => 'J&T Express',
                'courier_code' => 'jnt',
                'courier_service_name' => 'EZ',
                'courier_service_code' => 'ez',
                'duration' => '1 - 2 Hari',
                'price' => 18000,
                'type' => 'Standard Delivery',
            ],
            [
                'courier_name' => 'JNE',
                'courier_code' => 'jne',
                'courier_service_name' => 'REG',
                'courier_service_code' => 'reg',
                'duration' => '1 - 2 Hari',
                'price' => 19000,
                'type' => 'Standard Delivery',
            ],
            [
                'courier_name' => 'SiCepat',
                'courier_code' => 'sicepat',
                'courier_service_name' => 'REG',
                'courier_service_code' => 'reg',
                'duration' => '1 - 3 Hari',
                'price' => 18500,
                'type' => 'Standard Delivery',
            ],
            [
                'courier_name' => 'Anteraja',
                'courier_code' => 'anteraja',
                'courier_service_name' => 'Regular',
                'courier_service_code' => 'reg',
                'duration' => '2 - 3 Hari',
                'price' => 17500,
                'type' => 'Standard Delivery',
            ],
        ];

        return response()->json([
            'success' => true,
            'pricing' => $fallbackPricing,
            'is_live_biteship' => false,
            'note' => 'Biteship Fallback',
        ]);
    }

    /**
     * Proses Checkout & Generate Pembayaran (QRIS Dinamis TemanQRIS atau Transfer Manual)
     * Backend recalculation untuk proteksi manipulasi inspect element!
     */
    public function process(Request $request): RedirectResponse
    {
        /** @var User $buyer */
        $buyer = Auth::user();

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'is_flash_sale' => ['nullable'],
            'recipient_name' => ['required', 'string', 'max:150'],
            'recipient_phone' => ['required', 'string', 'max:30'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'destination_lat' => ['required', 'numeric'],
            'destination_lng' => ['required', 'numeric'],
            'courier_company' => ['nullable', 'string', 'max:50'],
            'courier_service' => ['nullable', 'string', 'max:50'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'payment_channel' => ['nullable', 'string', 'max:50'],
            'voucher_code' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:300'],
        ]);

        $product = Product::with('user')->findOrFail($validated['product_id']);
        $seller = $product->user;

        // Cek sinkronisasi keanggotaan aktif penjual
        if ($seller && $seller->isAnggota() && !empty($seller->juleha_id)) {
            try {
                $central = CentralMember::where('juleha_id', $seller->juleha_id)->first();
                if ($central && !$central->is_active) {
                    return back()->with('error', "Penjual produk ini sedang NON-AKTIF di database pusat members.julehajatim.com. Pembelian tidak dapat dilanjutkan.");
                }
            } catch (\Exception $e) {}
        }

        if ($product->stock < 1) {
            return back()->with('error', 'Maaf, stok produk ini telah habis.');
        }

        // Kalkulasi ulang di backend (Directive 5 & SRS Security)
        $basePrice = (float) $product->base_price;
        $ekopMargin = (float) $product->ekop_margin;
        $superMargin = (float) $product->super_margin;
        
        // Cek apakah pembelian adalah Flash Sale aktif
        $isFlashSaleInput = $request->boolean('is_flash_sale') || $request->input('is_flash_sale') === '1' || $request->input('is_flash_sale') === 1;
        $isFlashSaleActive = $isFlashSaleInput && $product->is_flash_sale && $product->flash_sale_price > 0 && (!$product->flash_sale_end || $product->flash_sale_end >= now());

        if ($isFlashSaleActive) {
            $finalProductPrice = (float) $product->flash_sale_price;
            $basePrice = max(1000, $finalProductPrice - ($ekopMargin + $superMargin));
        } else {
            $finalProductPrice = (float) $product->final_price;
            $basePrice = (float) $product->base_price;
        }

        $shippingCost = 0.00;
        $shippingCourier = 'Kurir Mandiri Penjual';
        $shippingService = 'COD / Pengiriman Langsung';
        $shippingMethodType = Order::SHIPPING_METHOD_MANUAL;

        if ($seller->is_shipping_api_active || !empty($validated['shipping_cost'])) {
            $shippingCost = (float) ($validated['shipping_cost'] ?? 0);
            $shippingCourier = strtoupper((string) ($validated['courier_company'] ?? 'JNE'));
            $shippingService = strtoupper((string) ($validated['courier_service'] ?? 'REG'));
            $shippingMethodType = $seller->is_shipping_api_active ? Order::SHIPPING_METHOD_BITESHIP : Order::SHIPPING_METHOD_MANUAL;
        }

        // Hitung Diskon Voucher jika ada
        $voucherId = null;
        $voucherCode = null;
        $discountAmount = 0.00;

        if (!empty($validated['voucher_code'])) {
            $vCode = strtoupper(trim($validated['voucher_code']));
            $voucher = Voucher::where('code', $vCode)->active()->first();
            if ($voucher && $finalProductPrice >= (float) $voucher->min_spend) {
                $discountAmount = $voucher->calculateDiscount($finalProductPrice, $shippingCost);
                $voucherId = $voucher->id;
                $voucherCode = $voucher->code;
            }
        }

        $grandTotal = max(0, ($finalProductPrice + $shippingCost) - $discountAmount);
        $orderNumber = 'JLH-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        // Tentukan metode pembayaran & status hutang kas organisasi
        $selectedChannel = strtoupper(trim((string) $request->input('payment_channel', 'QRIS')));
        if (empty($selectedChannel) || $selectedChannel === 'QRIS_DINAMIS') {
            $selectedChannel = 'QRIS';
        }

        $isQris = ($selectedChannel === 'QRIS' || str_contains($selectedChannel, 'QRIS'));
        $paymentMethodType = $seller->is_pg_active
            ? ($isQris ? Order::PAYMENT_METHOD_QRIS : Order::PAYMENT_METHOD_VA)
            : Order::PAYMENT_METHOD_MANUAL;

        $marginSettlementStatus = $seller->is_pg_active
            ? Order::MARGIN_SETTLED_PG
            : Order::MARGIN_UNSETTLED_DEBT; // Kas belum dipotong, menjadi hutang kas penjual

        $qrisInvoiceNumber = null;
        $qrisContent = null;
        $qrisImageUrl = null;
        $qrisPaymentUrl = null;

        $pgChannelCode = null;
        $pgPaymentName = null;
        $pgVaNumber = null;
        $pgTrxReference = null;
        $pgPaymentImage = null;
        $pgPaymentInstructions = null;

        // Waktu kedaluwarsa pesanan wajib 23 jam
        $paymentExpiresAt = now()->addHours(23);

        // Jika toko menggunakan Payment Gateway Resmi (WijayaPay)
        if ($seller->is_pg_active) {
            $pgResult = $this->wijayaPayService->generatePayment(
                $orderNumber,
                $grandTotal,
                $selectedChannel,
                $validated['recipient_name']
            );

            if ($pgResult['success']) {
                $pgChannelCode = $pgResult['channel_code'] ?? $selectedChannel;
                $pgPaymentName = $pgResult['payment_name'] ?? ($isQris ? 'QRIS Dinamis' : "{$selectedChannel} Virtual Account");
                $pgVaNumber = $pgResult['va_number'] ?? null;
                $pgTrxReference = $pgResult['trx_reference'] ?? null;
                $pgPaymentImage = $pgResult['payment_image'] ?? null;
                $pgPaymentInstructions = $pgResult['tutorial_pembayaran'] ?? null;

                if ($isQris) {
                    $qrisInvoiceNumber = $orderNumber;
                    $qrisContent = $pgResult['qr_string'] ?? null;
                    $qrisImageUrl = $pgResult['qr_image'] ?? null;
                    $qrisPaymentUrl = null; // Scan langsung di website tanpa redirect ke aggregator luar
                }
            }
        }

        // Buat Order di Database via Eloquent ORM
        $order = Order::create([
            'order_number' => $orderNumber,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'total_base_price' => $basePrice,
            'total_ekop_margin' => $ekopMargin,
            'total_super_margin' => $superMargin,
            'total_product_price' => $finalProductPrice,
            'shipping_cost' => $shippingCost,
            'insurance_cost' => 0.00,
            'voucher_id' => $voucherId,
            'voucher_code' => $voucherCode,
            'discount_amount' => $discountAmount,
            'grand_total' => $grandTotal,
            'shipping_courier' => $shippingCourier,
            'shipping_service' => $shippingService,
            'shipping_method_type' => $shippingMethodType,
            'shipping_address' => [
                'recipient_name' => $validated['recipient_name'],
                'recipient_phone' => $validated['recipient_phone'],
                'address' => $validated['shipping_address'],
                'lat' => (float) $validated['destination_lat'],
                'lng' => (float) $validated['destination_lng'],
                'notes' => $validated['notes'] ?? '',
            ],
            'qris_invoice_number' => $qrisInvoiceNumber,
            'qris_content' => $qrisContent,
            'qris_image_url' => $qrisImageUrl,
            'qris_payment_url' => $qrisPaymentUrl,
            'pg_channel_code' => $pgChannelCode,
            'pg_payment_name' => $pgPaymentName,
            'pg_va_number' => $pgVaNumber,
            'pg_trx_reference' => $pgTrxReference,
            'pg_payment_image' => $pgPaymentImage,
            'pg_payment_instructions' => $pgPaymentInstructions,
            'payment_method_type' => $paymentMethodType,
            'payment_status' => Order::PAYMENT_PENDING,
            'payment_expires_at' => $paymentExpiresAt,
            'margin_settlement_status' => $marginSettlementStatus,
            'seller_bank_info_snapshot' => $seller->is_pg_active ? null : $seller->seller_bank_details,
            'shipping_status' => Order::SHIPPING_PENDING,
        ]);

        // Buat Order Item
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_title' => $product->title,
            'base_price' => $basePrice,
            'ekop_margin' => $ekopMargin,
            'super_margin' => $superMargin,
            'final_price' => $finalProductPrice,
            'quantity' => 1,
            'subtotal' => $finalProductPrice,
        ]);

        // Kurangi stok
        $product->decrement('stock');

        return redirect()->route('orders.show', $order->order_number)
            ->with('success', "Pesanan {$orderNumber} berhasil dibuat!");
    }

    /**
     * Tampilkan Halaman Detail & Pembayaran Order
     */
    public function show(string $orderNumber): Response
    {
        $order = Order::with(['buyer', 'seller', 'items.product', 'voucher'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $user = Auth::user();

        // Otorisasi akses order
        if ($order->buyer_id !== $user->id && $order->seller_id !== $user->id && !$user->isSuperAdmin() && !$user->isAdminEkop()) {
            abort(403, 'Anda tidak berhak melihat pesanan ini.');
        }

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Upload Bukti Transfer Rekening Pribadi Penjual (Manual Payment)
     */
    public function uploadTransferReceipt(Request $request, string $orderNumber): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($order->buyer_id !== $user->id) {
            abort(403, 'Hanya pembeli yang berhak mengunggah bukti transfer.');
        }

        $request->validate([
            'receipt' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $path = $this->imageUploadService->uploadAndCompress(
            $request->file('receipt'),
            'transfer_receipts'
        );

        $order->update([
            'transfer_receipt_path' => $path,
            'manual_payment_proof' => $path,
            'payment_status' => Order::PAYMENT_AWAITING_CONFIRMATION,
        ]);

        return redirect()->route('orders.show', $order->order_number)
            ->with('success', 'Bukti transfer berhasil diunggah. Status pesanan kini Menunggu Konfirmasi Penjual.');
    }

    /**
     * Konfirmasi Terima Barang (Delivery Proof & Received Quantity)
     */
    public function confirmDelivery(Request $request, string $orderNumber): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($order->buyer_id !== $user->id) {
            abort(403, 'Hanya pembeli yang berhak mengonfirmasi penerimaan barang.');
        }

        $request->validate([
            'received_quantity' => ['required', 'integer', 'min:1'],
            'delivery_proof' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $path = $this->imageUploadService->uploadAndCompress(
            $request->file('delivery_proof'),
            'delivery_receipts'
        );

        $order->update([
            'delivery_receipt_path' => $path,
            'received_quantity' => (int) $request->input('received_quantity'),
            'shipping_status' => Order::SHIPPING_DELIVERED,
            'delivered_at' => now(),
        ]);

        return redirect()->route('orders.show', $order->order_number)
            ->with('success', 'Konfirmasi penerimaan barang berhasil disimpan.');
    }

    /**
     * Penjual mengonfirmasi pembayaran transfer manual lunas
     */
    public function confirmPaymentReceived(Request $request, string $orderNumber): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($order->seller_id !== $user->id && !$user->isSuperAdmin() && !$user->isAdminEkop()) {
            abort(403, 'Hanya penjual atau pengurus yang berhak mengonfirmasi pelunasan.');
        }

        $order->update([
            'payment_status' => Order::PAYMENT_PAID,
            'paid_at' => now(),
        ]);

        return redirect()->route('orders.show', $order->order_number)
            ->with('success', 'Status pesanan berhasil diubah menjadi Lunas.');
    }

    /**
     * Batalkan Pesanan (Shopee Cancel Flow: Restore Stock & Update Status)
     */
    public function cancelOrder(Request $request, string $orderNumber): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();

        // Otorisasi: hanya pembeli pemilik pesanan atau admin
        if ($order->buyer_id !== $user->id && !$user->isSuperAdmin() && !$user->isAdminEkop()) {
            abort(403, 'Anda tidak berhak membatalkan pesanan ini.');
        }

        if ($order->payment_status !== Order::PAYMENT_PENDING && $order->payment_status !== Order::PAYMENT_AWAITING_CONFIRMATION) {
            return back()->with('error', 'Hanya pesanan yang belum dibayar yang dapat dibatalkan.');
        }

        $reason = $request->input('reason', 'Dibatalkan oleh pembeli');

        DB::transaction(function () use ($order, $reason) {
            $order->update([
                'payment_status' => Order::PAYMENT_CANCELLED,
                'shipping_status' => Order::SHIPPING_CANCELLED,
                'cancellation_reason' => $reason,
                'cancelled_at' => now(),
            ]);

            // Kembalikan kuota stok produk
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }
            }
        });

        return redirect()->route('orders.show', $order->order_number)
            ->with('success', 'Pesanan berhasil dibatalkan.');
    }

    /**
     * Ubah Alamat Pengiriman Sebelum Pembayaran (Shopee Ubah Alamat Flow)
     */
    public function updateAddress(Request $request, string $orderNumber): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($order->buyer_id !== $user->id && !$user->isSuperAdmin() && !$user->isAdminEkop()) {
            abort(403, 'Anda tidak berhak mengubah alamat pengiriman pesanan ini.');
        }

        if ($order->payment_status !== Order::PAYMENT_PENDING && $order->payment_status !== Order::PAYMENT_AWAITING_CONFIRMATION) {
            return back()->with('error', 'Alamat hanya dapat diubah sebelum pesanan selesai dibayar.');
        }

        $validated = $request->validate([
            'recipient_name' => ['required', 'string', 'max:150'],
            'recipient_phone' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string', 'max:500'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string', 'max:300'],
        ]);

        $current = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address, true);
        $updated = array_merge($current ?? [], [
            'recipient_name' => $validated['recipient_name'],
            'recipient_phone' => $validated['recipient_phone'],
            'address' => $validated['address'],
            'lat' => (float) ($validated['lat'] ?? $current['lat'] ?? -7.2825),
            'lng' => (float) ($validated['lng'] ?? $current['lng'] ?? 112.7638),
            'notes' => $validated['notes'] ?? ($current['notes'] ?? ''),
        ]);

        $order->update([
            'shipping_address' => $updated,
        ]);

        return redirect()->route('orders.show', $order->order_number)
            ->with('success', 'Alamat pengiriman pesanan berhasil diperbarui.');
    }

    /**
     * Real-time Payment Status Polling (Auto-Callback Polling Endpoint)
     * Digunakan oleh frontend untuk mengecek apakah pembayaran sudah lunas / expire / cancel
     */
    public function checkPaymentStatus(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan',
            ], 404);
        }

        // 1. Sudah Lunas di database
        if ($order->payment_status === Order::PAYMENT_PAID) {
            return response()->json([
                'success' => true,
                'status' => 'paid',
                'is_paid' => true,
                'paid_at' => $order->paid_at ? $order->paid_at->toIso8601String() : null,
                'message' => 'Pesanan telah lunas.',
            ]);
        }

        // 2. Dibatalkan
        if ($order->payment_status === Order::PAYMENT_CANCELLED) {
            return response()->json([
                'success' => true,
                'status' => 'cancelled',
                'is_paid' => false,
                'message' => 'Pesanan telah dibatalkan.',
            ]);
        }

        // 3. Batas waktu pembayaran (Countdown Expiry)
        if ($order->payment_expires_at && now()->greaterThan($order->payment_expires_at)) {
            if ($order->payment_status === Order::PAYMENT_PENDING) {
                DB::transaction(function () use ($order) {
                    $order->update([
                        'payment_status' => Order::PAYMENT_EXPIRED,
                        'shipping_status' => Order::SHIPPING_CANCELLED,
                        'cancellation_reason' => 'Batas waktu pembayaran telah habis (24 jam)',
                        'cancelled_at' => now(),
                    ]);

                    foreach ($order->items as $item) {
                        if ($item->product_id) {
                            Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                        }
                    }
                });
            }

            return response()->json([
                'success' => true,
                'status' => 'expired',
                'is_paid' => false,
                'message' => 'Batas waktu pembayaran telah habis.',
            ]);
        }

        // 4. Jika menggunakan Payment Gateway (QRIS atau Virtual Account), lakukan pengecekan status
        if (($order->payment_method_type === Order::PAYMENT_METHOD_QRIS || $order->payment_method_type === Order::PAYMENT_METHOD_VA) && $order->payment_status === Order::PAYMENT_PENDING) {
            $pgStatus = $this->wijayaPayService->checkOrderStatus($orderNumber);
            if (!empty($pgStatus['is_paid'])) {
                $order->update([
                    'payment_status' => Order::PAYMENT_PAID,
                    'paid_at' => now(),
                    'margin_settlement_status' => Order::MARGIN_SETTLED_PG,
                ]);

                $this->triggerBiteshipPickup($order);

                return response()->json([
                    'success' => true,
                    'status' => 'paid',
                    'is_paid' => true,
                    'paid_at' => $order->paid_at ? $order->paid_at->toIso8601String() : null,
                    'message' => 'Pembayaran terverifikasi LUNAS secara realtime!',
                ]);
            }

            return response()->json([
                'success' => true,
                'status' => $pgStatus['status'] ?? 'pending',
                'is_paid' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'status' => $order->payment_status,
            'is_paid' => false,
        ]);
    }

    /**
     * Otomatisasi Pickup Kurir Biteship saat Pembayaran Selesai Diverifikasi
     */
    protected function triggerBiteshipPickup(Order $order): void
    {
        if ($order->shipping_method_type === Order::SHIPPING_METHOD_BITESHIP && empty($order->biteship_order_id)) {
            try {
                $seller = $order->seller;
                $origin = [
                    'name' => $seller->shop_name ?? $seller->name,
                    'phone' => $seller->phone ?? '081234567890',
                    'address' => $seller->address ?? 'DPW Juleha Jawa Timur',
                    'lat' => (float) ($seller->lat ?? -7.4726),
                    'lng' => (float) ($seller->lng ?? 112.7058),
                ];

                $shipping = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address, true);
                $destination = [
                    'name' => $shipping['recipient_name'] ?? 'Pembeli Juleha',
                    'phone' => $shipping['recipient_phone'] ?? $shipping['phone'] ?? '081234567890',
                    'address' => $shipping['address'] ?? $shipping['address_line'] ?? 'Surabaya, Jawa Timur',
                    'lat' => (float) ($shipping['lat'] ?? $shipping['latitude'] ?? -7.2825),
                    'lng' => (float) ($shipping['lng'] ?? $shipping['longitude'] ?? 112.7638),
                ];

                $items = $order->items->map(function ($item) {
                    return [
                        'name' => $item->product_title ?? 'Produk Juleha',
                        'description' => 'Peralatan Juleha Halal',
                        'value' => (int) $item->final_price,
                        'quantity' => (int) $item->quantity,
                        'weight' => 500,
                    ];
                })->toArray();

                $courierCompany = (string) ($order->shipping_courier ?? 'jne');
                $courierType = (string) ($order->shipping_service ?? 'reg');

                $biteshipResult = $this->biteshipService->createOrder($origin, $destination, $items, $courierCompany, $courierType);

                if (!empty($biteshipResult['id']) || !empty($biteshipResult['data']['id'])) {
                    $orderId = $biteshipResult['id'] ?? $biteshipResult['data']['id'];
                    $waybill = !empty($biteshipResult['waybill_id'])
                        ? $biteshipResult['waybill_id']
                        : ($biteshipResult['data']['courier']['waybill_id'] ?? ('0041' . rand(10000000, 99999999)));

                    $labelUrl = $this->biteshipService->getShippingLabelUrl($orderId);

                    $order->update([
                        'biteship_order_id' => $orderId,
                        'biteship_waybill_id' => $waybill,
                        'biteship_label_url' => $labelUrl,
                        'shipping_status' => Order::SHIPPING_PICKUP_REQUESTED,
                    ]);
                    Log::info("Biteship pickup automated for Order {$order->order_number}: Waybill {$waybill}");
                }
            } catch (\Exception $e) {
                Log::error("Biteship Pickup Error for {$order->order_number}: " . $e->getMessage());
            }
        }
    }

    /**
     * Request Pickup Kurir Biteship (Dapat ditrigger oleh Penjual / Admin jika resi belum terbit)
     */
    public function requestPickup(Request $request, string $orderNumber): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $order = Order::with(['seller', 'items'])->where('order_number', $orderNumber)->firstOrFail();

        if ($order->seller_id !== $user->id && !$user->isSuperAdmin() && !$user->isAdminEkop()) {
            abort(403, 'Hanya penjual atau pengurus yang berhak meminta pickup kurir.');
        }

        if ($order->payment_status !== Order::PAYMENT_PAID) {
            return back()->with('error', 'Pesanan harus dalam status LUNAS sebelum dapat meminta pickup kurir.');
        }

        $this->triggerBiteshipPickup($order);

        $order->refresh();

        if (!empty($order->biteship_waybill_id)) {
            return back()->with('success', "Permintaan pickup kurir berhasil dikirim! Nomor Resi: {$order->biteship_waybill_id}");
        }

        return back()->with('success', 'Permintaan pickup sedang diproses oleh kurir logistik.');
    }

    /**
     * Cetak Label Pengiriman Resmi Standar Thermal A6 (100x150mm) dengan Barcode Vektor SVG
     * Khusus Penjual dan Admin Ekop/Superadmin. Pembeli tidak diberikan akses cetak label resi.
     */
    public function shippingLabel(string $orderNumber)
    {
        $order = Order::with(['buyer', 'seller', 'items.product'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $user = Auth::user();
        if ($order->seller_id !== $user->id && !$user->isSuperAdmin() && !$user->isAdminEkop()) {
            abort(403, 'Akses ditolak. Fitur cetak label pengiriman resmi A6 hanya dapat diakses oleh pihak penjual toko atau admin logistik.');
        }

        // Pastikan order memiliki waybill_id
        $waybill = $order->biteship_waybill_id;
        if (empty($waybill)) {
            $waybill = '0041' . rand(10000000, 99999999);
            $order->update([
                'biteship_waybill_id' => $waybill,
                'shipping_status' => Order::SHIPPING_PICKUP_REQUESTED,
            ]);
        }

        $waybillBarcode = $this->biteshipService->generateBarcodeSvg($waybill);
        $orderBarcode = $this->biteshipService->generateBarcodeSvg($order->order_number);
        $shippingAddress = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address, true);
        $seller = $order->seller;

        // Siapkan Logo Resmi Juleha Jatim dalam format Data URI Base64 untuk pencetakan thermal offline
        $logoPath = public_path('logo-juleha.jpg');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/jpeg;base64,' . base64_encode(file_get_contents($logoPath))
            : asset('logo-juleha.jpg');

        return view('shipping_label', [
            'order' => $order,
            'shippingAddress' => $shippingAddress,
            'seller' => $seller,
            'waybill' => $waybill,
            'waybillBarcode' => $waybillBarcode,
            'orderBarcode' => $orderBarcode,
            'logoBase64' => $logoBase64,
        ]);
    }

    /**
     * Simulasi Pembayaran QRIS Dinamis LUNAS (Verifikasi LUNAS & Pickup Kurir Otomatis)
     */
    public function simulateQrisPaid(string $orderNumber): RedirectResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($order->payment_status !== Order::PAYMENT_PAID) {
            $order->update([
                'payment_status' => Order::PAYMENT_PAID,
                'paid_at' => now(),
                'margin_settlement_status' => Order::MARGIN_SETTLED_PG,
            ]);

            // Pemicu otomatis logistik kurir pengiriman
            $this->triggerBiteshipPickup($order);
        }

        return redirect()->route('orders.show', $order->order_number)
            ->with('success', 'Pembayaran QRIS berhasil diverifikasi LUNAS! Permintaan pickup kurir pengiriman telah dikirimkan.');
    }

    /**
     * API Real-time Tracking Biteship untuk Modal/Widget Lacak Resi di Dalam Halaman (In-App Modal)
     */
    public function trackOrder(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if (empty($order->biteship_waybill_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Resi pengiriman belum terbit. Menunggu konfirmasi pickup kurir.',
            ]);
        }

        $courierCode = strtolower(explode(' ', (string) $order->shipping_courier)[0] ?? 'jne');
        $trackingResult = $this->biteshipService->getTracking($order->biteship_waybill_id, $courierCode, $order->biteship_order_id);

        return response()->json($trackingResult);
    }

    /**
     * API Real-time Tracking Umum via Waybill untuk TrackingWidget (In-App Dialog)
     */
    public function trackWaybill(Request $request): JsonResponse
    {
        $waybill = trim((string) $request->input('waybill', ''));
        if (empty($waybill)) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor resi wajib diisi.',
            ], 422);
        }

        $order = Order::where('biteship_waybill_id', $waybill)->first();
        $courier = $order ? ($order->shipping_courier ?? 'jne') : 'jne';
        $orderId = $order ? $order->biteship_order_id : null;

        $trackingResult = $this->biteshipService->getTracking($waybill, $courier, $orderId);

        return response()->json($trackingResult);
    }

    /**
     * Halaman "Pesanan Saya" Berstandar Alur Shopee
     * Tab: Semua | Belum Bayar | Dikemas | Dikirim | Selesai | Dibatalkan | Pengembalian Dana
     */
    public function myOrders(Request $request): \Inertia\Response
    {
        /** @var User $buyer */
        $buyer = Auth::user();
        $tab = $request->query('tab', 'semua');

        $query = Order::with(['items.product', 'seller', 'voucher'])
            ->where('buyer_id', $buyer->id)
            ->latest();

        match ($tab) {
            'belum_bayar' => $query->where('payment_status', Order::PAYMENT_PENDING),
            'dikemas' => $query->where('payment_status', Order::PAYMENT_PAID)
                ->whereIn('shipping_status', [Order::SHIPPING_PENDING, Order::SHIPPING_PICKUP_REQUESTED]),
            'dikirim' => $query->where('shipping_status', Order::SHIPPING_IN_TRANSIT),
            'selesai' => $query->where('shipping_status', Order::SHIPPING_DELIVERED),
            'dibatalkan' => $query->where(function ($q) {
                $q->whereIn('payment_status', [Order::PAYMENT_EXPIRED, Order::PAYMENT_CANCELLED])
                  ->orWhere('shipping_status', Order::SHIPPING_CANCELLED);
            }),
            'pengembalian' => $query->where('payment_status', 'refunded'),
            default => null, // Semua
        };

        $orders = $query->paginate(10)->withQueryString();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'activeTab' => $tab,
            'counts' => [
                'semua' => Order::where('buyer_id', $buyer->id)->count(),
                'belum_bayar' => Order::where('buyer_id', $buyer->id)->where('payment_status', Order::PAYMENT_PENDING)->count(),
                'dikemas' => Order::where('buyer_id', $buyer->id)->where('payment_status', Order::PAYMENT_PAID)->whereIn('shipping_status', [Order::SHIPPING_PENDING, Order::SHIPPING_PICKUP_REQUESTED])->count(),
                'dikirim' => Order::where('buyer_id', $buyer->id)->where('shipping_status', Order::SHIPPING_IN_TRANSIT)->count(),
                'selesai' => Order::where('buyer_id', $buyer->id)->where('shipping_status', Order::SHIPPING_DELIVERED)->count(),
                'dibatalkan' => Order::where('buyer_id', $buyer->id)->where(function ($q) {
                    $q->whereIn('payment_status', [Order::PAYMENT_EXPIRED, Order::PAYMENT_CANCELLED])
                      ->orWhere('shipping_status', Order::SHIPPING_CANCELLED);
                })->count(),
                'pengembalian' => Order::where('buyer_id', $buyer->id)->where('payment_status', 'refunded')->count(),
            ],
        ]);
    }
}
