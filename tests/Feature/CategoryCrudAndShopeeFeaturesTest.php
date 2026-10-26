<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryCrudAndShopeeFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_list_endpoint_returns_json()
    {
        Category::create([
            'name' => 'Bilah Jagal Khusus',
            'slug' => 'bilah-jagal-khusus',
            'icon' => 'sword',
            'is_active' => true,
        ]);

        $seller = User::factory()->create([
            'role' => User::ROLE_USER,
            'user_type' => 'seller',
        ]);

        $response = $this->actingAs($seller)->getJson(route('seller.categories.index'));
        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Bilah Jagal Khusus']);
    }

    public function test_seller_can_create_category()
    {
        $seller = User::factory()->create([
            'role' => User::ROLE_USER,
            'user_type' => 'seller',
        ]);

        $response = $this->actingAs($seller)->post(route('seller.categories.store'), [
            'name' => 'Peralatan Asah Diamond',
            'icon' => 'sparkles',
            'description' => 'Kategori asahan diamond grit tinggi',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('categories', [
            'name' => 'Peralatan Asah Diamond',
            'slug' => 'peralatan-asah-diamond',
            'icon' => 'sparkles',
        ]);
    }

    public function test_admin_ekop_can_update_category()
    {
        $adminEkop = User::factory()->create([
            'role' => User::ROLE_ADMIN_EKOP,
        ]);

        $category = Category::create([
            'name' => 'Kategori Lama',
            'slug' => 'kategori-lama',
            'icon' => 'box',
            'is_active' => true,
        ]);

        $response = $this->actingAs($adminEkop)->put(route('seller.categories.update', $category->id), [
            'name' => 'Kategori Diperbarui',
            'icon' => 'flame',
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Kategori Diperbarui',
            'icon' => 'flame',
        ]);
    }

    public function test_superadmin_can_delete_category()
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        $category = Category::create([
            'name' => 'Kategori Dihapus',
            'slug' => 'kategori-dihapus',
            'icon' => 'tag',
            'is_active' => true,
        ]);

        $response = $this->actingAs($superAdmin)->delete(route('seller.categories.destroy', $category->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('categories', [
            'id' => $category->id,
        ]);
    }

    public function test_guest_cannot_create_or_modify_category()
    {
        $response = $this->post(route('seller.categories.store'), [
            'name' => 'Hacker Cat',
        ]);
        $response->assertRedirect(route('login'));

        $category = Category::create([
            'name' => 'Safe Cat',
            'slug' => 'safe-cat',
        ]);

        $deleteResponse = $this->delete(route('seller.categories.destroy', $category->id));
        $deleteResponse->assertRedirect(route('login'));
    }

    public function test_shopee_auth_pages_render_successfully()
    {
        $loginRes = $this->get(route('login'));
        $loginRes->assertStatus(200);

        $registerRes = $this->get(route('register'));
        $registerRes->assertStatus(200);

        $homeRes = $this->get(route('home'));
        $homeRes->assertStatus(200);
    }
}
