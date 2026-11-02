<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\BiteshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BiteshipWebhookController extends Controller
{
    /**
     * Handle incoming Biteship Webhook events (order.status, order.waybill_id, order.price)
     * Endpoint: POST /webhook/biteship
     */
    public function handle(Request $request, BiteshipService $biteshipService): JsonResponse
    {
        $rawContent = $request->getContent();
        $payload = $request->json()->all();

        Log::info('Biteship Webhook Received', [
            'headers' => $request->headers->all(),
            'body' => $payload,
        ]);

        // Verifikasi Signature jika dikonfigurasi
        $signature = $request->header('X-Biteship-Signature')
            ?? $request->header('Signature')
            ?? $request->header('X-Signature');

        if (!$biteshipService->verifyWebhookSignature($rawContent, $signature)) {
            Log::warning('Biteship Webhook Signature Mismatch', ['received' => $signature]);
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized signature',
            ], 401);
        }

        $event = $payload['event'] ?? 'order.status';
        $data = $payload['data'] ?? $payload;

        $biteshipOrderId = $data['id'] ?? $data['order_id'] ?? null;
        $waybillId = $data['waybill_id'] ?? $data['courier']['waybill_id'] ?? null;
        $status = strtolower((string) ($data['status'] ?? ''));

        if (!$biteshipOrderId && !$waybillId) {
            return response()->json([
                'success' => false,
                'message' => 'Missing order identifiers',
            ], 400);
        }

        // Cari pesanan berdasarkan biteship_order_id atau biteship_waybill_id
        $order = Order::where(function ($q) use ($biteshipOrderId, $waybillId) {
            if ($biteshipOrderId) {
                $q->where('biteship_order_id', $biteshipOrderId);
            }
            if ($waybillId) {
                $q->orWhere('biteship_waybill_id', $waybillId);
            }
        })->first();

        if (!$order) {
            Log::info("Biteship Webhook: Order not found locally for biteship_id: {$biteshipOrderId}, waybill: {$waybillId}");
            return response()->json([
                'success' => true,
                'message' => 'Order not found locally, acknowledged',
            ], 200);
        }

        // Tangani pembaruan Waybill / Resi
        if ($waybillId && empty($order->biteship_waybill_id)) {
            $order->biteship_waybill_id = $waybillId;
            Log::info("Order {$order->order_number}: Waybill ID updated to {$waybillId} via Webhook");
        }

        // Pemetaan status Biteship ke status Order Juleha
        // Status Biteship: allocated, picking_up, picked, dropping_off, in_transit, delivered, cancelled, rejected, return_in_transit, returned
        if (!empty($status)) {
            $order->biteship_tracking_status = $status;

            if (in_array($status, ['delivered'])) {
                $order->shipping_status = Order::SHIPPING_DELIVERED;
                if (!$order->delivered_at) {
                    $order->delivered_at = now();
                }
            } elseif (in_array($status, ['in_transit', 'dropping_off', 'picked'])) {
                $order->shipping_status = Order::SHIPPING_IN_TRANSIT;
            } elseif (in_array($status, ['allocated', 'picking_up', 'confirmed'])) {
                $order->shipping_status = Order::SHIPPING_PICKUP_REQUESTED;
            } elseif (in_array($status, ['cancelled', 'rejected'])) {
                $order->shipping_status = Order::SHIPPING_CANCELLED;
            }
        }

        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Biteship webhook event processed successfully',
            'order_number' => $order->order_number,
        ], 200);
    }
}

