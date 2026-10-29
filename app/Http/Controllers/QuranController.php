<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class QuranController extends Controller
{
    /**
     * Display a listing of the 114 Surahs from Quran Foundation API v4.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('q', '');

        $surahs = Cache::remember('quran_foundation_v4_chapters', 86400 * 7, function () {
            try {
                $response = Http::timeout(12)
                    ->withUserAgent('Mozilla/5.0 JulehaJatim/1.0')
                    ->get('https://api.quran.com/api/v4/chapters?language=id');

                if ($response->successful() && isset($response->json()['chapters'])) {
                    return array_map(function ($ch) {
                        return [
                            'nomor' => (int) $ch['id'],
                            'nama' => $ch['name_arabic'],
                            'namaLatin' => $ch['name_simple'],
                            'namaComplex' => $ch['name_complex'] ?? $ch['name_simple'],
                            'jumlahAyat' => (int) $ch['verses_count'],
                            'tempatTurun' => strtolower($ch['revelation_place']) === 'makkah' ? 'Mekah' : 'Madinah',
                            'arti' => $ch['translated_name']['name'] ?? '',
                            'audioUrl' => "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/{$ch['id']}.mp3",
                        ];
                    }, $response->json()['chapters']);
                }
            } catch (\Throwable $e) {
                Log::warning("Quran Foundation API chapters fetch failed: " . $e->getMessage());
            }

            return $this->getFallbackSurahs();
        });

        // Search filter by Latin name, Arabic name, meaning, or number
        if (!empty($search)) {
            $keyword = strtolower(trim($search));
            $surahs = array_values(array_filter($surahs, function ($s) use ($keyword) {
                return str_contains(strtolower($s['namaLatin'] ?? ''), $keyword)
                    || str_contains(strtolower($s['arti'] ?? ''), $keyword)
                    || str_contains((string) ($s['nomor'] ?? ''), $keyword)
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
     * Display the specified Surah with all verses from Quran Foundation API v4.
     */
    public function show(Request $request, int $nomor): Response
    {
        if ($nomor < 1 || $nomor > 114) {
            abort(404, 'Surat tidak ditemukan.');
        }

        $surahData = Cache::remember("quran_foundation_v4_surah_{$nomor}", 86400 * 7, function () use ($nomor) {
            try {
                // Fetch chapter metadata
                $chRes = Http::timeout(10)
                    ->withUserAgent('Mozilla/5.0 JulehaJatim/1.0')
                    ->get("https://api.quran.com/api/v4/chapters/{$nomor}?language=id");

                $chapter = $chRes->json()['chapter'] ?? null;

                // Fetch chapter verses with Uthmani text and Indonesian translation (resource 33 = Kemenag RI)
                $vRes = Http::timeout(15)
                    ->withUserAgent('Mozilla/5.0 JulehaJatim/1.0')
                    ->get("https://api.quran.com/api/v4/verses/by_chapter/{$nomor}?language=id&words=false&translations=33&fields=text_uthmani&per_page=350");

                $verses = $vRes->json()['verses'] ?? [];

                if ($chapter && !empty($verses)) {
                    $formattedAyat = array_map(function ($v) {
                        return [
                            'nomorAyat' => (int) $v['verse_number'],
                            'teksArab' => $v['text_uthmani'] ?? '',
                            'teksIndonesia' => $v['translations'][0]['text'] ?? '',
                            'verseKey' => $v['verse_key'] ?? '',
                            'pageNumber' => $v['page_number'] ?? null,
                            'juzNumber' => $v['juz_number'] ?? null,
                        ];
                    }, $verses);

                    return [
                        'nomor' => (int) $chapter['id'],
                        'nama' => $chapter['name_arabic'],
                        'namaLatin' => $chapter['name_simple'],
                        'jumlahAyat' => (int) $chapter['verses_count'],
                        'tempatTurun' => strtolower($chapter['revelation_place']) === 'makkah' ? 'Mekah' : 'Madinah',
                        'arti' => $chapter['translated_name']['name'] ?? '',
                        'audioUrl' => "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/{$nomor}.mp3",
                        'ayat' => $formattedAyat,
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning("Quran Foundation API detail fetch failed for surat {$nomor}: " . $e->getMessage());
            }

            return null;
        });

        if (!$surahData) {
            abort(503, 'Gagal memuat isi surat Al-Quran. Silakan coba beberapa saat lagi.');
        }

        return Inertia::render('Quran/Show', [
            'surah' => $surahData,
        ]);
    }

    /**
     * Display a complete Juz (1-30) with all verses from Quran Foundation API v4.
     */
    public function juz(Request $request, int $number): Response
    {
        if ($number < 1 || $number > 30) {
            abort(404, 'Juz tidak ditemukan. Al-Qur\'an terdiri dari Juz 1 sampai Juz 30.');
        }

        $juzData = Cache::remember("quran_foundation_v4_juz_data_{$number}", 86400 * 7, function () use ($number) {
            try {
                // Fetch Juz metadata
                $juzRes = Http::timeout(10)
                    ->withUserAgent('Mozilla/5.0 JulehaJatim/1.0')
                    ->get("https://api.quran.com/api/v4/juzs/{$number}");

                $juzMeta = $juzRes->json()['juz'] ?? [];

                // Fetch all verses in this Juz (with Uthmani text & Kemenag Indonesian translation)
                $vRes = Http::timeout(20)
                    ->withUserAgent('Mozilla/5.0 JulehaJatim/1.0')
                    ->get("https://api.quran.com/api/v4/verses/by_juz/{$number}?language=id&words=false&translations=33&fields=text_uthmani&per_page=350");

                $verses = $vRes->json()['verses'] ?? [];

                if (!empty($verses)) {
                    $formattedAyat = array_map(function ($v) {
                        return [
                            'nomorAyat' => (int) $v['verse_number'],
                            'teksArab' => $v['text_uthmani'] ?? '',
                            'teksIndonesia' => $v['translations'][0]['text'] ?? '',
                            'verseKey' => $v['verse_key'] ?? '',
                            'juzNumber' => $v['juz_number'] ?? null,
                            'pageNumber' => $v['page_number'] ?? null,
                        ];
                    }, $verses);

                    $paddedNum = str_pad((string) $number, 2, '0', STR_PAD_LEFT);

                    return [
                        'number' => $number,
                        'versesCount' => count($formattedAyat),
                        'audioUrl' => "https://archive.org/download/misyarirasyidperjuz/Al-Quran%20Juz%20{$paddedNum}.mp3",
                        'firstVerse' => $formattedAyat[0]['verseKey'] ?? '',
                        'lastVerse' => end($formattedAyat)['verseKey'] ?? '',
                        'ayat' => $formattedAyat,
                        'meta' => $juzMeta,
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning("Quran Foundation API fetch failed for juz {$number}: " . $e->getMessage());
            }

            return null;
        });

        if (!$juzData) {
            abort(503, 'Gagal memuat isi Juz Al-Qur\'an. Silakan coba beberapa saat lagi.');
        }

        return Inertia::render('Quran/Juz', [
            'juz' => $juzData,
        ]);
    }

    /**
     * Fallback lightweight list of key surahs if external API is unreachable.
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
                'audioUrl' => 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/1.mp3',
            ],
            [
                'nomor' => 2,
                'nama' => 'البقرة',
                'namaLatin' => 'Al-Baqarah',
                'jumlahAyat' => 286,
                'tempatTurun' => 'Madinah',
                'arti' => 'Sapi Betina',
                'audioUrl' => 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/2.mp3',
            ],
            [
                'nomor' => 36,
                'nama' => 'يس',
                'namaLatin' => 'Yasin',
                'jumlahAyat' => 83,
                'tempatTurun' => 'Mekah',
                'arti' => 'Yas Sin',
                'audioUrl' => 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/36.mp3',
            ],
            [
                'nomor' => 67,
                'nama' => 'الملك',
                'namaLatin' => 'Al-Mulk',
                'jumlahAyat' => 30,
                'tempatTurun' => 'Mekah',
                'arti' => 'Kerajaan',
                'audioUrl' => 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/67.mp3',
            ],
        ];
    }
}
