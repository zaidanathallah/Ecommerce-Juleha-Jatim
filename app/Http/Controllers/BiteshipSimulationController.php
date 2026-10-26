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
