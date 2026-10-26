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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('transfer_receipt_path', 500)->nullable()->after('manual_payment_proof');
            $table->string('delivery_receipt_path', 500)->nullable()->after('transfer_receipt_path');
            $table->integer('received_quantity')->nullable()->after('delivery_receipt_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'transfer_receipt_path',
                'delivery_receipt_path',
                'received_quantity',
            ]);
        });
    }
};
