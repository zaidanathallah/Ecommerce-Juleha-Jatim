<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class DokuService
{
    protected string $baseUrl;
    protected string $clientId;
    protected string $secretKey;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) env('DOKU_BASE_URL', 'https://api-sandbox.doku.com'), '/');
        $this->clientId = (string) env('DOKU_CLIENT_ID', '');
        $this->secretKey = (string) env('DOKU_SECRET_KEY', '');
        $this->apiKey = (string) env('DOKU_API_KEY', '');
    }

    /**
     * Generate SNAP Signature HMAC-SHA256
     */
    public function generateSignature(string $httpMethod, string $endpointUrl, string $body, string $timestamp): string
    {
        // SNAP standard minified body hash
        $bodyHash = strtolower(hash('sha256', $body));
        $stringToSign = "{$httpMethod}:{$endpointUrl}:{$bodyHash}:{$timestamp}";
        
        $signature = hash_hmac('sha256', $stringToSign, $this->secretKey);
        return $signature;
    }

    /**
     * Generate QRIS payment via DOKU SNAP API
     */
    public function generateQris(string $invoiceNumber, float $amount, array $additionalInfo = []): array
    {
        $endpoint = '/qris/v1.0/qr-mpm-generate';
        $timestamp = gmdate('Y-m-d\TH:i:s\Z');
        
        $payload = [
            'partnerReferenceNo' => $invoiceNumber,
            'amount' => [
                'value' => number_format($amount, 2, '.', ''),
                'currency' => 'IDR',
            ],
            'merchantId' => $this->clientId,
            'terminalId' => 'A01',
            'validityPeriod' => 'PT30M', // 30 minutes
            'additionalInfo' => array_merge([
                'channel' => 'QRIS',
                'description' => 'Pembayaran Juleha Marketplace',
            ], $additionalInfo),
        ];

        $jsonBody = json_encode($payload);
        $signature = $this->generateSignature('POST', $endpoint, $jsonBody, $timestamp);

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-CLIENT-KEY' => $this->clientId,
                    'X-TIMESTAMP' => $timestamp,
                    'X-SIGNATURE' => $signature,
                    'X-PARTNER-ID' => $this->clientId,
                    'X-EXTERNAL-ID' => $invoiceNumber,
                ])
                ->post("{$this->baseUrl}{$endpoint}", $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::error('DOKU SNAP QRIS Failed', [
                'status' => $response->status(),
                'response' => $response->body(),
                'invoice' => $invoiceNumber,
            ]);

            return [
                'success' => false,
                'status' => $response->status(),
                'message' => $response->json('responseMessage') ?? 'Gagal membuat QRIS DOKU',
                'raw' => $response->json(),
            ];
        } catch (Exception $e) {
            Log::error('DOKU SNAP Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate Virtual Account via DOKU SNAP API
     */
    public function generateVirtualAccount(string $invoiceNumber, float $amount, string $bank = 'BCA', array $customerInfo = []): array
    {
        $endpoint = '/virtual-accounts/v1.0/transfer-va/create-va';
        $timestamp = gmdate('Y-m-d\TH:i:s\Z');

        $payload = [
            'partnerReferenceNo' => $invoiceNumber,
            'totalAmount' => [
                'value' => number_format($amount, 2, '.', ''),
                'currency' => 'IDR',
            ],
            'bank' => strtoupper($bank),
            'customer' => [
                'name' => $customerInfo['name'] ?? 'Pelanggan Juleha',
                'email' => $customerInfo['email'] ?? 'pelanggan@jualbeli.julehajatim.com',
                'phone' => $customerInfo['phone'] ?? '08123456789',
            ],
            'trxId' => $invoiceNumber,
        ];

        $jsonBody = json_encode($payload);
        $signature = $this->generateSignature('POST', $endpoint, $jsonBody, $timestamp);

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-CLIENT-KEY' => $this->clientId,
                    'X-TIMESTAMP' => $timestamp,
                    'X-SIGNATURE' => $signature,
                    'X-PARTNER-ID' => $this->clientId,
                    'X-EXTERNAL-ID' => $invoiceNumber,
                ])
                ->post("{$this->baseUrl}{$endpoint}", $payload);

            return [
                'success' => $response->successful(),
                'status' => $response->status(),
                'data' => $response->json(),
            ];
        } catch (Exception $e) {
            Log::error('DOKU SNAP VA Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
