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
        // 1. Add Flash Sale columns to products table
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_flash_sale')->default(false)->after('status');
            $table->decimal('flash_sale_price', 12, 2)->nullable()->after('is_flash_sale');
            $table->integer('flash_sale_discount_percent')->default(0)->after('flash_sale_price');
            $table->integer('flash_sale_stock')->default(0)->after('flash_sale_discount_percent');
            $table->timestamp('flash_sale_end')->nullable()->after('flash_sale_stock');
        });

        // 2. Create vouchers table (Gratis Ongkir & Diskon Toko / Global)
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('title', 150);
            $table->string('description', 255)->nullable();
            $table->enum('type', ['free_shipping', 'discount_percent', 'discount_fixed'])->default('free_shipping');
            $table->decimal('discount_amount', 12, 2)->default(0); // nominal potongan rupiah atau persen (misal 10 untuk 10%)
            $table->decimal('min_spend', 12, 2)->default(0); // minimal belanja
            $table->decimal('max_discount', 12, 2)->nullable(); // batas maksimal diskon untuk tipe persen
            $table->enum('scope', ['global', 'regional', 'seller'])->default('global');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'is_flash_sale',
                'flash_sale_price',
                'flash_sale_discount_percent',
                'flash_sale_stock',
                'flash_sale_end'
            ]);
        });
    }
};
