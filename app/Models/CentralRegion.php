<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use RuntimeException;
use Illuminate\Support\Collection;

class CentralRegion extends Model
{
    protected $connection = 'members';
    protected $table = 'regions';
    public $timestamps = false;
    protected $guarded = [];

    public function save(array $options = []): bool
    {
        throw new RuntimeException("Database pusat members.julehajatim.com bersifat READ-ONLY.");
    }

    public function delete(): ?bool
    {
        throw new RuntimeException("Database pusat members.julehajatim.com bersifat READ-ONLY.");
    }

    public function members()
    {
        return $this->hasMany(CentralMember::class, 'region', 'initial');
    }

    /**
     * Daftar 31 Kabupaten & Kota di Seluruh Jawa Timur (Standar Juleha Jatim)
     */
    public const ALL_JATIM_REGIONS = [
        ['initial' => 'BGK', 'name' => 'KABUPATEN BANGKALAN'],
        ['initial' => 'BWI', 'name' => 'KABUPATEN BANYUWANGI'],
        ['initial' => 'BTU', 'name' => 'KOTA BATU'],
        ['initial' => 'BLT', 'name' => 'KABUPATEN/KOTA BLITAR'],
        ['initial' => 'BJN', 'name' => 'KABUPATEN BOJONEGORO'],
        ['initial' => 'BDW', 'name' => 'KABUPATEN BONDOWOSO'],
        ['initial' => 'GSK', 'name' => 'KABUPATEN GRESIK'],
        ['initial' => 'JBR', 'name' => 'KABUPATEN JEMBER'],
        ['initial' => 'JBG', 'name' => 'KABUPATEN JOMBANG'],
        ['initial' => 'KDR', 'name' => 'KABUPATEN/KOTA KEDIRI'],
        ['initial' => 'LMG', 'name' => 'KABUPATEN LAMONGAN'],
        ['initial' => 'LMJ', 'name' => 'KABUPATEN LUMAJANG'],
        ['initial' => 'MDN', 'name' => 'KABUPATEN/KOTA MADIUN'],
        ['initial' => 'MGT', 'name' => 'KABUPATEN MAGETAN'],
        ['initial' => 'MLG', 'name' => 'KABUPATEN/KOTA MALANG'],
        ['initial' => 'MJK', 'name' => 'KABUPATEN/KOTA MOJOKERTO'],
        ['initial' => 'NGJ', 'name' => 'KABUPATEN NGANJUK'],
        ['initial' => 'NGW', 'name' => 'KABUPATEN NGAWI'],
        ['initial' => 'PCT', 'name' => 'KABUPATEN PACITAN'],
        ['initial' => 'PMK', 'name' => 'KABUPATEN PAMEKASAN'],
        ['initial' => 'PSR', 'name' => 'KABUPATEN/KOTA PASURUAN'],
        ['initial' => 'PNG', 'name' => 'KABUPATEN PONOROGO'],
        ['initial' => 'PRB', 'name' => 'KABUPATEN/KOTA PROBOLINGGO'],
        ['initial' => 'SMP', 'name' => 'KABUPATEN SAMPANG'],
        ['initial' => 'SDA', 'name' => 'KABUPATEN SIDOARJO'],
        ['initial' => 'STB', 'name' => 'KABUPATEN SITUBONDO'],
        ['initial' => 'SMN', 'name' => 'KABUPATEN SUMENEP'],
        ['initial' => 'SBY', 'name' => 'KOTA SURABAYA'],
        ['initial' => 'TBN', 'name' => 'KABUPATEN TUBAN'],
        ['initial' => 'TRG', 'name' => 'KABUPATEN TRENGGALEK'],
        ['initial' => 'TLG', 'name' => 'KABUPATEN TULUNGAGUNG'],
    ];

    /**
     * Dapatkan semua daerah Jatim secara toleran (DB Pusat fallback ke static list)
     */
    public static function getAllRegions(): Collection
    {
        try {
            $fromDb = static::all();
            if ($fromDb->isNotEmpty()) {
                return $fromDb->map(function ($item) {
                    return [
                        'initial' => strtoupper($item->initial),
                        'name' => ucwords(strtolower($item->name)),
                    ];
                });
            }
        } catch (\Throwable $e) {
            // Toleran jika koneksi DB pusat tidak tersedia
        }

        return collect(self::ALL_JATIM_REGIONS)->map(function ($item) {
            return [
                'initial' => strtoupper($item['initial']),
                'name' => ucwords(strtolower($item['name'])),
            ];
        });
    }

    /**
     * Cari nama daerah berdasarkan initial / kode wilayah
     */
    public static function findRegionName(?string $initial): string
    {
        if (empty($initial)) {
            return 'Jawa Timur';
        }

        $code = strtoupper(trim($initial));

        foreach (self::ALL_JATIM_REGIONS as $region) {
            if ($region['initial'] === $code) {
                return ucwords(strtolower($region['name']));
            }
        }

        return "Daerah {$code}";
    }

    /**
     * Ekstrak kode wilayah dari Juleha ID (e.g. SBY22008 -> SBY, LMG220030 -> LMG, SDA220001 -> SDA)
     */
    public static function extractRegionCodeFromJulehaId(?string $julehaId): ?string
    {
        if (empty($julehaId)) {
            return null;
        }

        $clean = strtoupper(trim($julehaId));

        // Format standar ID Juleha: 3 huruf inisial diikuti angka, misal SBY22008, LMG220030, SDA001
        if (preg_match('/^([A-Z]{3})/i', $clean, $matches)) {
            $prefix = $matches[1];
            foreach (self::ALL_JATIM_REGIONS as $region) {
                if ($region['initial'] === $prefix) {
                    return $prefix;
                }
            }
        }

        return null;
    }
}
