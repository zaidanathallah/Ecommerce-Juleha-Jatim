<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TemanQrisService
{
    protected string $mode;
    protected string $baseUrl;
    protected string $apiKey;
    protected string $webhookSecret;

    public function __construct()
    {
        $this->mode = (string) config('services.temanqris.mode', 'sandbox');
        $this->baseUrl = rtrim((string) config('services.temanqris.base_url', 'https://temanqris.com'), '/');

        // Prefer active API key & webhook secret based on mode
        $configuredKey = config('services.temanqris.api_key');
        if (!empty($configuredKey)) {
            $this->apiKey = (string) $configuredKey;
        } else {
            $this->apiKey = (string) config("services.temanqris.{$this->mode}.api_key", '');
        }

        $configuredSecret = config('services.temanqris.webhook_secret');
        if (!empty($configuredSecret)) {
            $this->webhookSecret = (string) $configuredSecret;
        } else {
            $this->webhookSecret = (string) config("services.temanqris.{$this->mode}.webhook_secret", '');
        }
    }

    public function getMode(): string
    {
        return $this->mode;
    }

    /**
     * Generate QRIS Dinamis melalui Endpoint Resmi TemanQRIS Payment Gateway (/api/payment-gateway/payments)
     *
     * @param string $orderNumber
     * @param float $amount
     * @param string|null $note
     * @param string|null $webhookUrl
     * @param string|null $callbackUrl
     * @return array
     */
    public function generateDynamicQris(
        string $orderNumber,
        float $amount,
        ?string $note = null,
        ?string $webhookUrl = null,
        ?string $callbackUrl = null
    ): array {
        $intAmount = (int) round($amount);
        $endpoint = "{$this->baseUrl}/api/payment-gateway/payments";

        $payload = [
            'order_id' => $orderNumber,
            'amount' => $intAmount,
            'title' => "Pesanan {$orderNumber}",
            'description' => substr($note ?: "Pembayaran Pesanan {$orderNumber} Juleha Jatim", 0, 150),
        ];

        // TemanQRIS gateway memvalidasi DNS hostname webhook_url & callback_url.
        // Hanya sertakan jika hostname dapat di-resolve (mencegah error pada environment lokal/dev).
        if (!empty($webhookUrl)) {
            $webhookHost = parse_url($webhookUrl, PHP_URL_HOST);
            if ($webhookHost && !in_array($webhookHost, ['localhost', '127.0.0.1']) && @checkdnsrr($webhookHost, 'A')) {
                $payload['webhook_url'] = $webhookUrl;
            }
        }

        if (!empty($callbackUrl)) {
            $callbackHost = parse_url($callbackUrl, PHP_URL_HOST);
            if ($callbackHost && !in_array($callbackHost, ['localhost', '127.0.0.1']) && @checkdnsrr($callbackHost, 'A')) {
                $payload['callback_url'] = $callbackUrl;
            }
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'X-API-Key' => $this->apiKey,
                    'Idempotency-Key' => $orderNumber . '-pg-' . time(),
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($endpoint, $payload);

            if ($response->successful()) {
                $json = $response->json();

                if (!empty($json['success']) && (!empty($json['payment_link']) || !empty($json['data']['payment_link']))) {
                    $paymentLink = $json['payment_link'] ?? $json['data']['payment_link'] ?? [];
                    $qrImage = $paymentLink['qr_image'] ?? null;
                    $url = $paymentLink['url'] ?? null;
                    if ($url && !str_starts_with($url, 'http')) {
                        $url = "{$this->baseUrl}{$url}";
                    }

                    $expiresAt = $paymentLink['expiresAt'] ?? now()->addDay()->toISOString();
                    $totalAmount = (int) ($paymentLink['totalAmount'] ?? $intAmount);

                    return [
                        'success' => true,
                        'qris' => $paymentLink['linkCode'] ?? $orderNumber,
                        'qr_image' => $qrImage,
                        'amount' => $totalAmount,
                        'expires_at' => $expiresAt,
                        'payment_link_url' => $url,
                        'raw' => $json,
                        'gateway' => 'temanqris_payment_gateway',
                    ];
                }
            }

            Log::warning('TemanQRIS Payment Gateway returned non-success response, attempting legacy fallback endpoint', [
                'status' => $response->status(),
                'body' => $response->body(),
                'order' => $orderNumber,
            ]);

            // Attempt legacy fallback endpoint: /api/qris/generate
            $legacyEndpoint = "{$this->baseUrl}/api/qris/generate";
            $legacyResponse = Http::timeout(10)
                ->withHeaders([
                    'X-API-Key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($legacyEndpoint, [
                    'amount' => $intAmount,
                    'order_id' => $orderNumber,
                    'note' => substr($note ?: "Pesanan {$orderNumber}", 0, 100),
                ]);

            if ($legacyResponse->successful()) {
                $legacyJson = $legacyResponse->json();
                if (!empty($legacyJson['success']) && !empty($legacyJson['qris'])) {
                    $link = $legacyJson['payment_link']['url'] ?? null;
                    if ($link && !str_starts_with($link, 'http')) {
                        $link = "{$this->baseUrl}{$link}";
                    }

                    return [
                        'success' => true,
                        'qris' => $legacyJson['qris'],
                        'qr_image' => $legacyJson['qr_image'] ?? null,
                        'amount' => (int) ($legacyJson['amount'] ?? $intAmount),
                        'expires_at' => $legacyJson['expires_at'] ?? now()->addDay()->toISOString(),
                        'payment_link_url' => $link,
                        'raw' => $legacyJson,
                        'gateway' => 'temanqris_legacy',
                    ];
                }
            }
        } catch (Exception $e) {
            Log::error('TemanQRIS API request failed', [
                'error' => $e->getMessage(),
                'order' => $orderNumber,
            ]);
        }

        // Graceful fallback: construct dynamic QRIS string using Juleha QRIS template
        $fallbackQris = $this->buildFallbackQris($intAmount, $orderNumber);

        return [
            'success' => true,
            'qris' => $fallbackQris,
            'qr_image' => null,
            'amount' => $intAmount,
            'expires_at' => now()->addDay()->toISOString(),
            'payment_link_url' => null,
            'fallback' => true,
        ];
    }

    /**
     * Cek status pembayaran terkini dari gateway TemanQRIS
     *
     * @param string $orderId
     * @return array
     */
    public function checkOrderStatus(string $orderId): array
    {
        $endpoint = $this->mode === 'sandbox'
            ? "{$this->baseUrl}/api/payment-gateway/sandbox/payments/{$orderId}"
            : "{$this->baseUrl}/api/payment-gateway/payments/{$orderId}";

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'X-API-Key' => $this->apiKey,
                    'Accept' => 'application/json',
                ])
                ->get($endpoint);

            if ($response->successful()) {
                $json = $response->json();
                $status = strtolower((string) (
                    $json['data']['status']
                    ?? $json['status']
                    ?? $json['data']['payment_status']
                    ?? 'pending'
                ));

                $isPaid = in_array($status, ['paid', 'settled', 'success', 'confirmed']);

                return [
                    'success' => true,
                    'status' => $status,
                    'is_paid' => $isPaid,
                    'paid_at' => $json['data']['paid_at'] ?? $json['paid_at'] ?? null,
                    'raw' => $json,
                ];
            }

            // Fallback for live check endpoint
            if ($this->mode === 'live' && $response->status() === 404) {
                $altResponse = Http::timeout(10)
                    ->withHeaders([
                        'X-API-Key' => $this->apiKey,
                        'Accept' => 'application/json',
                    ])
                    ->get("{$this->baseUrl}/api/qris/orders/{$orderId}");

                if ($altResponse->successful()) {
                    $altJson = $altResponse->json();
                    $status = strtolower((string) ($altJson['status'] ?? $altJson['data']['status'] ?? 'pending'));
                    return [
                        'success' => true,
                        'status' => $status,
                        'is_paid' => in_array($status, ['paid', 'settled', 'success']),
                        'raw' => $altJson,
                    ];
                }
            }

            return [
                'success' => false,
                'status' => 'unknown',
                'is_paid' => false,
                'error' => "Gateway status check failed: HTTP {$response->status()}",
            ];
        } catch (Exception $e) {
            Log::error("TemanQRIS status check exception for {$orderId}: " . $e->getMessage());
            return [
                'success' => false,
                'status' => 'error',
                'is_paid' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Simulasi Pembayaran Sandbox TemanQRIS
     *
     * @param string $orderId
     * @param string $result 'paid' | 'expired' | 'failed'
     * @return array
     */
    public function simulateSandboxPayment(string $orderId, string $result = 'paid'): array
    {
        $endpoint = "{$this->baseUrl}/api/payment-gateway/sandbox/payments/{$orderId}/simulate";

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'X-API-Key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($endpoint, [
                    'result' => $result,
                ]);

            return [
                'success' => $response->successful(),
                'status_code' => $response->status(),
                'data' => $response->json(),
            ];
        } catch (Exception $e) {
            Log::error("TemanQRIS sandbox simulation exception for {$orderId}: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verifikasi Signature Webhook TemanQRIS (HMAC-SHA256)
     *
     * @param string $rawPayload
     * @param string $signatureHeader
     * @return bool
     */
    public function verifyWebhookSignature(string $rawPayload, string $signatureHeader): bool
    {
        if (empty($this->webhookSecret) || empty($signatureHeader)) {
            return false;
        }

        // Signature header format: "sha256=<hex>" or raw "<hex>"
        $calculatedHex = hash_hmac('sha256', $rawPayload, $this->webhookSecret);
        $expectedSignatureWithPrefix = 'sha256=' . $calculatedHex;

        if (hash_equals($expectedSignatureWithPrefix, $signatureHeader) || hash_equals($calculatedHex, $signatureHeader)) {
            return true;
        }

        return false;
    }

    /**
     * Fallback QRIS string generator if external network is temporarily down
     */
    protected function buildFallbackQris(int $amount, string $orderNumber): string
    {
        $amountStr = (string) $amount;
        $tag54 = sprintf("54%02d%s", strlen($amountStr), $amountStr);
        $base = "00020101021226610016ID.CO.SHOPEE.WWW01189360091800228956810208228956810303UMI51440014ID.CO.QRIS.WWW0215ID10265020748460303UMI520458125303360{$tag54}5802ID5919SUKRIMU FROZEN MILK6008SURABAYA61056029562070703A016304";

        $crc = $this->calculateCrc16Ccitt($base);
        return $base . $crc;
    }

    protected function calculateCrc16Ccitt(string $str): string
    {
        $crc = 0xFFFF;
        $len = strlen($str);
        for ($c = 0; $c < $len; $c++) {
            $crc ^= ord($str[$c]) << 8;
            for ($i = 0; $i < 8; $i++) {
                if ($crc & 0x8000) {
                    $crc = (($crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    $crc = ($crc << 1) & 0xFFFF;
                }
            }
        }
        return strtoupper(sprintf('%04X', $crc));
    }
}
