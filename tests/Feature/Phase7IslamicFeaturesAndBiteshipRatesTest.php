<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class Phase7IslamicFeaturesAndBiteshipRatesTest extends TestCase
{
    /**
     * Test 1: Biteship Simulate Rates Artisan Command executes successfully.
     */
    public function test_biteship_simulate_rates_command_executes_successfully(): void
    {
        $this->artisan('biteship:simulate-rates')
            ->expectsOutputToContain('BITESHIP RATES (CEK ONGKIR) SIMULATOR')
            ->assertExitCode(0);
    }

    /**
     * Test 2: Biteship Simulate Rates API Endpoint returns valid JSON response.
     */
    public function test_biteship_simulate_rates_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/biteship-simulate-rates');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'hit_status',
                'message',
                'biteship_response'
            ]);
    }

    /**
     * Test 3: SiteSetting model key-value storage and getIslamicSettings().
     */
    public function test_site_setting_model_operations(): void
    {
        SiteSetting::set('test_key', 'test_value');
        $this->assertEquals('test_value', SiteSetting::get('test_key'));

        $islamicSettings = SiteSetting::getIslamicSettings();
        $this->assertArrayHasKey('is_global_murottal_active', $islamicSettings);
        $this->assertArrayHasKey('is_adzan_active', $islamicSettings);
        $this->assertArrayHasKey('murottal_volume', $islamicSettings);
    }

    /**
     * Test 4: Super Admin can update Islamic site settings via PUT /superadmin/settings.
     */
    public function test_super_admin_can_update_site_settings(): void
    {
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin_phase7@julehajatim.com'],
            [
                'name' => 'Super Admin Phase 7',
                'password' => bcrypt('password'),
                'role' => User::ROLE_SUPER_ADMIN,
                'is_verified' => true,
            ]
        );

        $response = $this->actingAs($superAdmin)->put('/superadmin/settings', [
            'is_global_murottal_active' => false,
            'is_adzan_active' => true,
            'murottal_volume' => 75,
        ]);

        $response->assertRedirect();
        $this->assertFalse(SiteSetting::get('is_global_murottal_active', true));
        $this->assertEquals(75, SiteSetting::get('murottal_volume', 50));

        // Restore to true
        SiteSetting::set('is_global_murottal_active', true);
    }

    /**
     * Test 5: Guest or regular user cannot update site settings.
     */
    public function test_guest_cannot_update_site_settings(): void
    {
        $response = $this->put('/superadmin/settings', [
            'is_global_murottal_active' => false,
        ]);

        $response->assertRedirect('/login');
    }

    /**
     * Test 6: Public Al-Qur'an Index page (/quran) loads successfully with surahs list.
     */
    public function test_quran_index_page_loads_successfully(): void
    {
        $response = $this->get('/quran');

        $response->assertStatus(200);
    }

    /**
     * Test 7: Public Al-Qur'an Detail page (/quran/1) loads Al-Fatihah.
     */
    public function test_quran_show_page_loads_surah_detail(): void
    {
        $response = $this->get('/quran/1');

        $response->assertStatus(200);
    }

    /**
     * Test 8: Invalid Surah number (/quran/999) returns 404.
     */
    public function test_invalid_surah_number_returns_404(): void
    {
        $response = $this->get('/quran/999');

        $response->assertStatus(404);
    }
}
