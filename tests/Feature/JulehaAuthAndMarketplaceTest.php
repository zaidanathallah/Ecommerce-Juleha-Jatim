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
        $buyerData = $pricing->formatForBuyer($product);

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
}
