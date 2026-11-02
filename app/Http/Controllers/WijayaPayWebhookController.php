<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\BiteshipService;
use App\Services\WijayaPayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WijayaPayWebhookController extends Controller
{
    /**
     * Endpoint Notifikasi Webhook Pembayaran Gateway QRIS Dinamis
     * Endpoint: POST /webhook/wijayapay
     */
    public function handle(Request $request, BiteshipService $biteship, WijayaPayService $wijayaPay): JsonResponse
    {
        $clientIp = $request->ip();
        $payload = $request->all();

        Log::info('Payment Gateway Webhook Received', [
            'client_ip' => $clientIp,
            'payload' => $payload,
        ]);

        // 1. Verifikasi Whitelist IP (172.235.245.77)
        if (!$wijayaPay->isIpWhitelisted($clientIp)) {
            Log::warning("Payment Gateway Webhook Rejected: IP {$clientIp} not in whitelist.");
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized IP address.',
            ], 403);
        }

        // 2. Ambil parameter transaksi
        $refId = $payload['ref_id'] ?? $payload['data']['ref_id'] ?? $payload['order_id'] ?? null;
        $status = strtolower((string) ($payload['status'] ?? $payload['data']['status'] ?? ''));

        if (!$refId) {
            Log::warning('Payment Gateway Webhook Missing ref_id parameter', $payload);
            return response()->json([
                'status' => 'error',
                'message' => 'Parameter ref_id tidak ditemukan.',
            ], 400);
        }

        // 3. Cari pesanan di database
        $order = Order::with(['seller', 'items.product'])->where('order_number', $refId)->first();

        if (!$order) {
            Log::warning("Payment Gateway Webhook: Pesanan {$refId} tidak ditemukan di database.");
            return response()->json([
                'status' => 'error',
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        // 4. Update status pembayaran jika statusnya sukses / lunas
        if (in_array($status, ['success', 'paid', 'lunas', 'berhasil'])) {
            if ($order->payment_status !== Order::PAYMENT_PAID) {
                $order->update([
                    'payment_status' => Order::PAYMENT_PAID,
                    'paid_at' => now(),
                    'margin_settlement_status' => Order::MARGIN_SETTLED_PG,
                ]);

                Log::info("Pesanan {$order->order_number} berhasil diverifikasi LUNAS via Webhook Gateway.");

                // Memicu otomasi logistik kurir jika menggunakan integrasi pengiriman otomatis
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

                        $biteshipResult = $biteship->createOrder($origin, $destination, $items, $courierCompany, $courierType);

                        if (!empty($biteshipResult['id']) || !empty($biteshipResult['data']['id'])) {
                            $orderId = $biteshipResult['id'] ?? $biteshipResult['data']['id'];
                            $waybill = !empty($biteshipResult['waybill_id'])
                                ? $biteshipResult['waybill_id']
                                : ($biteshipResult['data']['courier']['waybill_id'] ?? ('0041' . rand(10000000, 99999999)));

                            $labelUrl = $biteship->getShippingLabelUrl($orderId);

                            $order->update([
                                'biteship_order_id' => $orderId,
                                'biteship_waybill_id' => $waybill,
                                'biteship_label_url' => $labelUrl,
                                'shipping_status' => Order::SHIPPING_PICKUP_REQUESTED,
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::error("Pickup Error via Webhook for {$order->order_number}: " . $e->getMessage());
                    }
                }
            }
        }

        // Return status sukses ke server gateway
        return response()->json([
            'status' => 'success',
            'message' => 'Webhook pembayaran berhasil diproses.',
            'ref_id' => $refId,
        ], 200);
    }
}
