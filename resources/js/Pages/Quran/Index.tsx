import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { useAudio, SurahSummary } from '@/Contexts/AudioContext';
import { JUZ_LIST, JuzInfo } from '@/data/juzData';
import { 
    Search, 
    BookOpen, 
    Play, 
    Pause, 
    Sparkles, 
    Radio, 
    Layers,
    ListFilter
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
    const { playSurah, playJuz, isPlaying, currentSurah, currentJuz, togglePlay } = useAudio();
    const [activeTab, setActiveTab] = useState<'surah' | 'juz'>('surah');
    const [searchTerm, setSearchTerm] = useState(filters.q || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('quran.index'), { q: searchTerm }, { preserveState: true });
    };

    return (
        <MarketplaceLayout>
            <Head title="Al-Qur'an Digital 30 Juz - Juleha Jawa Timur" />

            <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
                {/* Hero / Header Section */}
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-10 rounded-3xl border border-emerald-800 shadow-lg relative overflow-hidden">
                    <div className="max-w-3xl space-y-3 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/80 border border-emerald-600 rounded-full font-mono text-xs uppercase font-bold text-emerald-300">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Al-Qur'anul Karim • 30 Juz &bull; 114 Surat</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                            Al-Qur'an Digital Juleha Jatim
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
                            Bacaan Al-Qur'an lengkap 30 Juz dan 114 Surat beserta terjemahan Bahasa Indonesia dan lantunan audio merdu Syaikh Misyari Rasyid Al-Afasy. Audio dapat diputar per Juz maupun per Surat secara fleksibel.
                        </p>

                        {/* Navigation Tabs (Surah vs Juz) */}
                        <div className="flex items-center gap-2 pt-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab('surah')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                    activeTab === 'surah'
                                        ? 'bg-white text-emerald-950 scale-[1.02]'
                                        : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/60'
                                }`}
                            >
                                <ListFilter className="h-4 w-4" />
                                <span>Daftar 114 Surat</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('juz')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                    activeTab === 'juz'
                                        ? 'bg-white text-emerald-950 scale-[1.02]'
                                        : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/60'
                                }`}
                            >
                                <Layers className="h-4 w-4" />
                                <span>Baca Per Juz (30 Juz Lengkap)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter and Quick Search Toolbar for Surah Tab */}
                {activeTab === 'surah' && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari surat (contoh: Yasin, Al-Mulk, 36)..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    className="pl-9 rounded-xl border-neutral-300 dark:border-neutral-700 text-xs h-10"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                size="sm" 
                                className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs h-10 px-4"
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
                )}

                {/* TAB 1: DAFTAR 114 SURAH */}
                {activeTab === 'surah' && (
                    <>
                        {surahs.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-12 text-center rounded-2xl space-y-3">
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
                                            className={`bg-white dark:bg-neutral-900 border rounded-2xl transition shadow-sm ${
                                                isCurrent 
                                                    ? 'border-emerald-600 shadow-md ring-2 ring-emerald-600/30' 
                                                    : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                                            } p-5 flex flex-col justify-between`}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                            {surah.nomor}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-neutral-900 dark:text-white">
                                                                QS. {surah.namaLatin}
                                                            </div>
                                                            <div className="text-[11px] text-neutral-500">
                                                                {surah.arti}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="font-serif text-lg font-bold text-emerald-700 dark:text-emerald-400">
                                                            {surah.nama}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 text-[10px] uppercase font-mono text-neutral-500">
                                                    <span>{surah.tempatTurun}</span>
                                                    <span>&bull;</span>
                                                    <span>{surah.jumlahAyat} AYAT</span>
                                                    {isCurrent && (
                                                        <span className="ml-auto inline-flex items-center gap-1 text-emerald-600 font-bold">
                                                            <Radio className="h-3 w-3 animate-pulse" />
                                                            AKTIF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
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
                                                    className={`flex-1 text-xs font-bold rounded-xl gap-1.5 ${
                                                        isThisPlaying ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
                                                    }`}
                                                >
                                                    {isThisPlaying ? (
                                                        <>
                                                            <Pause className="h-3.5 w-3.5" />
                                                            <span>Jeda</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-3.5 w-3.5" />
                                                            <span>Putar Audio</span>
                                                        </>
                                                    )}
                                                </Button>

                                                <Link href={route('quran.show', surah.nomor)} className="flex-1">
                                                    <Button
                                                        size="sm"
                                                        className="w-full text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl gap-1.5"
                                                    >
                                                        <BookOpen className="h-3.5 w-3.5" />
                                                        <span>Baca Surat</span>
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* TAB 2: DAFTAR 30 JUZ LENGKAP */}
                {activeTab === 'juz' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Pilih Juz untuk memutar murottal audio lengkap per juz atau membaca ayat pembukanya.</span>
                            </div>
                            <span className="font-mono font-bold">Total: 30 Juz</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {JUZ_LIST.map((juz: JuzInfo) => {
                                const isCurrentJuzPlaying = currentJuz?.number === juz.number && isPlaying;

                                return (
                                    <div
                                        key={juz.number}
                                        className={`bg-white dark:bg-neutral-900 border rounded-2xl transition shadow-sm p-5 flex flex-col justify-between ${
                                            currentJuz?.number === juz.number
                                                ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                                                : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-mono font-black text-sm shadow-sm">
                                                        {juz.number}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-neutral-900 dark:text-white">
                                                            {juz.name}
                                                        </div>
                                                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-serif">
                                                            {juz.arabicName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-xs bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-1">
                                                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                                    <strong>Mulai:</strong> {juz.startVerse}
                                                </div>
                                                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                                    <strong>Hingga:</strong> {juz.endVerse}
                                                </div>
                                                <div className="text-[10px] text-neutral-500 pt-0.5 truncate">
                                                    {juz.surahsDescription}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => playJuz(juz)}
                                                className={`flex-1 text-xs font-bold rounded-xl gap-1.5 ${
                                                    isCurrentJuzPlaying
                                                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                                }`}
                                            >
                                                {isCurrentJuzPlaying ? (
                                                    <>
                                                        <Pause className="h-3.5 w-3.5" />
                                                        <span>Juz Sedang Diputar</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-3.5 w-3.5" />
                                                        <span>Putar Murottal Juz {juz.number}</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </MarketplaceLayout>
    );
}
