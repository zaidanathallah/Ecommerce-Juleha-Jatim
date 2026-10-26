<?php

namespace App\Services;

use App\Models\CentralMember;
use App\Models\CentralRegion;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class MemberValidationService
{
    /**
     * Verifikasi ID Juleha secara real-time ke database pusat members.julehajatim.com
     * 
     * @param string $julehaId
     * @param int|null $excludeUserId
     * @return array
     * @throws ValidationException
     */
    public function verifyAndFetchMember(string $julehaId, ?int $excludeUserId = null): array
    {
        $cleanId = trim($julehaId);

        if (empty($cleanId)) {
            throw ValidationException::withMessages([
                'juleha_id' => 'ID Juleha wajib diisi.',
            ]);
        }

        // 1. Cek apakah sudah terdaftar di marketplace lokal
        $existingQuery = User::where('juleha_id', $cleanId);
        if ($excludeUserId) {
            $existingQuery->where('id', '!=', $excludeUserId);
        }
        if ($existingQuery->exists()) {
            throw ValidationException::withMessages([
                'juleha_id' => 'ID Juleha ini sudah terdaftar di Marketplace. Silakan gunakan menu Login.',
            ]);
        }

        // 2. Query Read-Only ke database julehaaja_members.members
        /** @var CentralMember|null $centralMember */
        $centralMember = CentralMember::where('juleha_id', $cleanId)->first();

        if (!$centralMember) {
            throw ValidationException::withMessages([
                'juleha_id' => "ID Juleha '{$cleanId}' tidak ditemukan di database pusat keanggotaan Juleha Jatim.",
            ]);
        }

        // 3. Validasi status keaktifan (mstatus: 1 = Aktif, 0 = Non-Aktif)
        if (!$centralMember->is_active) {
            throw ValidationException::withMessages([
                'juleha_id' => "ID Juleha '{$cleanId}' berstatus TIDAK AKTIF di database pusat Juleha Jatim. Harap hubungi pengurus DPD/DPW untuk aktivasi keanggotaan.",
            ]);
        }

        // 4. Resolve region name dari tabel regions
        $regionName = null;
        $regionCode = strtoupper(trim((string) $centralMember->region));
        if (!empty($regionCode)) {
            $region = CentralRegion::where('initial', $regionCode)->first();
            if ($region) {
                $regionName = $region->name;
            } else {
                $regionName = $regionCode;
            }
        }

        return [
            'valid' => true,
            'juleha_id' => $centralMember->juleha_id,
            'name' => $centralMember->full_name,
            'phone' => $centralMember->phone ?? '',
            'nik' => $centralMember->nik ?? '',
            'address' => $centralMember->address ?? '',
            'region_code' => $regionCode,
            'region_name' => $regionName ?? 'Jawa Timur',
            'role_in_central' => $centralMember->role ?? 'anggota',
        ];
    }
}
