<?php

namespace App\Http\Controllers;

use App\Services\BiteshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BiteshipSimulationController extends Controller
{
    /**
     * Endpoint API JSON untuk simulasi Biteship
     * POST /api/biteship-simulate or GET /api/biteship-simulate
     */
    public function apiSimulate(BiteshipService $biteship): JsonResponse
    {
        $result = $biteship->simulateActivationOrders();

        return response()->json([
            'success' => $result['success'],
            'message' => 'Simulasi Sandbox Biteship berhasil dieksekusi.',
            'data' => [
                'delivered_test_order_id' => $result['delivered_test_order']['order_id'],
                'delivered_waybill_id' => $result['delivered_test_order']['waybill_id'] ?? null,
                'cancelled_test_order_id' => $result['cancelled_test_order']['order_id'],
                'cancelled_status' => $result['cancelled_test_order']['cancel_status_response'] ?? 'cancelled',
            ],
            'full_details' => $result,
        ], $result['success'] ? 200 : 500);
    }

    /**
     * Endpoint API JSON untuk Simulasi Cek Ongkir (Rates API) Biteship
     * GET /api/biteship-simulate-rates or POST /api/biteship-simulate-rates
     */
    public function apiSimulateRates(BiteshipService $biteship): JsonResponse
    {
        $origin = [
            'name' => 'Gudang Pusat Juleha',
            'phone' => '081234567890',
            'address' => 'Cilandak, Jakarta Selatan, DKI Jakarta',
            'lat' => -6.2925,
            'lng' => 106.8044,
            'postal_code' => 12430,
        ];

        $destination = [
            'name' => 'Pembeli Juleha Jatim',
            'phone' => '089876543210',
            'address' => 'Wonocolo, Surabaya, Jawa Timur',
            'lat' => -7.3195,
            'lng' => 112.7300,
            'postal_code' => 60237,
        ];

        $items = [
            [
                'name' => 'Bilah Pisau Sembelih Halal Juleha',
                'description' => 'Paket Bilah Standar Uji Ongkir Biteship',
                'value' => 250000,
                'quantity' => 1,
                'weight_gram' => 1000,
            ],
        ];

        $couriers = ['jne', 'sicepat', 'jnt'];

        $result = $biteship->getRates($origin, $destination, $items, $couriers);

        return response()->json([
            'success' => true,
            'hit_status' => $result['success'] ? 'RATES_RECEIVED' : 'HIT_DISPATCHED_TO_BITESHIP',
            'message' => 'Hit API Cek Ongkir (POST /v1/rates/couriers) telah dikirimkan ke server Biteship.',
            'rates' => $result['pricing'] ?? [],
            'biteship_response' => $result,
        ], 200);
    }

    /**
     * UI Halaman Simulasi Biteship untuk Pemilik Sistem
     * GET /biteship/simulation
     */
    public function show(Request $request, BiteshipService $biteship)
    {
        // If query string ?run=1, trigger fresh simulation
        $simulationData = null;
        if ($request->query('run') === '1') {
            $simulationData = $biteship->simulateActivationOrders();
        }

        return Inertia::render('Admin/BiteshipSimulation', [
            'simulationData' => $simulationData,
        ]);
    }
}
