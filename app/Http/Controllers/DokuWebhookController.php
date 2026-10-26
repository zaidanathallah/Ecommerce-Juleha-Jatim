<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\BiteshipService;
use App\Services\DokuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DokuWebhookController extends Controller
{
    /**
     * Handle payment notification from DOKU
     * Endpoint: POST /webhook/doku
     */
    public function handle(Request $request, BiteshipService $biteship, DokuService $doku): JsonResponse
    {
        $rawBody = $request->getContent();
        $payload = $request->json()->all();

        Log::info('DOKU Webhook Notification Received', [
            'headers' => $request->headers->all(),
            'body' => $payload,
        ]);

        // 1. Signature Verification
        $signature = $request->header('X-SIGNATURE') ?? $request->header('Signature');
        $timestamp = $request->header('X-TIMESTAMP') ?? $request->header('Request-Timestamp');
        $clientId = $request->header('X-PARTNER-ID') ?? $request->header('Client-Id');
        $externalId = $request->header('X-EXTERNAL-ID') ?? $request->header('Request-Id');
        $authHeader = $request->header('Authorization', '');
        $accessToken = str_starts_with($authHeader, 'Bearer ') ? substr($authHeader, 7) : '';

        $secretKey = (string) env('DOKU_SECRET_KEY', 'SK-ZyRDS7MBHysv2Tav2ID5');
        $requestPath = '/' . ltrim($request->path(), '/');

        $isValidSignature = false;

        if ($signature && $secretKey) {
            // SNAP standard HMAC-SHA512
            // stringToSign = HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + Lowercase(HexEncode(SHA-256(minify(RequestBody)))) + ":" + TimeStamp
            $bodyHash = strtolower(hash('sha256', $rawBody));
            $snapStringToSign = "POST:{$requestPath}:{$accessToken}:{$bodyHash}:{$timestamp}";
            $expectedSnap = base64_encode(hash_hmac('sha512', $snapStringToSign, $secretKey, true));

            // SNAP without token stringToSign
            $snapStringToSignNoToken = "POST:{$requestPath}::{$bodyHash}:{$timestamp}";
            $expectedSnapNoToken = base64_encode(hash_hmac('sha512', $snapStringToSignNoToken, $secretKey, true));

            // Non-SNAP standard HMAC-SHA256
            $digest = base64_encode(hash('sha256', $rawBody, true));
            $nonSnapStringToSign = "Client-Id:{$clientId}\nRequest-Id:{$externalId}\nRequest-Timestamp:{$timestamp}\nRequest-Target:{$requestPath}\nDigest:{$digest}";
            $expectedNonSnap = base64_encode(hash_hmac('sha256', $nonSnapStringToSign, $secretKey, true));

            if (
                hash_equals($expectedSnap, $signature) ||
                hash_equals($expectedSnapNoToken, $signature) ||
                hash_equals($expectedNonSnap, $signature) ||
                app()->environment('local', 'testing')
            ) {
                $isValidSignature = true;
            }
        } elseif (app()->environment('local', 'testing')) {
            $isValidSignature = true;
        }

        if (!$isValidSignature) {
            Log::warning('DOKU Webhook Rejected: Invalid Signature', [
                'received' => $signature,
                'path' => $requestPath,
            ]);

            return response()->json([
                'responseCode' => '4015600',
                'responseMessage' => 'Unauthorized. Invalid Signature',
            ], 401);
        }

        // 2. Identify Target Order
        $partnerReferenceNo = $payload['originalPartnerReferenceNo']
            ?? $payload['partnerReferenceNo']
            ?? $payload['order']['invoice_number']
            ?? $payload['order_number']
            ?? null;

        if (!$partnerReferenceNo) {
            return response()->json([
                'responseCode' => '4005600',
                'responseMessage' => 'Bad Request. Missing partnerReferenceNo',
            ], 400);
        }

        $order = Order::where('order_number', $partnerReferenceNo)->first();

        if (!$order) {
            Log::warning("DOKU Webhook Order Not Found: {$partnerReferenceNo}");
            return response()->json([
                'responseCode' => '4045600',
                'responseMessage' => 'Order Not Found',
            ], 404);
        }

        // 3. Check Payment Status
        $statusCode = $payload['latestTransactionStatus']
            ?? $payload['transactionStatus']
            ?? $payload['transaction']['status']
            ?? '00';

        // Code '00' = Success in SNAP
        if ($statusCode === '00' || strtoupper((string) $statusCode) === 'SUCCESS') {
            if ($order->payment_status !== Order::PAYMENT_PAID) {
                $order->payment_status = Order::PAYMENT_PAID;
                $order->paid_at = now();

                // If seller uses Biteship shipping, automatically trigger courier pickup
                if ($order->shipping_method_type === Order::SHIPPING_METHOD_BITESHIP) {
                    try {
                        $seller = $order->seller;
                        $origin = [
                            'name' => $seller->name,
                            'phone' => $seller->phone ?? '081234567890',
                            'address' => $seller->address ?? 'DPW Juleha Jawa Timur',
                            'lat' => (float) ($seller->latitude ?? -7.3195),
                            'lng' => (float) ($seller->longitude ?? 112.7300),
                        ];

                        $shipping = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address, true);
                        $destination = [
                            'name' => $shipping['recipient_name'] ?? 'Pembeli Juleha',
                            'phone' => $shipping['phone'] ?? '08123456789',
                            'address' => $shipping['address_line'] ?? 'Jawa Timur',
                            'lat' => (float) ($shipping['latitude'] ?? -7.2650),
                            'lng' => (float) ($shipping['longitude'] ?? 112.7480),
                        ];

                        $items = $order->items->map(function ($item) {
                            return [
                                'name' => $item->product_name,
                                'description' => 'Peralatan Juleha',
                                'value' => (int) $item->unit_price,
                                'quantity' => (int) $item->quantity,
                                'weight' => 500,
                            ];
                        })->toArray();

                        $courierCompany = $order->shipping_courier ?? 'jne';
                        $courierType = $order->shipping_service ?? 'reg';

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
                Log::info("Order {$order->order_number} marked as PAID via DOKU Webhook.");
            }
        }

        // Return SNAP Acknowledgment
        return response()->json([
            'responseCode' => '2005600',
            'responseMessage' => 'Successful',
            'approvalCode' => 'APP' . time(),
        ], 200);
    }
}
