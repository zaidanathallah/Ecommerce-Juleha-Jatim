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
            // Drop legacy DOKU columns if they exist
            if (Schema::hasColumn('orders', 'doku_invoice_number')) {
                $table->dropColumn(['doku_invoice_number', 'doku_payment_url', 'doku_qris_content', 'doku_va_number', 'doku_channel']);
            }

            // Add dynamic QRIS (TemanQRIS) fields
            $table->string('qris_invoice_number', 100)->nullable()->after('biteship_tracking_status');
            $table->text('qris_payment_url')->nullable()->after('qris_invoice_number');
            $table->text('qris_content')->nullable()->after('qris_payment_url');
            $table->longText('qris_image_url')->nullable()->after('qris_content');

            // Add Voucher & Discount tracking fields
            $table->foreignId('voucher_id')->nullable()->after('grand_total')->constrained('vouchers')->nullOnDelete();
            $table->string('voucher_code', 50)->nullable()->after('voucher_id');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('voucher_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['voucher_id']);
            $table->dropColumn([
                'qris_invoice_number',
                'qris_payment_url',
                'qris_content',
                'qris_image_url',
                'voucher_id',
                'voucher_code',
                'discount_amount',
            ]);

            $table->string('doku_invoice_number', 100)->nullable();
            $table->text('doku_payment_url')->nullable();
            $table->text('doku_qris_content')->nullable();
            $table->string('doku_va_number', 50)->nullable();
            $table->string('doku_channel', 30)->nullable();
        });
    }
};

