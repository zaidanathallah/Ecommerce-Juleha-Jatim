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
            if (!Schema::hasColumn('orders', 'pg_channel_code')) {
                $table->string('pg_channel_code', 30)->nullable()->after('payment_method_type');
            }
            if (!Schema::hasColumn('orders', 'pg_payment_name')) {
                $table->string('pg_payment_name', 100)->nullable()->after('pg_channel_code');
            }
            if (!Schema::hasColumn('orders', 'pg_va_number')) {
                $table->string('pg_va_number', 50)->nullable()->after('pg_payment_name');
            }
            if (!Schema::hasColumn('orders', 'pg_trx_reference')) {
                $table->string('pg_trx_reference', 100)->nullable()->after('pg_va_number');
            }
            if (!Schema::hasColumn('orders', 'pg_payment_image')) {
                $table->text('pg_payment_image')->nullable()->after('pg_trx_reference');
            }
            if (!Schema::hasColumn('orders', 'pg_payment_instructions')) {
                $table->text('pg_payment_instructions')->nullable()->after('pg_payment_image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'pg_channel_code',
                'pg_payment_name',
                'pg_va_number',
                'pg_trx_reference',
                'pg_payment_image',
                'pg_payment_instructions',
            ]);
        });
    }
};
