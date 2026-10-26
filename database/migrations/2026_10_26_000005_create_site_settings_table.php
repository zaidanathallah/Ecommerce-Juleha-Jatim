<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Insert initial default values for Islamic features
        DB::table('site_settings')->insert([
            [
                'key' => 'is_global_murottal_active',
                'value' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'is_adzan_active',
                'value' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'murottal_volume',
                'value' => '50',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
