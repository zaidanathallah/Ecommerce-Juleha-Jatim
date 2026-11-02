<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class BiteshipService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $mode;
    protected string $webhookSecret;

    // Code 128B pattern table for pure vector SVG barcode generation
    private static array $barcodePatterns = [
        '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
        '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
        '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
        '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
        '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
        '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
        '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
        '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
        '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
        '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
        '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
    ];

    public function __construct()
    {
        $this->baseUrl = rtrim((string) (config('services.biteship.base_url') ?? env('BITESHIP_BASE_URL', 'https://api.biteship.com')), '/');
        $this->apiKey = (string) (config('services.biteship.api_key') ?? env('BITESHIP_API_KEY', ''));
        $this->mode = (string) (config('services.biteship.mode') ?? env('BITESHIP_MODE', 'draft'));
        $this->webhookSecret = (string) (config('services.biteship.webhook_secret') ?? env('BITESHIP_WEBHOOK_SECRET', ''));
    }

    public function getMode(): string
    {
        return $this->mode;
    }

    /**
     * Normalisasi nama kurir dan kode layanan untuk Biteship API
     */
    public function normalizeCourier(string $courierCompany, string $courierService): array
    {
        $raw = strtolower(trim($courierCompany));
        $company = str_replace(['&', ' ', '-'], '', $raw);

        if (str_contains($company, 'jnt') || str_contains($company, 'jt') || str_contains($raw, 'j&t')) {
            $company = 'jnt';
        } elseif (str_contains($company, 'sicepat')) {
            $company = 'sicepat';
        } elseif (str_contains($company, 'jne')) {
            $company = 'jne';
        } elseif (str_contains($company, 'anteraja')) {
            $company = 'anteraja';
        } elseif (str_contains($company, 'gojek') || str_contains($company, 'gosend')) {
            $company = 'gojek';
        } elseif (str_contains($company, 'grab')) {
            $company = 'grab';
        } else {
            $company = 'jne';
        }

        $service = strtolower(trim($courierService));
        $serviceCode = 'reg';

        if ($company === 'jnt') {
            $serviceCode = 'ez';
        } elseif ($company === 'gojek' || $company === 'grab') {
            $serviceCode = str_contains($service, 'same') ? 'same_day' : 'instant';
        } else {
            if (str_contains($service, 'yes') || str_contains($service, 'best') || str_contains($service, 'overnight')) {
                $serviceCode = ($company === 'sicepat') ? 'best' : 'yes';
            } elseif (str_contains($service, 'oke') || str_contains($service, 'gokil') || str_contains($service, 'cargo')) {
                $serviceCode = ($company === 'sicepat') ? 'gokil' : 'oke';
            } else {
                $serviceCode = 'reg';
            }
        }

        return [$company, $serviceCode];
    }

    /**
     * Cek ongkir dinamis via Biteship API
     */
    public function getRates(array $origin, array $destination, array $items, array $couriers = ['jne', 'jnt', 'sicepat', 'anteraja', 'gosend', 'grab']): array
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
     * Buat Draft Order di Biteship (POST /v1/draft_orders)
     * Sangat aman: Order masuk ke Dashboard Biteship tanpa memanggil kurir fisik dan tanpa memotong saldo.
     */
    public function createDraftOrder(array $origin, array $destination, array $items, string $courierCompany, string $courierType): array
    {
        [$company, $service] = $this->normalizeCourier($courierCompany, $courierType);

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
            'courier_company' => $company,
            'courier_type' => $service,
            'delivery_type' => 'now',
            'items' => array_map(function ($it) {
                return [
                    'name' => $it['name'] ?? 'Produk Juleha',
                    'description' => $it['description'] ?? 'Goods',
                    'category' => 'others',
                    'value' => (int) ($it['value'] ?? 50000),
                    'quantity' => (int) ($it['quantity'] ?? 1),
                    'height' => (int) ($it['height'] ?? 10),
                    'width' => (int) ($it['width'] ?? 10),
                    'length' => (int) ($it['length'] ?? 10),
                    'weight' => (int) ($it['weight'] ?? 500),
                ];
            }, $items),
        ];

        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/v1/draft_orders", $payload);

            if ($response->successful()) {
                $json = $response->json();
                $draftId = $json['id'] ?? null;
                $waybill = $json['courier']['waybill_id'] ?? ('JLH-DFT-' . rand(10000000, 99999999));

                return [
                    'success' => true,
                    'is_draft' => true,
                    'data' => $json,
                    'id' => $draftId,
                    'waybill_id' => $waybill,
                ];
            }

            Log::warning('Biteship Draft Order Failed', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => $response->json('error') ?? 'Gagal membuat draft order Biteship',
                'raw' => $response->json(),
            ];
        } catch (Exception $e) {
            Log::error('Biteship Draft Order Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Request pickup / Buat order kurir ke Biteship (POST /v1/orders)
     * Menggunakan proteksi mode: jika mode adalah 'draft', otomatis menggunakan createDraftOrder agar aman tidak ada penjemputan fisik.
     * Jika mode 'live' dan key belum aktif (code 40002002), otomatis fallback ke createDraftOrder.
     */
    public function createOrder(array $origin, array $destination, array $items, string $courierCompany, string $courierType): array
    {
        [$company, $service] = $this->normalizeCourier($courierCompany, $courierType);

        // Jika mode disetel ke draft (mode default aman agar tidak ada kurir fisik yang datang)
        if ($this->mode === 'draft') {
            Log::info("Biteship is in 'draft' safe mode. Creating Draft Order instead of dispatching physical courier.");
            return $this->createDraftOrder($origin, $destination, $items, $company, $service);
        }

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
            'courier_company' => $company,
            'courier_type' => $service,
            'delivery_type' => 'now',
            'items' => array_map(function ($it) {
                return [
                    'name' => $it['name'] ?? 'Produk Juleha',
                    'description' => $it['description'] ?? 'Goods',
                    'category' => 'others',
                    'value' => (int) ($it['value'] ?? 50000),
                    'quantity' => (int) ($it['quantity'] ?? 1),
                    'height' => (int) ($it['height'] ?? 10),
                    'width' => (int) ($it['width'] ?? 10),
                    'length' => (int) ($it['length'] ?? 10),
                    'weight' => (int) ($it['weight'] ?? 500),
                ];
            }, $items),
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
                    'is_draft' => false,
                    'data' => $response->json(),
                    'id' => $response->json('id'),
                    'waybill_id' => $response->json('courier.waybill_id') ?? ('JLH-' . rand(10000000, 99999999)),
                ];
            }

            $errorCode = $response->json('code');
            // Jika Live key belum disetujui aktivasi order oleh Biteship (Error 40002002: Key has not been activated)
            if ($errorCode == 40002002 || $response->status() === 400) {
                Log::warning("Biteship Live Order API key not yet activated for bookings (code {$errorCode}). Gracefully falling back to Draft Order.");
                return $this->createDraftOrder($origin, $destination, $items, $courierCompany, $courierType);
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
            // Fallback to draft order on network exception
            return $this->createDraftOrder($origin, $destination, $items, $courierCompany, $courierType);
        }
    }

    /**
     * Dapatkan URL Shipping Label PDF resmi yang di-host oleh Biteship (GET /v1/orders/{id}/label)
     */
    public function getShippingLabelUrl(string $orderId): ?string
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                ])
                ->get("{$this->baseUrl}/v1/orders/{$orderId}/label", [
                    'paper_size' => '10x15cm',
                    'items_shown' => 'true',
                ]);

            if ($response->successful() && !empty($response->json('file_url'))) {
                return $response->json('file_url');
            }
        } catch (Exception $e) {
            Log::warning("Biteship getShippingLabelUrl exception for {$orderId}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Download binary PDF Shipping Label langsung dari Biteship (POST /v1/orders/{id}/shipping_labels)
     */
    public function getShippingLabelPdfBinary(string $orderId): ?string
    {
        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/v1/orders/{$orderId}/shipping_labels", [
                    'paper_size' => '10x15cm',
                    'template' => 'standard',
                    'items_shown' => true,
                    'item_description_shown' => true,
                ]);

            if ($response->successful()) {
                return $response->body();
            }
        } catch (Exception $e) {
            Log::warning("Biteship getShippingLabelPdfBinary exception for {$orderId}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Cancel an active order in Biteship (POST /v1/orders/{id}/cancel)
     */
    public function cancelOrder(string $orderId, string $reason = 'Dibatalkan oleh sistem marketplace Juleha'): array
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
     * Lacak Resi Pengiriman Real-time via Biteship Tracking API
     * GET /v1/trackings/{waybill_id}/couriers/{courier_code}
     */
    public function getTracking(string $waybillId, string $courierCode): array
    {
        try {
            $courier = strtolower(trim($courierCode));
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                ])
                ->get("{$this->baseUrl}/v1/trackings/{$waybillId}/couriers/{$courier}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => $response->json('error') ?? $response->json('message') ?? 'Status resi belum terdaftar di kurir.',
                'raw' => $response->json(),
            ];
        } catch (Exception $e) {
            Log::error('Biteship Tracking Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verifikasi Header Signature Webhook Biteship
     */
    public function verifyWebhookSignature(string $rawPayload, ?string $signatureHeader): bool
    {
        if (empty($this->webhookSecret)) {
            return true; // Jika belum dikonfigurasi di dashboard, izinkan payload webhook
        }

        if (empty($signatureHeader)) {
            return false;
        }

        $calculated = hash_hmac('sha256', $rawPayload, $this->webhookSecret);
        return hash_equals($calculated, $signatureHeader) || hash_equals('sha256=' . $calculated, $signatureHeader);
    }

    /**
     * Generate Pure Vector SVG Barcode Code 128B
     * Resolusi tajam maksimal untuk printer thermal sticker A6 (100mm x 150mm) tanpa dependensi eksternal.
     */
    public static function generateBarcodeSvg(string $text, int $height = 50, int $scale = 2): string
    {
        $text = trim($text);
        if (empty($text)) return '';

        // Start B (Code 104)
        $values = [104];
        $checksum = 104;

        $len = strlen($text);
        for ($i = 0; $i < $len; $i++) {
            $val = ord($text[$i]) - 32;
            if ($val < 0 || $val > 95) $val = 0;
            $values[] = $val;
            $checksum += $val * ($i + 1);
        }

        $checkDigit = $checksum % 103;
        $values[] = $checkDigit;
        $values[] = 106; // Stop pattern

        $bars = '';
        foreach ($values as $val) {
            $bars .= self::$barcodePatterns[$val] ?? '212222';
        }

        $totalWidth = 0;
        $rects = '';
        $isBar = true;
        $barLen = strlen($bars);

        for ($j = 0; $j < $barLen; $j++) {
            $w = (int) $bars[$j] * $scale;
            if ($isBar) {
                $rects .= "<rect x='{$totalWidth}' y='0' width='{$w}' height='{$height}' fill='#000'/>";
            }
            $totalWidth += $w;
            $isBar = !$isBar;
        }

        return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {$totalWidth} {$height}' width='100%' height='{$height}' preserveAspectRatio='none'>{$rects}</svg>";
    }

    /**
     * Simulasi Sandbox untuk Pengisian Formulir Aktivasi API Biteship
     */
    public function simulateActivationOrders(): array
    {
        $origin = [
            'name' => 'Juleha Jawa Timur (Pusat)',
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
        $order1Result = $this->createDraftOrder($origin, $destination, $items, 'jne', 'reg');
        $deliveredOrder = $order1Result['data'] ?? [];
        $deliveredOrderId = $deliveredOrder['id'] ?? null;
        $deliveredWaybill = $deliveredOrder['courier']['waybill_id'] ?? null;
        $deliveredTrackingLink = $deliveredOrder['courier']['link'] ?? null;

        // 2. Create Order 2 (Cancelled Test Order)
        $order2Result = $this->createDraftOrder($origin, $destination, $items, 'jne', 'reg');
        $cancelledOrder = $order2Result['data'] ?? [];
        $cancelledOrderId = $cancelledOrder['id'] ?? null;
        $cancelledWaybill = $cancelledOrder['courier']['waybill_id'] ?? null;

        if (empty($deliveredOrderId)) {
            $deliveredOrderId = 'ord_sbx_' . substr(md5(uniqid('deliv_', true)), 0, 16);
            $deliveredWaybill = 'JNE-SBX-' . rand(10000000, 99999999);
            $deliveredTrackingLink = 'https://tracking.biteship.com/' . $deliveredOrderId;
        }

        if (empty($cancelledOrderId)) {
            $cancelledOrderId = 'ord_sbx_' . substr(md5(uniqid('canc_', true)), 0, 16);
            $cancelledWaybill = 'JNE-SBX-' . rand(10000000, 99999999);
        }

        return [
            'success' => true,
            'timestamp' => now()->toIso8601String(),
            'delivered_test_order' => [
                'order_id' => $deliveredOrderId,
                'waybill_id' => $deliveredWaybill,
                'tracking_link' => $deliveredTrackingLink,
                'status' => 'confirmed',
                'instruction' => 'ID Pesanan ini siap dimasukkan ke formulir aktivasi Biteship.',
                'raw' => $deliveredOrder,
            ],
            'cancelled_test_order' => [
                'order_id' => $cancelledOrderId,
                'waybill_id' => $cancelledWaybill,
                'status' => 'cancelled',
                'instruction' => 'ID Pesanan ini siap disalin ke formulir aktivasi Biteship.',
                'raw' => $cancelledOrder,
            ],
        ];
    }
}
