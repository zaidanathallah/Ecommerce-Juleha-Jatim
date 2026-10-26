import React, { useState, useRef } from 'react';
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
    Check
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface AyahItem {
    nomorAyat: number;
    teksArab: string;
    teksLatin: string;
    teksIndonesia: string;
    audio?: {
        [key: string]: string;
    };
}

interface SurahDetail {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    tempatTurun: string;
    arti: string;
    deskripsi: string;
    audioFull?: {
        [key: string]: string;
    };
    ayat: AyahItem[];
    suratSebelumnya?: {
        nomor: number;
        namaLatin: string;
    } | false;
    suratSelanjutnya?: {
        nomor: number;
        namaLatin: string;
    } | false;
}

interface Props {
    surah: SurahDetail;
}

export default function QuranShow({ surah }: Props) {
    const { playSurah, isPlaying, currentSurah, togglePlay } = useAudio();
    const [playingAyah, setPlayingAyah] = useState<number | null>(null);
    const ayahAudioRef = useRef<HTMLAudioElement | null>(null);
    const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

    const isCurrentSurahPlaying = currentSurah.nomor === surah.nomor && isPlaying;
    const fullAudioUrl = surah.audioFull?.['05'] || `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${String(surah.nomor).padStart(3, '0')}.mp3`;

    const handlePlayFullSurah = () => {
        const summary: SurahSummary = {
            nomor: surah.nomor,
            namaLatin: surah.namaLatin,
            nama: surah.nama,
            arti: surah.arti,
            audioUrl: fullAudioUrl
        };

        if (currentSurah.nomor === surah.nomor) {
            togglePlay();
        } else {
            playSurah(summary);
        }
    };

    const handlePlayAyah = (ayah: AyahItem) => {
        const audioUrl = ayah.audio?.['05'] || Object.values(ayah.audio || {})[0];
        if (!audioUrl) return;

        if (playingAyah === ayah.nomorAyat) {
            if (ayahAudioRef.current) {
                ayahAudioRef.current.pause();
            }
            setPlayingAyah(null);
            return;
        }

        if (ayahAudioRef.current) {
            ayahAudioRef.current.pause();
        }

        const audio = new Audio(audioUrl);
        audio.play().then(() => {
            setPlayingAyah(ayah.nomorAyat);
        }).catch(console.error);

        audio.onended = () => {
            setPlayingAyah(null);
        };

        ayahAudioRef.current = audio;
    };

    const handleCopyAyah = (ayah: AyahItem) => {
        const textToCopy = `${ayah.teksArab}\n\n${ayah.teksLatin}\n\n"${ayah.teksIndonesia}" (QS. ${surah.namaLatin}: ${ayah.nomorAyat})`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedAyah(ayah.nomorAyat);
        setTimeout(() => setCopiedAyah(null), 2000);
    };

    return (
        <MarketplaceLayout>
            <Head title={`Surat ${surah.namaLatin} (${surah.nama}) - Al-Qur'an Juleha`} />

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Navigation Breadcrumb & Back button */}
                <div className="flex items-center justify-between font-mono text-xs text-neutral-500">
                    <Link
                        href={route('quran.index')}
                        className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Daftar 114 Surat</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {surah.suratSebelumnya && (
                            <Link
                                href={route('quran.show', surah.suratSebelumnya.nomor)}
                                className="hover:text-neutral-900 dark:hover:text-white px-2 py-1 border border-neutral-300 dark:border-neutral-700"
                            >
                                ← QS. {surah.suratSebelumnya.namaLatin}
                            </Link>
                        )}
                        {surah.suratSelanjutnya && (
                            <Link
                                href={route('quran.show', surah.suratSelanjutnya.nomor)}
                                className="hover:text-neutral-900 dark:hover:text-white px-2 py-1 border border-neutral-300 dark:border-neutral-700"
                            >
                                QS. {surah.suratSelanjutnya.namaLatin} →
                            </Link>
                        )}
                    </div>
                </div>

                {/* Surah Header Banner */}
                <div className="bg-emerald-950 text-white border-2 border-emerald-800 p-6 sm:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">
                                <span>Surat ke-{surah.nomor}</span>
                                <span>•</span>
                                <span>{surah.tempatTurun}</span>
                                <span>•</span>
                                <span>{surah.jumlahAyat} Ayat</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                                {surah.namaLatin}
                            </h1>
                            <p className="text-xs text-emerald-200 font-medium">
                                Artinya: "{surah.arti}"
                            </p>
                        </div>

                        <div className="text-right sm:text-right">
                            <div className="font-serif text-3xl sm:text-4xl font-black text-emerald-300" dir="rtl">
                                {surah.nama}
                            </div>
                        </div>
                    </div>

                    {/* Surah Audio Player Trigger */}
                    <div className="pt-4 border-t border-emerald-900 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                            <Radio className={`h-4 w-4 ${isCurrentSurahPlaying ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'}`} />
                            <span>Qori: Syaikh Misyari Rasyid Al-Afasy (Full Audio)</span>
                        </div>

                        <Button
                            size="sm"
                            onClick={handlePlayFullSurah}
                            className={`rounded-none font-mono text-xs font-bold uppercase transition ${
                                isCurrentSurahPlaying
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                        >
                            {isCurrentSurahPlaying ? (
                                <>
                                    <Pause className="h-4 w-4 mr-1.5" />
                                    <span>Jeda Surat Penuh</span>
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-1.5" />
                                    <span>Putar Surat Penuh</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Bismillah Banner (Omitted on Surah At-Taubah #9) */}
                {surah.nomor !== 9 && (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 p-6 text-center shadow-sm">
                        <div className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-neutral-100 font-bold" dir="rtl">
                            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                        </div>
                        <div className="text-xs font-sans text-neutral-500 mt-2 italic">
                            Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
                        </div>
                    </div>
                )}

                {/* Ayat List */}
                <div className="space-y-4">
                    {surah.ayat.map((ayah) => {
                        const isThisAyahPlaying = playingAyah === ayah.nomorAyat;

                        return (
                            <article
                                key={ayah.nomorAyat}
                                id={`ayat-${ayah.nomorAyat}`}
                                className={`bg-white dark:bg-neutral-900 border ${
                                    isThisAyahPlaying
                                        ? 'border-emerald-600 ring-1 ring-emerald-600'
                                        : 'border-neutral-300 dark:border-neutral-800'
                                } p-5 sm:p-6 space-y-4 transition`}
                            >
                                {/* Verse Header Toolbar */}
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                                            {ayah.nomorAyat}
                                        </div>
                                        <span className="font-mono text-[11px] text-neutral-400">
                                            QS. {surah.namaLatin}:{ayah.nomorAyat}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handlePlayAyah(ayah)}
                                            className={`p-1.5 text-xs font-mono font-bold flex items-center gap-1 border transition ${
                                                isThisAyahPlaying
                                                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                                    : 'text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                            }`}
                                            title="Putar audio ayat ini"
                                        >
                                            {isThisAyahPlaying ? (
                                                <>
                                                    <Pause className="h-3.5 w-3.5 text-amber-600" />
                                                    <span className="text-[10px]">Jeda</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-3.5 w-3.5 text-emerald-600" />
                                                    <span className="text-[10px]">Dengar</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleCopyAyah(ayah)}
                                            className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 transition"
                                            title="Salin ayat & terjemahan"
                                        >
                                            {copiedAyah === ayah.nomorAyat ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Arabic Text (Large, crisp font with right alignment) */}
                                <div className="py-2 text-right">
                                    <p 
                                        className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-neutral-100 leading-[2.2] tracking-wide" 
                                        dir="rtl"
                                    >
                                        {ayah.teksArab}
                                    </p>
                                </div>

                                {/* Latin Transliteration */}
                                <div className="text-xs sm:text-sm font-sans text-emerald-800 dark:text-emerald-400 italic">
                                    {ayah.teksLatin}
                                </div>

                                {/* Indonesian Translation */}
                                <div className="text-xs sm:text-sm font-sans text-neutral-700 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
                                    {ayah.teksIndonesia}
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* Bottom Pagination / Next Prev Surah */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-800 font-mono text-xs">
                    {surah.suratSebelumnya ? (
                        <Link
                            href={route('quran.show', surah.suratSebelumnya.nomor)}
                            className="inline-flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                            <ChevronLeft className="h-4 w-4 text-emerald-600" />
                            <span>Sebelumnya: QS. {surah.suratSebelumnya.namaLatin}</span>
                        </Link>
                    ) : <div />}

                    {surah.suratSelanjutnya ? (
                        <Link
                            href={route('quran.show', surah.suratSelanjutnya.nomor)}
                            className="inline-flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                            <span>Selanjutnya: QS. {surah.suratSelanjutnya.namaLatin}</span>
                            <ChevronRight className="h-4 w-4 text-emerald-600" />
                        </Link>
                    ) : <div />}
                </div>
            </div>
        </MarketplaceLayout>
    );
}
