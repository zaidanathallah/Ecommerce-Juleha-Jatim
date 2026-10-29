<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TemanQrisService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $webhookSecret;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.temanqris.base_url', 'https://temanqris.com'), '/');
        $this->apiKey = (string) config('services.temanqris.api_key', '');
        $this->webhookSecret = (string) config('services.temanqris.webhook_secret', '');
    }

    /**
     * Generate QRIS Dinamis melalui API resmi TemanQRIS
     * 
     * @param string $orderNumber
     * @param float $amount
     * @param string|null $note
     * @return array
     */
    public function generateDynamicQris(string $orderNumber, float $amount, ?string $note = null): array
    {
        $endpoint = "{$this->baseUrl}/api/qris/generate";
        $intAmount = (int) round($amount);

        $payload = [
            'amount' => $intAmount,
            'order_id' => $orderNumber,
        ];

        if (!empty($note)) {
            $payload['note'] = substr($note, 0, 100);
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'X-API-Key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($endpoint, $payload);

            if ($response->successful()) {
                $json = $response->json();

                if (!empty($json['success']) && !empty($json['qris'])) {
                    $paymentLink = $json['payment_link']['url'] ?? null;
                    if ($paymentLink && !str_starts_with($paymentLink, 'http')) {
                        $paymentLink = "{$this->baseUrl}{$paymentLink}";
                    }

                    return [
                        'success' => true,
                        'qris' => $json['qris'],
                        'qr_image' => $json['qr_image'] ?? null,
                        'amount' => $json['amount'] ?? $intAmount,
                        'expires_at' => $json['expires_at'] ?? now()->addDay()->toISOString(),
                        'payment_link_url' => $paymentLink,
                        'raw' => $json,
                    ];
                }
            }

            Log::warning('TemanQRIS generate returned non-success response', [
                'status' => $response->status(),
                'body' => $response->body(),
                'order' => $orderNumber,
            ]);
        } catch (Exception $e) {
            Log::error('TemanQRIS API request failed', [
                'error' => $e->getMessage(),
                'order' => $orderNumber,
            ]);
        }

        // Graceful fallback: construct dynamic QRIS string from merchant's registered QRIS
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

        // Signature header format: "sha256=<hex>"
        $calculatedHex = hash_hmac('sha256', $rawPayload, $this->webhookSecret);
        $expectedSignatureWithPrefix = 'sha256=' . $calculatedHex;

        if (hash_equals($expectedSignatureWithPrefix, $signatureHeader)) {
            return true;
        }

        if (hash_equals($calculatedHex, $signatureHeader)) {
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
        
        // CRC16-CCITT checksum calculation
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

