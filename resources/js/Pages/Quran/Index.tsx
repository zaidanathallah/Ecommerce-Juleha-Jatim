import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { useAudio, SurahSummary } from '@/Contexts/AudioContext';
import { 
    Search, 
    BookOpen, 
    Play, 
    Pause, 
    Sparkles, 
    Radio, 
    ExternalLink,
    Clock,
    Compass
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface SurahItem {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    tempatTurun: string;
    arti: string;
    audioFull?: {
        [key: string]: string;
    };
}

interface Props {
    surahs: SurahItem[];
    filters: {
        q?: string;
    };
}

export default function QuranIndex({ surahs = [], filters }: Props) {
    const { playSurah, isPlaying, currentSurah, togglePlay } = useAudio();
    const [searchTerm, setSearchTerm] = useState(filters.q || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('quran.index'), { q: searchTerm }, { preserveState: true });
    };

    return (
        <MarketplaceLayout>
            <Head title="Al-Qur'an Digital 30 Juz - Juleha Jawa Timur" />

            <div className="space-y-6">
                {/* Hero / Header Section */}
                <div className="bg-emerald-950 text-white p-6 sm:p-8 border-2 border-emerald-800 shadow-sm relative overflow-hidden">
                    <div className="max-w-3xl space-y-3 relative z-10">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-900 border border-emerald-700 font-mono text-xs uppercase font-bold text-emerald-300">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Al-Qur'anul Karim • 114 Surat</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                            Al-Qur'an Digital Juleha Jatim
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                            Bacaan Al-Qur'an lengkap 30 Juz beserta terjemahan Bahasa Indonesia dan lantunan audio merdu Syaikh Misyari Rasyid Al-Afasy. Fitur ini dirancang khusus untuk kenyamanan membaca mandiri dan tadabbur ayat suci.
                        </p>
                    </div>
                </div>

                {/* Filter and Quick Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 border border-neutral-300 dark:border-neutral-800">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                type="text"
                                placeholder="Cari surat (contoh: Yasin, Al-Mulk, 36)..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="pl-9 rounded-none border-neutral-300 dark:border-neutral-700 text-xs h-9"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            size="sm" 
                            className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-none font-mono text-xs font-bold uppercase h-9"
                        >
                            Cari
                        </Button>
                        {filters.q && (
                            <Link 
                                href={route('quran.index')}
                                className="text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white px-2"
                            >
                                Reset
                            </Link>
                        )}
                    </form>

                    <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                        Menampilkan <span className="font-bold text-emerald-600 dark:text-emerald-400">{surahs.length}</span> Surat
                    </div>
                </div>

                {/* Grid of Surah Cards */}
                {surahs.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-12 text-center space-y-3">
                        <BookOpen className="h-10 w-10 text-neutral-400 mx-auto" />
                        <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                            Surat tidak ditemukan
                        </h3>
                        <p className="text-xs text-neutral-500">
                            Tidak ada surat yang cocok dengan kata kunci "{filters.q}". Silakan periksa ejaan atau gunakan nomor surat.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {surahs.map((surah) => {
                            const isCurrent = currentSurah.nomor === surah.nomor;
                            const isThisPlaying = isCurrent && isPlaying;
                            const audioUrl = surah.audioFull?.['05'] || `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${String(surah.nomor).padStart(3, '0')}.mp3`;

                            const surahSummary: SurahSummary = {
                                nomor: surah.nomor,
                                namaLatin: surah.namaLatin,
                                nama: surah.nama,
                                arti: surah.arti,
                                audioUrl
                            };

                            return (
                                <div
                                    key={surah.nomor}
                                    className={`bg-white dark:bg-neutral-900 border transition ${
                                        isCurrent 
                                            ? 'border-emerald-600 shadow-md ring-1 ring-emerald-600' 
                                            : 'border-neutral-300 dark:border-neutral-800 hover:border-neutral-400'
                                    } p-4 flex flex-col justify-between`}
                                >
                                    <div className="space-y-3">
                                        {/* Card Top: Number, Latin Name & Arabic Calligraphy */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center font-mono text-xs font-black text-emerald-700 dark:text-emerald-400">
                                                    {surah.nomor}
                                                </div>
                                                <div>
                                                    <Link 
                                                        href={route('quran.show', surah.nomor)}
                                                        className="text-sm font-bold text-neutral-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                                                    >
                                                        QS. {surah.namaLatin}
                                                    </Link>
                                                    <div className="text-[11px] text-neutral-500 font-sans">
                                                        {surah.arti}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="font-serif text-lg font-bold text-emerald-800 dark:text-emerald-400" dir="rtl">
                                                    {surah.nama}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Metadata Badges */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 font-mono text-[10px] text-neutral-500">
                                            <span className="uppercase">{surah.tempatTurun}</span>
                                            <span>•</span>
                                            <span>{surah.jumlahAyat} AYAT</span>
                                            {isCurrent && (
                                                <span className="ml-auto inline-flex items-center gap-1 text-emerald-600 font-bold">
                                                    <Radio className="h-3 w-3 animate-pulse" />
                                                    <span>AKTIF DI PLAYER</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                        <Button
                                            size="sm"
                                            variant={isThisPlaying ? 'default' : 'outline'}
                                            onClick={() => {
                                                if (isCurrent) {
                                                    togglePlay();
                                                } else {
                                                    playSurah(surahSummary);
                                                }
                                            }}
                                            className={`rounded-none font-mono text-xs font-bold uppercase h-8 ${
                                                isThisPlaying
                                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                                    : 'border-neutral-300 dark:border-neutral-700 hover:bg-emerald-50 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            {isThisPlaying ? (
                                                <>
                                                    <Pause className="h-3.5 w-3.5 mr-1" />
                                                    <span>Jeda</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                                                    <span>Putar</span>
                                                </>
                                            )}
                                        </Button>

                                        <Link
                                            href={route('quran.show', surah.nomor)}
                                            className="inline-flex items-center justify-center h-8 px-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-mono text-xs font-bold uppercase rounded-none transition"
                                        >
                                            <BookOpen className="h-3.5 w-3.5 mr-1" />
                                            <span>Baca</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MarketplaceLayout>
    );
}
