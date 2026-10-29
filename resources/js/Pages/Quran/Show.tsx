import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { useAudio, SurahSummary } from '@/Contexts/AudioContext';
import { 
    ChevronLeft, 
    ChevronRight, 
    Play, 
    Pause, 
    Volume2, 
    BookOpen, 
    Share2, 
    Radio,
    Copy,
    Check,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface AyahItem {
    nomorAyat: number;
    teksArab: string;
    teksIndonesia: string;
    verseKey?: string;
    juzNumber?: number;
}

interface SurahDetail {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    tempatTurun: string;
    arti: string;
    audioUrl?: string;
    ayat: AyahItem[];
}

interface Props {
    surah: SurahDetail;
}

export default function QuranShow({ surah }: Props) {
    const { playSurah, isPlaying, currentSurah, playingMode, togglePlay } = useAudio();
    const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

    const isCurrentSurahPlaying = playingMode === 'surah' && currentSurah?.nomor === surah.nomor && isPlaying;
    const fullAudioUrl = surah.audioUrl || `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surah.nomor}.mp3`;

    const handlePlayFullSurah = () => {
        const summary: SurahSummary = {
            nomor: surah.nomor,
            namaLatin: surah.namaLatin,
            nama: surah.nama,
            arti: surah.arti,
            jumlahAyat: surah.jumlahAyat,
            audioUrl: fullAudioUrl
        };

        if (currentSurah?.nomor === surah.nomor && playingMode === 'surah') {
            togglePlay();
        } else {
            playSurah(summary);
        }
    };

    const handleCopyAyah = (ayah: AyahItem) => {
        const textToCopy = `${ayah.teksArab}\n\n"${ayah.teksIndonesia}" (QS. ${surah.namaLatin} [${surah.nomor}:${ayah.nomorAyat}])`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedAyah(ayah.nomorAyat);
        setTimeout(() => setCopiedAyah(null), 2500);
    };

    return (
        <MarketplaceLayout>
            <Head title={`QS. ${surah.namaLatin} (${surah.nama}) - Al-Qur'an Digital Juleha Jatim`} />

            <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-4">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                    <Link
                        href={route('quran.index')}
                        className="hover:text-[#ee4d2d] flex items-center gap-1 font-bold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Daftar Surat & 30 Juz
                    </Link>

                    <div className="flex items-center gap-2">
                        {surah.nomor > 1 && (
                            <Link
                                href={route('quran.show', surah.nomor - 1)}
                                className="hover:text-[#ee4d2d] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800"
                            >
                                ← Surat Sebelumnya
                            </Link>
                        )}
                        {surah.nomor < 114 && (
                            <Link
                                href={route('quran.show', surah.nomor + 1)}
                                className="hover:text-[#ee4d2d] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800"
                            >
                                Surat Selanjutnya →
                            </Link>
                        )}
                    </div>
                </div>

                {/* Surah Header Banner - Shopee Clean Standard */}
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-3xl border border-neutral-700 p-6 sm:p-8 space-y-4 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-orange-400 font-bold">
                                <span>Surat ke-{surah.nomor}</span>
                                <span>&bull;</span>
                                <span>{surah.tempatTurun}</span>
                                <span>&bull;</span>
                                <span>{surah.jumlahAyat} Ayat</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                                QS. {surah.namaLatin}
                            </h1>
                            <p className="text-xs text-neutral-300 font-medium">
                                Artinya: "{surah.arti}"
                            </p>
                        </div>

                        <div className="text-right">
                            <div className="font-serif text-3xl sm:text-4xl font-black text-orange-400" dir="rtl">
                                {surah.nama}
                            </div>
                        </div>
                    </div>

                    {/* Surah Audio Player Trigger */}
                    <div className="pt-4 border-t border-neutral-700/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                            <Radio className={`h-4 w-4 ${isCurrentSurahPlaying ? 'text-[#ee4d2d] animate-pulse' : 'text-neutral-400'}`} />
                            <span>Qari: Syaikh Misyari Rasyid Al-Afasy (Quran Foundation v4)</span>
                        </div>

                        <Button
                            size="sm"
                            onClick={handlePlayFullSurah}
                            className={`rounded-xl font-bold text-xs uppercase transition shadow-sm ${
                                isCurrentSurahPlaying
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                    : 'bg-[#ee4d2d] hover:bg-[#d73211] text-white'
                            }`}
                        >
                            {isCurrentSurahPlaying ? (
                                <>
                                    <Pause className="h-4 w-4 mr-1.5" />
                                    <span>Jeda Audio Surat</span>
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-1.5" />
                                    <span>Putar Audio Surat</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Bismillah Banner (Omitted on Surah At-Taubah #9) */}
                {surah.nomor !== 9 && (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center shadow-xs">
                        <div className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-neutral-100 font-bold" dir="rtl">
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                        </div>
                        <div className="text-xs font-sans text-neutral-500 mt-2 italic">
                            Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
                        </div>
                    </div>
                )}

                {/* List of Verses (Ayat) */}
                <div className="space-y-4">
                    {surah.ayat?.map((ayah) => {
                        const isCopied = copiedAyah === ayah.nomorAyat;

                        return (
                            <div
                                key={ayah.nomorAyat}
                                id={`ayat-${ayah.nomorAyat}`}
                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs hover:border-orange-200 transition"
                            >
                                {/* Verse Header & Action toolbar */}
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#ee4d2d] flex items-center justify-center font-mono font-black text-xs">
                                            {ayah.nomorAyat}
                                        </div>
                                        <span className="text-[11px] font-mono text-neutral-400">
                                            {surah.nomor}:{ayah.nomorAyat}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopyAyah(ayah)}
                                            className="h-8 text-neutral-500 hover:text-[#ee4d2d] gap-1 text-[11px] rounded-lg"
                                        >
                                            {isCopied ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5 text-[#ee4d2d]" />
                                                    <span className="text-[#ee4d2d] font-bold">Tersalin</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3.5 w-3.5" />
                                                    <span>Salin Ayat</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Arabic Text with Uthmani script */}
                                <div
                                    className="font-serif text-2xl sm:text-3xl leading-[2.2] text-right text-neutral-900 dark:text-neutral-100 pt-2 selection:bg-orange-100"
                                    dir="rtl"
                                >
                                    {ayah.teksArab}
                                </div>

                                {/* Indonesian Translation (Kemenag RI) */}
                                <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed pt-2 border-t border-neutral-50 dark:border-neutral-800">
                                    {ayah.teksIndonesia}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </MarketplaceLayout>
    );
}
