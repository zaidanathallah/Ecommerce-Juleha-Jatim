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
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('image_url')->nullable();
            $table->json('gallery')->nullable();
            $table->integer('weight_gram')->default(500);
            $table->integer('length_cm')->nullable()->default(10);
            $table->integer('width_cm')->nullable()->default(10);
            $table->integer('height_cm')->nullable()->default(10);
            
            // Tiered Margins Logic
            $table->decimal('base_price', 12, 2);
            $table->decimal('ekop_margin', 12, 2)->default(0);
            $table->decimal('super_margin', 12, 2)->default(0);
            $table->decimal('final_price', 12, 2)->default(0); // base_price + ekop_margin + super_margin
            
            $table->integer('stock')->default(1);
            $table->string('region_code', 20)->nullable()->index();
            $table->string('region_name', 100)->nullable();
            
            // Status workflow: pending -> approved_ekop -> live
            $table->enum('status', ['pending', 'approved_ekop', 'live', 'rejected'])->default('pending')->index();
            $table->text('rejection_reason')->nullable();
            
            $table->foreignId('reviewed_by_ekop_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by_super_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 3. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 40)->unique();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            
            // Financial audit breakdown
            $table->decimal('total_base_price', 12, 2);
            $table->decimal('total_ekop_margin', 12, 2);
            $table->decimal('total_super_margin', 12, 2);
            $table->decimal('total_product_price', 12, 2);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('insurance_cost', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2);
            
            // Shipping Info
            $table->string('shipping_courier', 50)->nullable();
            $table->string('shipping_service', 50)->nullable();
            $table->json('shipping_address'); // name, phone, address, lat, lng, notes
            
            // Biteship logistics tracking
            $table->string('biteship_order_id', 100)->nullable()->index();
            $table->string('biteship_waybill_id', 100)->nullable()->index();
            $table->string('biteship_tracking_status', 50)->nullable();
            
            // DOKU SNAP Payment Gateway
            $table->string('doku_invoice_number', 100)->nullable()->index();
            $table->text('doku_payment_url')->nullable();
            $table->text('doku_qris_content')->nullable();
            $table->string('doku_va_number', 50)->nullable();
            $table->string('doku_channel', 30)->nullable();
            
            // Order and Payment Status
            $table->enum('payment_status', ['pending', 'paid', 'expired', 'failed'])->default('pending')->index();
            $table->enum('shipping_status', ['pending', 'confirmed', 'pickup_requested', 'in_transit', 'delivered', 'cancelled'])->default('pending')->index();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });

        // 4. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('product_title');
            $table->decimal('base_price', 12, 2);
            $table->decimal('ekop_margin', 12, 2);
            $table->decimal('super_margin', 12, 2);
            $table->decimal('final_price', 12, 2);
            $table->integer('quantity')->default(1);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
