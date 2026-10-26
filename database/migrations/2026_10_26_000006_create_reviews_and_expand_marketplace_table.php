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
        // 1. Reviews table for buyer ratings & comments
        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->tinyInteger('rating')->default(5); // 1 to 5 stars
                $table->text('comment');
                $table->boolean('is_verified_buyer')->default(true);
                $table->timestamps();
            });
        }

        // 2. Add rating, reviews count & sold count to products
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'rating_avg')) {
                $table->decimal('rating_avg', 3, 2)->default(5.00)->after('final_price');
            }
            if (!Schema::hasColumn('products', 'reviews_count')) {
                $table->integer('reviews_count')->default(0)->after('rating_avg');
            }
            if (!Schema::hasColumn('products', 'sold_count')) {
                $table->integer('sold_count')->default(0)->after('reviews_count');
            }
        });

        // 3. Add user_type, shop_name, and is_member to users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'user_type')) {
                $table->string('user_type', 30)->default('buyer')->after('role'); // 'buyer' or 'seller'
            }
            if (!Schema::hasColumn('users', 'shop_name')) {
                $table->string('shop_name', 150)->nullable()->after('user_type');
            }
            if (!Schema::hasColumn('users', 'is_member')) {
                $table->boolean('is_member')->default(false)->after('shop_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['rating_avg', 'reviews_count', 'sold_count']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['user_type', 'shop_name', 'is_member']);
        });
    }
};
