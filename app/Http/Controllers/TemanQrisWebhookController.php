<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\BiteshipService;
use App\Services\TemanQrisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TemanQrisWebhookController extends Controller
{
    /**
     * Handle payment notification from TemanQRIS
     * Endpoint: POST /webhook/temanqris
     */
    public function handle(Request $request, BiteshipService $biteship, TemanQrisService $temanQris): JsonResponse
    {
        $rawBody = $request->getContent();
        $payload = $request->json()->all();

        Log::info('TemanQRIS Webhook Received', [
            'headers' => $request->headers->all(),
            'body' => $payload,
        ]);

        // 1. Signature Verification
        $signature = $request->header('X-TemanQRIS-Signature')
            ?? $request->header('X-Signature')
            ?? $request->header('Signature');

        $isValidSignature = false;

        if ($signature) {
            $isValidSignature = $temanQris->verifyWebhookSignature($rawBody, $signature);
        }

        // Allow bypassing signature in local/testing if header not configured
        if (!$isValidSignature && app()->environment('local', 'testing')) {
            $isValidSignature = true;
        }

        if (!$isValidSignature) {
            Log::warning('TemanQRIS Webhook Rejected: Invalid Signature', [
                'received' => $signature,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Invalid Signature',
            ], 401);
        }

        // 2. Identify Target Order
        $orderId = $payload['data']['order_id']
            ?? $payload['order_id']
            ?? $payload['data']['order_number']
            ?? $payload['order_number']
            ?? null;

        if (!$orderId) {
            return response()->json([
                'success' => false,
                'message' => 'Bad Request. Missing order_id',
            ], 400);
        }

        $order = Order::where('order_number', $orderId)->first();

        if (!$order) {
            Log::warning("TemanQRIS Webhook Order Not Found: {$orderId}");
            return response()->json([
                'success' => false,
                'message' => 'Order Not Found',
            ], 404);
        }

        // 3. Check Payment Status
        $event = $payload['event'] ?? 'payment.confirmed';
        $status = strtolower((string) ($payload['data']['status'] ?? $payload['status'] ?? 'paid'));

        if ($status === 'paid' || $status === 'success' || $event === 'payment.confirmed') {
            if ($order->payment_status !== Order::PAYMENT_PAID) {
                $order->payment_status = Order::PAYMENT_PAID;
                $order->paid_at = now();
                $order->margin_settlement_status = Order::MARGIN_SETTLED_PG;

                // Automated Biteship shipping pickup if applicable
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
                                'name' => $item->product_title ?? $item->product_name ?? 'Produk Juleha',
                                'description' => 'Peralatan Juleha Halal',
                                'value' => (int) ($item->final_price ?? $item->unit_price ?? 50000),
                                'quantity' => (int) ($item->quantity ?? 1),
                                'weight' => 500,
                            ];
                        })->toArray();

                        $courierCompany = strtolower((string) ($order->shipping_courier ?? 'jne'));
                        $courierType = strtolower((string) ($order->shipping_service ?? 'reg'));

                        $biteshipResult = $biteship->createOrder($origin, $destination, $items, $courierCompany, $courierType);

                        if (!empty($biteshipResult['data']['id'])) {
                            $order->biteship_order_id = $biteshipResult['data']['id'];
                            $order->biteship_waybill_id = $biteshipResult['data']['courier']['waybill_id'] ?? null;
                            $order->shipping_status = Order::SHIPPING_PICKUP_REQUESTED;
                            Log::info("Biteship pickup automated for Order {$order->order_number}: Waybill {$order->biteship_waybill_id}");
                        }
                    } catch (\Exception $e) {
                        Log::error("Automated Biteship Pickup Error for {$order->order_number}: " . $e->getMessage());
                    }
                }

                $order->save();
                Log::info("Order {$order->order_number} marked as PAID via TemanQRIS Webhook.");
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment processed successfully',
            'order_id' => $order->order_number,
        ], 200);
    }
}

