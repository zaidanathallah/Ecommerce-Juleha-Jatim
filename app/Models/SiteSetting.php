<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Ambil nilai pengaturan dengan casting otomatis
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        $val = $setting->value;
        if ($val === '1' || $val === 'true') return true;
        if ($val === '0' || $val === 'false') return false;
        if (is_numeric($val)) return (int) $val;

        return $val;
    }

    /**
     * Simpan atau update nilai pengaturan
     */
    public static function set(string $key, mixed $value): void
    {
        $storedValue = is_bool($value) ? ($value ? '1' : '0') : (string) $value;
        static::updateOrCreate(['key' => $key], ['value' => $storedValue]);
    }

    /**
     * Ambil semua konfigurasi fitur Islami (Murottal & Adzan)
     */
    public static function getIslamicSettings(): array
    {
        return [
            'is_global_murottal_active' => (bool) static::get('is_global_murottal_active', true),
            'is_adzan_active' => (bool) static::get('is_adzan_active', true),
            'murottal_volume' => (int) static::get('murottal_volume', 50),
        ];
    }
}
