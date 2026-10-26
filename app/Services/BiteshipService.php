<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class BiteshipService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) env('BITESHIP_BASE_URL', 'https://api.biteship.com'), '/');
        $this->apiKey = (string) env('BITESHIP_API_KEY', '');
    }

    /**
     * Cek ongkir dinamis via Biteship API
     * Wajib menyertakan koordinat (latitude & longitude) asal dan tujuan untuk kurir instan/sameday
     */
    public function getRates(array $origin, array $destination, array $items, array $couriers = ['jne', 'jnt', 'sicepat', 'gosend', 'grab']): array
    {
        $payload = [
            'origin_latitude' => (float) ($origin['lat'] ?? 0),
            'origin_longitude' => (float) ($origin['lng'] ?? 0),
            'origin_postal_code' => $origin['postal_code'] ?? null,
            'destination_latitude' => (float) ($destination['lat'] ?? 0),
            'destination_longitude' => (float) ($destination['lng'] ?? 0),
            'destination_postal_code' => $destination['postal_code'] ?? null,
            'couriers' => implode(',', $couriers),
            'items' => array_map(function ($item) {
                return [
                    'name' => $item['name'] ?? 'Produk Juleha',
                    'description' => $item['description'] ?? 'Peralatan Juleha',
                    'value' => (int) ($item['value'] ?? 50000),
                    'quantity' => (int) ($item['quantity'] ?? 1),
                    'weight' => (int) ($item['weight_gram'] ?? 500),
                    'length' => (int) ($item['length_cm'] ?? 10),
                    'width' => (int) ($item['width_cm'] ?? 10),
                    'height' => (int) ($item['height_cm'] ?? 10),
                ];
            }, $items),
        ];

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/v1/rates/couriers", $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'pricing' => $response->json('pricing') ?? [],
                ];
            }

            Log::error('Biteship Rates Failed', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => $response->json('error') ?? 'Gagal menghitung ongkos kirim Biteship',
                'raw' => $response->json(),
            ];
        } catch (Exception $e) {
            Log::error('Biteship Rates Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Request pickup / Buat order kurir ke Biteship
     * Catatan: Biteship memotong Pts saat order dibuat.
     */
    public function createOrder(array $origin, array $destination, array $items, string $courierCompany, string $courierType): array
    {
        $payload = [
            'origin_contact_name' => $origin['name'],
            'origin_contact_phone' => $origin['phone'],
            'origin_address' => $origin['address'],
            'origin_coordinate' => [
                'latitude' => (float) $origin['lat'],
                'longitude' => (float) $origin['lng'],
            ],
            'destination_contact_name' => $destination['name'],
            'destination_contact_phone' => $destination['phone'],
            'destination_address' => $destination['address'],
            'destination_coordinate' => [
                'latitude' => (float) $destination['lat'],
                'longitude' => (float) $destination['lng'],
            ],
            'courier_company' => strtolower($courierCompany),
            'courier_type' => strtolower($courierType),
            'delivery_type' => 'now',
            'items' => $items,
        ];

        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/v1/orders", $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::error('Biteship Create Order Failed', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => $response->json('error') ?? 'Gagal membuat pickup order Biteship',
                'raw' => $response->json(),
            ];
        } catch (Exception $e) {
            Log::error('Biteship Create Order Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Cancel an active order in Biteship
     * POST /v1/orders/{id}/cancel
     */
    public function cancelOrder(string $orderId, string $reason = 'Simulasi Pembatalan Sandbox Biteship Juleha'): array
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/v1/orders/{$orderId}/cancel", [
                    'cancellation_reason_code' => 'others',
                    'cancellation_reason' => $reason,
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'status' => $response->status(),
                'message' => $response->json('error') ?? 'Gagal membatalkan order Biteship',
                'raw' => $response->json(),
            ];
        } catch (Exception $e) {
            Log::error('Biteship Cancel Order Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get single order details from Biteship
     * GET /v1/orders/{id}
     */
    public function getOrder(string $orderId): array
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                ])
                ->get("{$this->baseUrl}/v1/orders/{$orderId}");

            return [
                'success' => $response->successful(),
                'data' => $response->json(),
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Otomatisasi Simulasi Sandbox Biteship untuk Formulir Aktivasi Order API Biteship
     * 1. Menembak POST /v1/orders untuk membuat dummy order 1 (Target Delivered)
     * 2. Menembak POST /v1/orders untuk membuat dummy order 2 (Target Cancelled)
     * 3. Memicu pembatalan untuk dummy order 2 via POST /v1/orders/{id}/cancel
     * 4. Mengembalikan ID kedua pesanan untuk disalin ke formulir aktivasi.
     */
    public function simulateActivationOrders(): array
    {
        $origin = [
            'name' => 'DPW Juleha Jawa Timur (Pusat)',
            'phone' => '081234567890',
            'address' => 'Jl. Gayung Kebonsari No. 50, Wonocolo, Kota Surabaya, Jawa Timur 60231',
            'lat' => -7.3195,
            'lng' => 112.7300,
        ];

        $destination = [
            'name' => 'Customer Test Aktivasi Biteship',
            'phone' => '089876543210',
            'address' => 'Jl. Pemuda No. 10, Embong Kaliasin, Genteng, Kota Surabaya, Jawa Timur 60271',
            'lat' => -7.2650,
            'lng' => 112.7480,
        ];

        $items = [
            [
                'name' => 'Pisau Sembelih Halal Juleha Jatim (Sandbox Test)',
                'description' => 'Peralatan Juleha Standard SNI',
                'value' => 500000,
                'quantity' => 1,
                'weight' => 500,
            ]
        ];

        // 1. Create Order 1 (Delivered Test Order)
        $order1Result = $this->createOrder($origin, $destination, $items, 'jne', 'reg');
        $deliveredOrder = $order1Result['data'] ?? [];
        $deliveredOrderId = $deliveredOrder['id'] ?? null;
        $deliveredWaybill = $deliveredOrder['courier']['waybill_id'] ?? null;
        $deliveredTrackingLink = $deliveredOrder['courier']['link'] ?? null;

        // 2. Create Order 2 (Cancelled Test Order)
        $order2Result = $this->createOrder($origin, $destination, $items, 'jne', 'reg');
        $cancelledOrder = $order2Result['data'] ?? [];
        $cancelledOrderId = $cancelledOrder['id'] ?? null;
        $cancelledWaybill = $cancelledOrder['courier']['waybill_id'] ?? null;

        // 3. Trigger cancellation on Order 2
        $cancelResult = [];
        if ($cancelledOrderId) {
            $cancelResult = $this->cancelOrder($cancelledOrderId, 'Simulasi Pembatalan Wajib untuk Formulir Aktivasi Biteship');
        }

        return [
            'success' => (!empty($deliveredOrderId) && !empty($cancelledOrderId)),
            'timestamp' => now()->toIso8601String(),
            'delivered_test_order' => [
                'order_id' => $deliveredOrderId,
                'waybill_id' => $deliveredWaybill,
                'tracking_link' => $deliveredTrackingLink,
                'status' => 'confirmed',
                'instruction' => 'ID Pesanan ini siap dimasukkan ke formulir aktivasi Biteship. Untuk status Delivered di Sandbox, silakan buka dashboard Biteship (Testing Mode) -> Orders -> Order ID ini -> klik toggle simulate Delivered.',
                'raw' => $deliveredOrder,
            ],
            'cancelled_test_order' => [
                'order_id' => $cancelledOrderId,
                'waybill_id' => $cancelledWaybill,
                'status' => 'cancelled',
                'cancel_status_response' => $cancelResult['data']['status'] ?? 'cancelled',
                'instruction' => 'ID Pesanan ini telah otomatis dibatalkan via API Biteship (/v1/orders/{id}/cancel) dengan status CANCELLED. Siap disalin langsung ke formulir aktivasi Biteship.',
                'raw' => $cancelledOrder,
            ],
        ];
    }
}

