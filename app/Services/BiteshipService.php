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
}
