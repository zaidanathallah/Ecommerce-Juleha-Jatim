import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { useAudio } from '@/Contexts/AudioContext';
import { JUZ_LIST } from '@/data/juzData';
import { 
    Play, 
    Pause, 
    BookOpen, 
    Radio,
    Copy,
    Check,
    ArrowLeft,
    Layers,
    Sparkles
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface AyahItem {
    nomorAyat: number;
    teksArab: string;
    teksIndonesia: string;
    verseKey: string;
    juzNumber?: number;
    pageNumber?: number;
}

interface JuzDetail {
    number: number;
    versesCount: number;
    audioUrl: string;
    firstVerse: string;
    lastVerse: string;
    ayat: AyahItem[];
    meta?: any;
}

interface Props {
    juz: JuzDetail;
}

export default function QuranJuz({ juz }: Props) {
    const { playJuz, isPlaying, currentJuz, playingMode, togglePlay } = useAudio();
    const [copiedAyah, setCopiedAyah] = useState<string | null>(null);

    const juzStaticInfo = JUZ_LIST.find((j) => j.number === juz.number) || {
        number: juz.number,
        name: `Juz ${juz.number}`,
        arabicName: `الجزء ${juz.number}`,
        startVerse: juz.firstVerse,
        endVerse: juz.lastVerse,
        startSurahNumber: 1,
        startSurahName: 'Al-Qur\'an',
        surahsDescription: `${juz.versesCount} Ayat`,
        audioUrl: juz.audioUrl,
    };

    const isCurrentJuzPlaying = playingMode === 'juz' && currentJuz?.number === juz.number && isPlaying;

    const handlePlayThisJuz = () => {
        if (currentJuz?.number === juz.number && playingMode === 'juz') {
            togglePlay();
        } else {
            playJuz(juzStaticInfo);
        }
    };

    const handleCopyAyah = (ayah: AyahItem) => {
        const textToCopy = `${ayah.teksArab}\n\n"${ayah.teksIndonesia}" (QS. [${ayah.verseKey}] • Juz ${juz.number})`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedAyah(ayah.verseKey);
        setTimeout(() => setCopiedAyah(null), 2500);
    };

    return (
        <MarketplaceLayout>
            <Head title={`Baca Juz ${juz.number} (${juzStaticInfo.arabicName}) - Al-Qur'an Digital 30 Juz`} />

            <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-4">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                    <Link
                        href={route('quran.index')}
                        className="hover:text-[#ee4d2d] flex items-center gap-1 font-bold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Daftar 30 Juz & 114 Surat
                    </Link>

                    <div className="flex items-center gap-2">
                        {juz.number > 1 && (
                            <Link
                                href={route('quran.juz', juz.number - 1)}
                                className="hover:text-[#ee4d2d] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800"
                            >
                                ← Juz Sebelumnya ({juz.number - 1})
                            </Link>
                        )}
                        {juz.number < 30 && (
                            <Link
                                href={route('quran.juz', juz.number + 1)}
                                className="hover:text-[#ee4d2d] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800"
                            >
                                Juz Selanjutnya ({juz.number + 1}) →
                            </Link>
                        )}
                    </div>
                </div>

                {/* Juz Header Banner - Shopee Clean Standard */}
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-3xl border border-neutral-700 p-6 sm:p-8 space-y-4 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-orange-400 font-bold">
                                <Layers className="h-3.5 w-3.5" />
                                <span>Al-Qur'anul Karim • Juz ke-{juz.number}</span>
                                <span>&bull;</span>
                                <span>{juz.versesCount} Ayat</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                                {juzStaticInfo.name}
                            </h1>
                            <p className="text-xs text-neutral-300 font-medium">
                                Rentang Ayat: <strong>{juzStaticInfo.startVerse}</strong> hingga <strong>{juzStaticInfo.endVerse}</strong>
                            </p>
                        </div>

                        <div className="text-right">
                            <div className="font-serif text-3xl sm:text-4xl font-black text-orange-400" dir="rtl">
                                {juzStaticInfo.arabicName}
                            </div>
                        </div>
                    </div>

                    {/* Juz Audio Player Trigger */}
                    <div className="pt-4 border-t border-neutral-700/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                            <Radio className={`h-4 w-4 ${isCurrentJuzPlaying ? 'text-[#ee4d2d] animate-pulse' : 'text-neutral-400'}`} />
                            <span>Murottal Penuh 1 Juz • Qari: Syaikh Misyari Rasyid Al-Afasy</span>
                        </div>

                        <Button
                            size="sm"
                            onClick={handlePlayThisJuz}
                            className={`rounded-xl font-bold text-xs uppercase transition shadow-sm ${
                                isCurrentJuzPlaying
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                    : 'bg-[#ee4d2d] hover:bg-[#d73211] text-white'
                            }`}
                        >
                            {isCurrentJuzPlaying ? (
                                <>
                                    <Pause className="h-4 w-4 mr-1.5" />
                                    <span>Jeda Audio Juz {juz.number}</span>
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-1.5" />
                                    <span>Putar Audio Juz {juz.number} Penuh</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Verses List */}
                <div className="space-y-4">
                    {juz.ayat?.map((ayah) => {
                        const isCopied = copiedAyah === ayah.verseKey;

                        return (
                            <div
                                key={ayah.verseKey}
                                id={`ayat-${ayah.verseKey}`}
                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs hover:border-orange-200 transition"
                            >
                                {/* Verse Header & Action Toolbar */}
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2.5 py-1 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#ee4d2d] font-mono font-black text-xs">
                                            QS. {ayah.verseKey}
                                        </div>
                                        <span className="text-[11px] font-mono text-neutral-400">
                                            Ayat ke-{ayah.nomorAyat}
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
