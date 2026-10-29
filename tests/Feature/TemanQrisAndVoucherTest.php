<?php

namespace Tests\Feature;

use App\Models\CentralMember;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use Tests\TestCase;

class TemanQrisAndVoucherTest extends TestCase
{
    private function getOrCreateSuperAdmin(): User
    {
        $superAdmin = User::where('role', User::ROLE_SUPER_ADMIN)->first();
        if (!$superAdmin) {
            $superAdmin = User::create([
                'name' => 'Super Admin Test',
                'email' => 'superadmin_test_' . rand(1000, 9999) . '@example.com',
                'password' => bcrypt('password'),
                'role' => User::ROLE_SUPER_ADMIN,
                'is_verified' => true,
            ]);
        }
        return $superAdmin;
    }

    private function getOrCreateAdminEkop(): User
    {
        $adminEkop = User::where('role', User::ROLE_ADMIN_EKOP)->first();
        if (!$adminEkop) {
            $adminEkop = User::create([
                'name' => 'Admin Ekop Test',
                'email' => 'adminekop_test_' . rand(1000, 9999) . '@example.com',
                'password' => bcrypt('password'),
                'role' => User::ROLE_ADMIN_EKOP,
                'region_code' => 'SBY',
                'region_name' => 'KOTA SURABAYA',
                'is_verified' => true,
            ]);
        }
        return $adminEkop;
    }

    public function test_super_admin_and_admin_ekop_can_create_products(): void
    {
        $superAdmin = $this->getOrCreateSuperAdmin();
        $this->actingAs($superAdmin);
        $response = $this->get(route('seller.products.create'));
        $response->assertStatus(200);

        $adminEkop = $this->getOrCreateAdminEkop();
        $this->actingAs($adminEkop);
        $response = $this->get(route('seller.products.create'));
        $response->assertStatus(200);
    }

    public function test_voucher_crud_by_authorized_users(): void
    {
        $superAdmin = $this->getOrCreateSuperAdmin();
        $this->actingAs($superAdmin);

        // 1. Create Voucher
        $voucherCode = 'VCH-' . rand(1000, 9999);
        $response = $this->post(route('vouchers.store'), [
            'code' => $voucherCode,
            'title' => 'Diskon Spesial Juleha',
            'type' => 'discount_fixed',
            'discount_amount' => 15000,
            'min_spend' => 50000,
        ]);
        $response->assertRedirect();

        $voucher = Voucher::where('code', $voucherCode)->first();
        $this->assertNotNull($voucher);
        $this->assertEquals(15000, (float) $voucher->discount_amount);

        // 2. Apply Voucher API
        $applyRes = $this->postJson(route('vouchers.apply'), [
            'code' => $voucherCode,
            'subtotal' => 100000,
            'shipping_fee' => 20000,
        ]);
        $applyRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'voucher' => [
                    'code' => $voucherCode,
                    'discount' => 15000,
                ],
            ]);

        // 3. Update Voucher
        $updateRes = $this->put(route('vouchers.update', $voucher->id), [
            'title' => 'Diskon Spesial Juleha Update',
            'type' => 'discount_fixed',
            'discount_amount' => 20000,
            'min_spend' => 60000,
            'is_active' => true,
        ]);
        $updateRes->assertRedirect();

        $voucher->refresh();
        $this->assertEquals(20000, (float) $voucher->discount_amount);

        // 4. Delete Voucher
        $deleteRes = $this->delete(route('vouchers.destroy', $voucher->id));
        $deleteRes->assertRedirect();
        $this->assertDatabaseMissing('vouchers', ['id' => $voucher->id]);
    }

    public function test_checkout_applies_voucher_discount_to_grand_total(): void
    {
        $buyer = User::where('role', User::ROLE_USER)->first();
        if (!$buyer) {
            $buyer = User::create([
                'name' => 'Buyer Test',
                'email' => 'buyertest_' . rand(1000, 9999) . '@example.com',
                'password' => bcrypt('password'),
                'role' => User::ROLE_USER,
            ]);
        }

        $product = Product::live()->first();
        if (!$product) {
            $seller = $this->getOrCreateSuperAdmin();
            $product = Product::create([
                'user_id' => $seller->id,
                'name' => 'Pisau Sembelih Test',
                'slug' => 'pisau-sembelih-test-' . time(),
                'base_price' => 200000,
                'ekop_margin' => 10000,
                'super_margin' => 5000,
                'stock' => 10,
                'weight' => 500,
                'category' => 'pisau_sembelih',
                'description' => 'Pisau tes',
                'status' => Product::STATUS_LIVE,
            ]);
        }

        $voucher = Voucher::create([
            'code' => 'TESTONGKIR' . rand(100, 999),
            'title' => 'Gratis Ongkir Test',
            'type' => 'free_shipping',
            'discount_amount' => 20000,
            'min_spend' => 10000,
            'is_active' => true,
        ]);

        $this->actingAs($buyer);

        $response = $this->post(route('checkout.process'), [
            'product_id' => $product->id,
            'recipient_name' => 'Ahmad Tes',
            'recipient_phone' => '081234567890',
            'shipping_address' => 'Jl. Dharmahusada No. 12 Surabaya',
            'destination_lat' => -7.2650,
            'destination_lng' => 112.7480,
            'courier_company' => 'J&T Express',
            'courier_service' => 'EZ',
            'shipping_cost' => 18000,
            'voucher_code' => $voucher->code,
        ]);

        $response->assertSessionHasNoErrors();
        $order = Order::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals($voucher->id, $order->voucher_id);
        $this->assertEquals($voucher->code, $order->voucher_code);
        $this->assertEquals(18000, (float) $order->discount_amount);
    }
}
