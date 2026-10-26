<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class QuranController extends Controller
{
    /**
     * Display a listing of the 114 Surahs.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('q', '');

        $surahs = Cache::remember('quran_surahs_list_v2', 86400 * 7, function () {
            try {
                $response = Http::timeout(10)->get('https://equran.id/api/v2/surat');
                if ($response->successful() && isset($response->json()['data'])) {
                    return $response->json()['data'];
                }
            } catch (\Throwable $e) {
                \Log::warning("EQuran API list fetch failed: " . $e->getMessage());
            }

            return $this->getFallbackSurahs();
        });

        // Optional search filter by Latin name, Arabic name, meaning, or number
        if (!empty($search)) {
            $keyword = strtolower(trim($search));
            $surahs = array_values(array_filter($surahs, function ($s) use ($keyword) {
                return str_contains(strtolower($s['namaLatin'] ?? ''), $keyword)
                    || str_contains(strtolower($s['arti'] ?? ''), $keyword)
                    || str_contains((string)($s['nomor'] ?? ''), $keyword)
                    || str_contains($s['nama'] ?? '', $keyword);
            }));
        }

        return Inertia::render('Quran/Index', [
            'surahs' => $surahs,
            'filters' => [
                'q' => $search,
            ],
        ]);
    }

    /**
     * Display the specified Surah with all verses (Ayat).
     */
    public function show(Request $request, int $nomor): Response
    {
        if ($nomor < 1 || $nomor > 114) {
            abort(404, 'Surat tidak ditemukan.');
        }

        $surah = Cache::remember("quran_surah_detail_v2_{$nomor}", 86400 * 7, function () use ($nomor) {
            try {
                $response = Http::timeout(12)->get("https://equran.id/api/v2/surat/{$nomor}");
                if ($response->successful() && isset($response->json()['data'])) {
                    return $response->json()['data'];
                }
            } catch (\Throwable $e) {
                \Log::warning("EQuran API detail fetch failed for surat {$nomor}: " . $e->getMessage());
            }

            return null;
        });

        if (!$surah) {
            abort(503, 'Gagal memuat isi surat Al-Quran. Silakan coba beberapa saat lagi.');
        }

        return Inertia::render('Quran/Show', [
            'surah' => $surah,
        ]);
    }

    /**
     * Fallback lightweight list of key surahs if external API is unreachable
     */
    protected function getFallbackSurahs(): array
    {
        return [
            [
                'nomor' => 1,
                'nama' => 'الفاتحة',
                'namaLatin' => 'Al-Fatihah',
                'jumlahAyat' => 7,
                'tempatTurun' => 'Mekah',
                'arti' => 'Pembukaan',
                'audioFull' => [
                    '05' => 'https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/001.mp3'
                ]
            ],
            [
                'nomor' => 36,
                'nama' => 'يس',
                'namaLatin' => 'Yasin',
                'jumlahAyat' => 83,
                'tempatTurun' => 'Mekah',
                'arti' => 'Yas Sin',
                'audioFull' => [
                    '05' => 'https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/036.mp3'
                ]
            ],
            [
                'nomor' => 67,
                'nama' => 'الملك',
                'namaLatin' => 'Al-Mulk',
                'jumlahAyat' => 30,
                'tempatTurun' => 'Mekah',
                'arti' => 'Kerajaan',
                'audioFull' => [
                    '05' => 'https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/067.mp3'
                ]
            ],
            [
                'nomor' => 112,
                'nama' => 'الإخلاص',
                'namaLatin' => 'Al-Ikhlas',
                'jumlahAyat' => 4,
                'tempatTurun' => 'Mekah',
                'arti' => 'Ikhlas',
                'audioFull' => [
                    '05' => 'https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/112.mp3'
                ]
            ]
        ];
    }
}
