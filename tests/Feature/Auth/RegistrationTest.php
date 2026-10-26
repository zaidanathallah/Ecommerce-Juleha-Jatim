<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register_with_valid_juleha_id(): void
    {
        User::where('juleha_id', 'SDA220003')->orWhere('email', 'hanief.adzhar@example.com')->delete();

        $response = $this->post('/register', [
            'account_type' => 'seller',
            'juleha_id' => 'SDA220003',
            'name' => 'Hanief Adzhar',
            'email' => 'hanief.adzhar@example.com',
            'phone' => '081234567890',
            'address' => 'Jl. Pahlawan No. 20, Sidoarjo',
            'lat' => -7.4500,
            'lng' => 112.7100,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_general_buyer_can_register_without_juleha_id(): void
    {
        User::where('email', 'buyer.test@example.com')->delete();

        $response = $this->post('/register', [
            'account_type' => 'buyer',
            'name' => 'General Buyer Test',
            'email' => 'buyer.test@example.com',
            'phone' => '089911223344',
            'address' => 'Jl. Gubeng No. 10, Surabaya',
            'lat' => -7.2650,
            'lng' => 112.7500,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}

