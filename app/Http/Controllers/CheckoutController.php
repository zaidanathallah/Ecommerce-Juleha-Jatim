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
use App\Services\TemanQrisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected PricingService $pricingService,
        protected BiteshipService $biteshipService,
        protected TemanQrisService $temanQrisService,
        protected ImageUploadService $imageUploadService
    ) {}

    /**
     * Tampilkan Halaman Checkout Dinamis
     */
    public function index(string $slug): Response|\Illuminate\Http\RedirectResponse
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

        return Inertia::render('Checkout/Index', [
            'product' => $formattedProduct,
            'availableVouchers' => $availableVouchers,
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
        $paymentMethodType = $seller->is_pg_active
            ? Order::PAYMENT_METHOD_QRIS
            : Order::PAYMENT_METHOD_MANUAL;

        $marginSettlementStatus = $seller->is_pg_active
            ? Order::MARGIN_SETTLED_PG
            : Order::MARGIN_UNSETTLED_DEBT; // Kas belum dipotong, menjadi hutang kas penjual

        $qrisInvoiceNumber = null;
        $qrisContent = null;
        $qrisImageUrl = null;
        $qrisPaymentUrl = null;

        // Jika toko menggunakan Payment Gateway Resmi QRIS Dinamis (TemanQRIS)
        if ($seller->is_pg_active) {
            $qrisInvoiceNumber = $orderNumber;
            $qrisResult = $this->temanQrisService->generateDynamicQris(
                $orderNumber,
                $grandTotal,
                "Pesanan {$orderNumber} Juleha Jatim"
            );

            if ($qrisResult['success']) {
                $qrisContent = $qrisResult['qris'] ?? null;
                $qrisImageUrl = $qrisResult['qr_image'] ?? null;
                $qrisPaymentUrl = $qrisResult['payment_link_url'] ?? null;
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
            'payment_method_type' => $paymentMethodType,
            'payment_status' => Order::PAYMENT_PENDING,
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
     * Simulasi Pembayaran QRIS Dinamis LUNAS (Memicu Webhook & Pickup Biteship Otomatis)
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

            // Pemicu otomatis kurir Biteship jika metode Biteship aktif
            if ($order->shipping_method_type === Order::SHIPPING_METHOD_BITESHIP) {
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

                    $courierCompany = strtolower($order->shipping_courier ?? 'jne');
                    $courierType = strtolower($order->shipping_service ?? 'reg');

                    $biteshipResult = $this->biteshipService->createOrder($origin, $destination, $items, $courierCompany, $courierType);

                    if (!empty($biteshipResult['data']['id'])) {
                        $order->update([
                            'biteship_order_id' => $biteshipResult['data']['id'],
                            'biteship_waybill_id' => $biteshipResult['data']['courier']['waybill_id'] ?? ('JLH-' . rand(10000000, 99999999)),
                            'shipping_status' => Order::SHIPPING_PICKUP_REQUESTED,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error("Simulate Biteship Pickup Error for {$order->order_number}: " . $e->getMessage());
                }
            }
        }

        return redirect()->route('orders.show', $order->order_number)
            ->with('success', 'Pembayaran QRIS berhasil diverifikasi LUNAS! Permintaan pickup kurir Biteship telah dikirimkan.');
    }

    /**
     * API Real-time Tracking Biteship untuk Modal/Widget Lacak Resi
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
        $trackingResult = $this->biteshipService->getTracking($order->biteship_waybill_id, $courierCode);

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
                $q->where('payment_status', Order::PAYMENT_EXPIRED)
                  ->orWhere('shipping_status', 'cancelled');
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
                    $q->where('payment_status', Order::PAYMENT_EXPIRED)->orWhere('shipping_status', 'cancelled');
                })->count(),
                'pengembalian' => Order::where('buyer_id', $buyer->id)->where('payment_status', 'refunded')->count(),
            ],
        ]);
    }
}
