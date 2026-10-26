<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\BiteshipService;
use App\Services\DokuService;
use App\Services\PricingService;
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
        protected DokuService $dokuService
    ) {}

    /**
     * Tampilkan Halaman Checkout Dinamis
     */
    public function index(string $slug): Response
    {
        /** @var User $buyer */
        $buyer = Auth::user();

        $product = Product::with(['user', 'category'])
            ->where('slug', $slug)
            ->live()
            ->firstOrFail();

        $seller = $product->user;

        $formattedProduct = $this->pricingService->formatForBuyer($product);

        return Inertia::render('Checkout/Index', [
            'product' => $formattedProduct,
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

        return response()->json($ratesResponse);
    }

    /**
     * Proses Checkout & Generate Pembayaran (DOKU SNAP atau Transfer Manual)
     * Backend recalculation untuk proteksi manipulasi inspect element!
     */
    public function process(Request $request): RedirectResponse
    {
        /** @var User $buyer */
        $buyer = Auth::user();

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'recipient_name' => ['required', 'string', 'max:150'],
            'recipient_phone' => ['required', 'string', 'max:30'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'destination_lat' => ['required', 'numeric'],
            'destination_lng' => ['required', 'numeric'],
            'courier_company' => ['nullable', 'string', 'max:50'],
            'courier_service' => ['nullable', 'string', 'max:50'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:300'],
        ]);

        $product = Product::with('user')->findOrFail($validated['product_id']);
        $seller = $product->user;

        if ($product->stock < 1) {
            return back()->with('error', 'Maaf, stok produk ini telah habis.');
        }

        // Kalkulasi ulang di backend (Directive 5 & SRS Security)
        $basePrice = (float) $product->base_price;
        $ekopMargin = (float) $product->ekop_margin;
        $superMargin = (float) $product->super_margin;
        $finalProductPrice = $basePrice + $ekopMargin + $superMargin;

        $shippingCost = 0.00;
        $shippingCourier = 'Kurir Mandiri Penjual';
        $shippingService = 'COD / Pengiriman Langsung';
        $shippingMethodType = Order::SHIPPING_METHOD_MANUAL;

        if ($seller->is_shipping_api_active) {
            $shippingCost = (float) ($validated['shipping_cost'] ?? 0);
            $shippingCourier = strtoupper((string) ($validated['courier_company'] ?? 'JNE'));
            $shippingService = strtoupper((string) ($validated['courier_service'] ?? 'REG'));
            $shippingMethodType = Order::SHIPPING_METHOD_BITESHIP;
        }

        $grandTotal = $finalProductPrice + $shippingCost;
        $orderNumber = 'JLH-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        // Tentukan metode pembayaran & status hutang kas organisasi
        $paymentMethodType = $seller->is_pg_active
            ? Order::PAYMENT_METHOD_DOKU
            : Order::PAYMENT_METHOD_MANUAL;

        $marginSettlementStatus = $seller->is_pg_active
            ? Order::MARGIN_SETTLED_PG
            : Order::MARGIN_UNSETTLED_DEBT; // Kas belum dipotong, menjadi hutang kas penjual

        $dokuInvoiceNumber = null;
        $dokuQrisContent = null;
        $dokuVaNumber = null;

        // Jika toko menggunakan DOKU SNAP API
        if ($seller->is_pg_active) {
            $dokuInvoiceNumber = $orderNumber;
            // Generate QRIS via SNAP API
            $dokuResult = $this->dokuService->generateQris($orderNumber, $grandTotal, [
                'customer_name' => $validated['recipient_name'],
                'customer_email' => $buyer->email,
            ]);

            if ($dokuResult['success'] && isset($dokuResult['data']['qrContent'])) {
                $dokuQrisContent = $dokuResult['data']['qrContent'];
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
            'doku_invoice_number' => $dokuInvoiceNumber,
            'doku_qris_content' => $dokuQrisContent,
            'doku_va_number' => $dokuVaNumber,
            'doku_channel' => $seller->is_pg_active ? 'QRIS' : 'MANUAL_TRANSFER',
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
        $order = Order::with(['buyer', 'seller', 'items.product'])
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
}
