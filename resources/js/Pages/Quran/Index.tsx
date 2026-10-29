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
    audioUrl?: string;
}

interface Props {
    surahs: SurahItem[];
    filters: {
        q?: string;
    };
}

export default function QuranIndex({ surahs = [], filters }: Props) {
    const { playSurah, playJuz, isPlaying, currentSurah, currentJuz, playingMode, togglePlay } = useAudio();
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
                {/* Hero / Header Section - Shopee Clean Standard */}
                <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-[#ee4d2d]/90 text-white p-6 sm:p-10 rounded-3xl border border-neutral-800 shadow-xl relative overflow-hidden">
                    <div className="max-w-3xl space-y-3 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/20 rounded-full font-mono text-xs uppercase font-bold text-orange-300">
                            <BookOpen className="h-3.5 w-3.5 text-[#ee4d2d]" />
                            <span>Al-Qur'anul Karim • 30 Juz &bull; 114 Surat</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                            Al-Qur'an Digital Juleha Jatim
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                            Bacaan Al-Qur'an lengkap 30 Juz dan 114 Surat terstandarisasi dengan terjemahan Bahasa Indonesia resmi Kemenag RI dan audio murottal merdu Syaikh Misyari Rasyid Al-Afasy. Audio dapat diputar per Juz penuh maupun per Surat secara fleksibel.
                        </p>

                        {/* Navigation Tabs (Surah vs Juz) */}
                        <div className="flex items-center gap-2 pt-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab('surah')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                    activeTab === 'surah'
                                        ? 'bg-[#ee4d2d] text-white scale-[1.02] shadow-orange-500/20'
                                        : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                                }`}
                            >
                                <ListFilter className="h-4 w-4" />
                                <span>Daftar 114 Surat</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('juz')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                    activeTab === 'juz'
                                        ? 'bg-[#ee4d2d] text-white scale-[1.02] shadow-orange-500/20'
                                        : 'bg-white/10 text-neutral-300 hover:bg-white/20'
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
                    <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari surat (contoh: Yasin, Al-Mulk, 36)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 text-xs rounded-xl border-neutral-300 focus:ring-[#ee4d2d] focus:border-[#ee4d2d]"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                size="sm" 
                                className="bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold rounded-xl px-4"
                            >
                                Cari
                            </Button>
                        </form>

                        <div className="text-xs text-neutral-500 font-mono">
                            Menampilkan <strong>{surahs.length}</strong> Surat
                        </div>
                    </div>
                )}

                {/* TAB 1: DAFTAR 114 SURAT */}
                {activeTab === 'surah' && (
                    <>
                        {surahs.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-2">
                                <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                    Surat tidak ditemukan
                                </p>
                                <p className="text-xs text-neutral-400">
                                    Silakan periksa kembali kata kunci pencarian Anda.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {surahs.map((surah) => {
                                    const isCurrentSurahPlaying = playingMode === 'surah' && currentSurah?.nomor === surah.nomor && isPlaying;

                                    return (
                                        <div
                                            key={surah.nomor}
                                            className={`bg-white dark:bg-neutral-900 border rounded-2xl transition shadow-sm p-5 flex flex-col justify-between ${
                                                currentSurah?.nomor === surah.nomor && playingMode === 'surah'
                                                    ? 'border-[#ee4d2d] ring-2 ring-[#ee4d2d]/30'
                                                    : 'border-neutral-200 dark:border-neutral-800 hover:border-[#ee4d2d]/60'
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#ee4d2d] flex items-center justify-center font-mono font-black text-sm shadow-xs">
                                                            {surah.nomor}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-neutral-900 dark:text-white">
                                                                QS. {surah.namaLatin}
                                                            </div>
                                                            <div className="text-[11px] text-neutral-500 font-medium">
                                                                {surah.arti}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="font-serif text-lg font-bold text-[#ee4d2d]">
                                                            {surah.nama}
                                                        </div>
                                                        {isCurrentSurahPlaying && (
                                                            <span className="text-[10px] text-orange-600 font-bold block animate-pulse">
                                                                &bull; Memutar
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-2">
                                                    <span>{surah.tempatTurun}</span>
                                                    <span>{surah.jumlahAyat} Ayat</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => playSurah({
                                                        nomor: surah.nomor,
                                                        namaLatin: surah.namaLatin,
                                                        nama: surah.nama,
                                                        arti: surah.arti,
                                                        jumlahAyat: surah.jumlahAyat,
                                                        audioUrl: surah.audioUrl,
                                                    })}
                                                    className={`flex-1 text-xs font-bold rounded-xl gap-1.5 border-orange-200 text-[#ee4d2d] hover:bg-orange-50 ${
                                                        isCurrentSurahPlaying ? 'bg-orange-100 text-[#ee4d2d]' : ''
                                                    }`}
                                                >
                                                    {isCurrentSurahPlaying ? (
                                                        <>
                                                            <Pause className="h-3.5 w-3.5" />
                                                            <span>Jeda Audio</span>
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
                                                        className="w-full text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl gap-1.5 shadow-sm"
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
                        <div className="p-4 bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-2xl flex items-center justify-between text-xs text-neutral-800 dark:text-neutral-200">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#ee4d2d] shrink-0" />
                                <span>Pilih Juz untuk memutar audio lengkap 1 Juz penuh atau membaca ayat-ayatnya dari awal hingga akhir Juz.</span>
                            </div>
                            <span className="font-mono font-bold text-[#ee4d2d]">Total: 30 Juz</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {JUZ_LIST.map((juz: JuzInfo) => {
                                const isCurrentJuzPlaying = playingMode === 'juz' && currentJuz?.number === juz.number && isPlaying;

                                return (
                                    <div
                                        key={juz.number}
                                        className={`bg-white dark:bg-neutral-900 border rounded-2xl transition shadow-sm p-5 flex flex-col justify-between ${
                                            currentJuz?.number === juz.number && playingMode === 'juz'
                                                ? 'border-[#ee4d2d] ring-2 ring-[#ee4d2d]/30'
                                                : 'border-neutral-200 dark:border-neutral-800 hover:border-[#ee4d2d]/60'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-[#ee4d2d] text-white flex items-center justify-center font-mono font-black text-sm shadow-sm">
                                                        {juz.number}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-neutral-900 dark:text-white">
                                                            {juz.name}
                                                        </div>
                                                        <div className="text-[11px] text-[#ee4d2d] font-serif font-bold">
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
                                                variant="outline"
                                                onClick={() => playJuz(juz)}
                                                className={`flex-1 text-xs font-bold rounded-xl gap-1.5 border-orange-200 text-[#ee4d2d] hover:bg-orange-50 ${
                                                    isCurrentJuzPlaying ? 'bg-orange-100 text-[#ee4d2d]' : ''
                                                }`}
                                            >
                                                {isCurrentJuzPlaying ? (
                                                    <>
                                                        <Pause className="h-3.5 w-3.5" />
                                                        <span>Jeda Audio</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-3.5 w-3.5" />
                                                        <span>Putar Juz {juz.number}</span>
                                                    </>
                                                )}
                                            </Button>

                                            <Link href={route('quran.juz', juz.number)} className="flex-1">
                                                <Button
                                                    size="sm"
                                                    className="w-full text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl gap-1.5 shadow-sm"
                                                >
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                    <span>Baca Juz {juz.number}</span>
                                                </Button>
                                            </Link>
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
