<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::where('role', User::ROLE_USER)->first();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'anggota123',
        ]);

        $this->assertAuthenticated();
        $expectedRoute = $user->user_type === 'seller' ? route('dashboard', absolute: false) : route('home', absolute: false);
        $response->assertRedirect($expectedRoute);
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::where('role', User::ROLE_USER)->first();

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::where('role', User::ROLE_USER)->first();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
