<?php

namespace App\Console\Commands;

use App\Services\BiteshipService;
use Illuminate\Console\Command;

class SimulateBiteshipOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'biteship:simulate-orders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulasi Pesanan Sandbox Biteship (Delivered & Cancelled) untuk Formulir Aktivasi API Biteship';

    /**
     * Execute the console command.
     */
    public function handle(BiteshipService $biteship): int
    {
        $this->info("================================================================================");
        $this->info("   DPW JULEHA JAWA TIMUR - BITESHIP SANDBOX ACTIVATION SIMULATOR");
        $this->info("================================================================================");
        $this->comment("Mengirim pesanan dummy ke Sandbox Biteship (POST /v1/orders)...");

        $result = $biteship->simulateActivationOrders();

        if (!$result['success']) {
            $this->error("Gagal melakukan simulasi pesanan ke Sandbox Biteship.");
            $this->line(json_encode($result, JSON_PRETTY_PRINT));
            return self::FAILURE;
        }

        $delivered = $result['delivered_test_order'];
        $cancelled = $result['cancelled_test_order'];

        $this->newLine();
        $this->table(
            ['Tipe Formulir Biteship', 'Order ID (Salin ke Form)', 'Waybill / Resi Test', 'Status Sandbox'],
            [
                ['ID Pesanan Test Terkirim', $delivered['order_id'], $delivered['waybill_id'] ?? '-', 'DELIVERED (Confirmed -> Ready)'],
                ['ID Pesanan Test Dibatalkan', $cancelled['order_id'], $cancelled['waybill_id'] ?? '-', 'CANCELLED (Automated Cancel)'],
            ]
        );

        $this->newLine();
        $this->info("PETUNJUK FORMULIR AKTIVASI API BITESHIP:");
        $this->line("1. Salin ID Pesanan Terkirim   : " . $delivered['order_id']);
        $this->line("   (Buka dashboard Biteship Sandbox -> Orders -> cari ID ini -> klik Delivered jika diperlukan oleh tim QA Biteship).");
        $this->line("2. Salin ID Pesanan Dibatalkan : " . $cancelled['order_id']);
        $this->line("   (Pesanan ini sudah otomatis berstatus CANCELLED via API cancel Biteship).");
        $this->newLine();
        $this->info("Status simulasi: SUKSES!");
        $this->info("================================================================================");

        return self::SUCCESS;
    }
}
