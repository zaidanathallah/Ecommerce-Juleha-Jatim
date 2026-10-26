<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambah seller shop toggles ke tabel users
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_pg_active')->default(true)->after('is_verified');
            $table->boolean('is_shipping_api_active')->default(true)->after('is_pg_active');
            $table->text('seller_bank_details')->nullable()->after('is_shipping_api_active');
        });

        // 2. Tambah kolom mode pembayaran & status hutang kas ke tabel orders
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method_type', 30)->default('doku_snap')->after('doku_channel');
            $table->string('shipping_method_type', 30)->default('biteship')->after('shipping_service');
            $table->string('margin_settlement_status', 30)->default('settled_via_pg')->after('payment_status');
            $table->text('seller_bank_info_snapshot')->nullable()->after('margin_settlement_status');
            $table->string('manual_payment_proof', 500)->nullable()->after('seller_bank_info_snapshot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method_type',
                'shipping_method_type',
                'margin_settlement_status',
                'seller_bank_info_snapshot',
                'manual_payment_proof',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'is_pg_active',
                'is_shipping_api_active',
                'seller_bank_details',
            ]);
        });
    }
};
