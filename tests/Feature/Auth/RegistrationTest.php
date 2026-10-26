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
        User::where('juleha_id', 'SDA220003')->delete();

        $response = $this->post('/register', [
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
}

