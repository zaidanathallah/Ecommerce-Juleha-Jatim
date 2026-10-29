<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Services\MemberValidationService;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class JulehaAuthAndMarketplaceTest extends TestCase
{
    public function test_can_verify_active_juleha_member_in_realtime(): void
    {
        User::where('juleha_id', 'SDA220003')->delete();

        $response = $this->postJson(route('register.verify-juleha'), [
            'juleha_id' => 'SDA220003',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'member' => [
                    'valid' => true,
                    'juleha_id' => 'SDA220003',
                    'name' => 'Hanief Adzhar',
                ],
            ]);
    }

    public function test_rejects_non_existent_juleha_member(): void
    {
        $response = $this->postJson(route('register.verify-juleha'), [
            'juleha_id' => 'NONEXISTENT999',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_rejects_inactive_juleha_member(): void
    {
        $response = $this->postJson(route('register.verify-juleha'), [
            'juleha_id' => 'SBY220002',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_can_login_using_juleha_id(): void
    {
        $response = $this->post(route('login'), [
            'login' => 'SDA220001',
            'password' => 'anggota123',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticated();
    }

    public function test_super_admin_redirects_to_superadmin_dashboard(): void
    {
        $response = $this->post(route('login'), [
            'login' => 'superadmin@julehajatim.com',
            'password' => 'superadmin123',
        ]);

        $response->assertRedirect(route('superadmin.dashboard', absolute: false));
        $this->assertAuthenticated();
    }

    public function test_admin_ekop_redirects_to_ekop_dashboard(): void
    {
        $response = $this->post(route('login'), [
            'login' => 'ekop.sidoarjo@julehajatim.com',
            'password' => 'ekop123',
        ]);

        $response->assertRedirect(route('ekop.dashboard', absolute: false));
        $this->assertAuthenticated();
    }

    public function test_regular_user_cannot_access_superadmin_dashboard(): void
    {
        $user = User::where('role', User::ROLE_USER)->first();

        $response = $this->actingAs($user)->get(route('superadmin.dashboard'));

        $response->assertStatus(403);
    }

    public function test_pricing_hierarchy_calculation(): void
    {
        $pricing = new PricingService();
        $final = $pricing->calculateFinalPrice(750000, 25000, 15000);

        $this->assertEquals(790000.00, $final);
    }

    public function test_public_product_hides_margins_from_buyer(): void
    {
        $product = Product::where('status', Product::STATUS_LIVE)->first();

        $pricing = new PricingService();
        $buyerData = $pricing->formatForBuyer($product, false);

        $this->assertArrayNotHasKey('base_price', $buyerData);
        $this->assertArrayNotHasKey('ekop_margin', $buyerData);
        $this->assertArrayNotHasKey('super_margin', $buyerData);
        $this->assertArrayHasKey('price', $buyerData);
        $this->assertEquals((float) $product->final_price, $buyerData['price']);
    }

    public function test_sitemap_xml_renders_correctly(): void
    {
        $response = $this->get('/sitemap.xml');
        $response->assertStatus(200);
        $this->assertStringContainsString('<?xml version="1.0" encoding="UTF-8"?>', $response->getContent());
        $this->assertStringContainsString('<urlset', $response->getContent());
    }

    public function test_seller_can_update_shop_settings(): void
    {
        $seller = User::where('role', User::ROLE_USER)->first();

        $response = $this->from(route('seller.shop.edit'))->actingAs($seller)->put(route('seller.shop.update'), [
            'is_pg_active' => false,
            'is_shipping_api_active' => false,
            'seller_bank_details' => 'BCA 1234567890 a.n. Toko Juleha',
        ]);

        $response->assertRedirect(route('seller.shop.edit'));
        $seller->refresh();

        $this->assertFalse($seller->is_pg_active);
        $this->assertFalse($seller->is_shipping_api_active);
        $this->assertEquals('BCA 1234567890 a.n. Toko Juleha', $seller->seller_bank_details);
    }

    public function test_checkout_manual_shipping_when_seller_shipping_api_is_disabled(): void
    {
        $seller = User::where('role', User::ROLE_USER)->first();
        $seller->update([
            'is_shipping_api_active' => false,
            'is_pg_active' => false,
            'seller_bank_details' => 'Bank Mandiri 987654321 a.n. Ustadz Juleha',
        ]);

        $product = Product::where('user_id', $seller->id)->first();
        if (!$product) {
            $product = Product::create([
                'user_id' => $seller->id,
                'category_id' => Category::first()->id,
                'title' => 'Pisau Seset Juleha Test',
                'slug' => 'pisau-seset-juleha-test-' . time(),
                'description' => 'Pisau seset tajam standar halal',
                'base_price' => 200000,
                'ekop_margin' => 20000,
                'super_margin' => 10000,
                'final_price' => 230000,
                'stock' => 10,
                'weight_gram' => 300,
                'region_code' => $seller->region_code ?? 'SDA',
                'status' => Product::STATUS_LIVE,
            ]);
        }

        // Test calculate-shipping returns 0 / is_manual for Kurir Mandiri
        $buyer = User::where('id', '!=', $seller->id)->first();
        $response = $this->actingAs($buyer)->postJson(route('checkout.calculate-shipping'), [
            'product_id' => $product->id,
            'destination_lat' => -7.2650,
            'destination_lng' => 112.7480,
            'destination_postal_code' => '60271',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_manual' => true,
            ]);

        // Test checkout process creates manual transfer order with unsettled_debt
        $orderResponse = $this->actingAs($buyer)->post(route('checkout.process'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'recipient_name' => 'Ahmad Pembeli',
            'recipient_phone' => '081299998888',
            'shipping_address' => 'Jl. Jagir No. 10, Surabaya',
            'destination_lat' => -7.2650,
            'destination_lng' => 112.7480,
            'postal_code' => '60271',
            'courier_company' => 'kurir_mandiri',
            'courier_service' => 'kurir_mandiri',
            'shipping_cost' => 0,
        ]);

        $orderResponse->assertRedirect();
        
        $order = \App\Models\Order::where('buyer_id', $buyer->id)->latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals(\App\Models\Order::PAYMENT_METHOD_MANUAL, $order->payment_method_type);
        $this->assertEquals(\App\Models\Order::SHIPPING_METHOD_MANUAL, $order->shipping_method_type);
        $this->assertEquals(\App\Models\Order::MARGIN_UNSETTLED_DEBT, $order->margin_settlement_status);
        $this->assertEquals(0, (float) $order->shipping_cost);
    }

    public function test_biteship_simulation_endpoint(): void
    {
        $response = $this->getJson(route('biteship.api-simulate'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'delivered_test_order_id',
                    'cancelled_test_order_id',
                    'cancelled_status',
                ],
            ]);

        $this->assertNotEmpty($response->json('data.delivered_test_order_id'));
        $this->assertNotEmpty($response->json('data.cancelled_test_order_id'));
        $this->assertEquals('cancelled', $response->json('data.cancelled_status'));
    }

    public function test_temanqris_webhook_updates_order_to_paid(): void
    {
        $order = \App\Models\Order::first();
        if (!$order) {
            $buyer = User::where('role', User::ROLE_USER)->first();
            $seller = User::where('id', '!=', $buyer->id)->first();
            $order = \App\Models\Order::create([
                'order_number' => 'JLH-TEST-' . time(),
                'buyer_id' => $buyer->id,
                'seller_id' => $seller->id,
                'payment_status' => \App\Models\Order::PAYMENT_PENDING,
                'shipping_status' => \App\Models\Order::SHIPPING_PENDING,
                'total_base_price' => 100000,
                'total_ekop_margin' => 10000,
                'total_super_margin' => 5000,
                'total_product_price' => 115000,
                'grand_total' => 115000,
                'shipping_cost' => 0,
                'shipping_address' => [
                    'recipient_name' => 'Budi',
                    'phone' => '08123456789',
                    'address_line' => 'Surabaya',
                ],
                'payment_method_type' => \App\Models\Order::PAYMENT_METHOD_QRIS,
                'shipping_method_type' => \App\Models\Order::SHIPPING_METHOD_MANUAL,
                'margin_settlement_status' => \App\Models\Order::MARGIN_SETTLED_PG,
            ]);
        }

        $payload = [
            'event' => 'payment.confirmed',
            'data' => [
                'order_id' => $order->order_number,
                'amount' => (int) $order->grand_total,
                'status' => 'paid',
            ],
        ];

        $response = $this->postJson(route('webhook.temanqris'), $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Payment processed successfully',
            ]);

        $order->refresh();
        $this->assertEquals(\App\Models\Order::PAYMENT_PAID, $order->payment_status);
        $this->assertNotNull($order->paid_at);
    }

    public function test_admin_ekop_can_settle_seller_debt(): void
    {
        $order = \App\Models\Order::where('margin_settlement_status', \App\Models\Order::MARGIN_UNSETTLED_DEBT)->first();
        if (!$order) {
            $buyer = User::where('role', User::ROLE_USER)->first();
            $seller = User::where('id', '!=', $buyer->id)->first();
            $order = \App\Models\Order::create([
                'order_number' => 'JLH-DEBT-' . time(),
                'buyer_id' => $buyer->id,
                'seller_id' => $seller->id,
                'payment_status' => \App\Models\Order::PAYMENT_PAID,
                'shipping_status' => \App\Models\Order::SHIPPING_PENDING,
                'total_base_price' => 100000,
                'total_ekop_margin' => 10000,
                'total_super_margin' => 5000,
                'total_product_price' => 115000,
                'grand_total' => 115000,
                'shipping_cost' => 0,
                'shipping_address' => [
                    'recipient_name' => 'Budi',
                    'phone' => '08123456789',
                    'address_line' => 'Surabaya',
                ],
                'payment_method_type' => \App\Models\Order::PAYMENT_METHOD_MANUAL,
                'shipping_method_type' => \App\Models\Order::SHIPPING_METHOD_MANUAL,
                'margin_settlement_status' => \App\Models\Order::MARGIN_UNSETTLED_DEBT,
            ]);
        }

        $superAdmin = User::where('role', User::ROLE_SUPER_ADMIN)->first();

        $response = $this->actingAs($superAdmin)->post(route('ekop.orders.settle-debt', $order->id));
        $response->assertRedirect();

        $order->refresh();
        $this->assertEquals(\App\Models\Order::MARGIN_PAID_TREASURY, $order->margin_settlement_status);
    }
}

