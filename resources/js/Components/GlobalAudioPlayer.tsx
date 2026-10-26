import React, { useState } from 'react';
import { useAudio } from '@/Contexts/AudioContext';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    BookOpen, 
    Bell, 
    ChevronDown, 
    ChevronUp,
    Radio,
    Clock,
    VolumeOff,
    MapPin,
    Shuffle,
    Calendar
} from 'lucide-react';

export default function GlobalAudioPlayer() {
    const {
        isPlaying,
        isMuted,
        volume,
        currentSurah,
        currentJuz,
        togglePlay,
        toggleMute,
        setVolume,
        stopAndRedirectToQuran,
        nextPrayer,
        userLocation,
        isAdzanPlaying,
        adzanPrayerName,
        stopAdzan,
        notificationPermission,
        requestNotificationPermission
    } = useAudio();

    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    // If Adzan is actively playing: Show high contrast alert banner
    if (isAdzanPlaying) {
        return (
            <div 
                role="alert"
                aria-live="assertive"
                className="fixed bottom-3 right-3 left-3 sm:left-auto sm:w-96 z-50 bg-red-950 text-white border-2 border-red-500 shadow-2xl p-4 rounded-2xl animate-bounce-short select-none"
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <div>
                            <div className="text-xs font-black uppercase tracking-wider text-red-200">
                                Kumandang Adzan {adzanPrayerName}
                            </div>
                            <div className="text-[11px] text-neutral-300">
                                {userLocation}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={stopAdzan}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-xl border border-red-400 shadow-md"
                    >
                        Hentikan
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <aside 
            aria-label="Global Murottal Player & Jadwal Sholat"
            className="fixed bottom-3 right-3 left-3 sm:left-auto sm:w-[400px] z-40 select-none font-sans"
        >
            <div className="bg-neutral-900/95 dark:bg-neutral-950/95 text-white border border-neutral-700 dark:border-neutral-800 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
                {/* Header Bar */}
                <div className="px-4 py-2.5 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900">
                    <div className="flex items-center gap-2">
                        <Radio className={`h-3.5 w-3.5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
                        <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                            Murottal Per Juz • Acak Otomatis
                            <Shuffle className="h-3 w-3 text-neutral-400" />
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {notificationPermission !== 'granted' && (
                            <button
                                onClick={requestNotificationPermission}
                                title="Aktifkan Notifikasi Sholat (PWA)"
                                className="text-neutral-400 hover:text-amber-400 p-1.5 transition rounded-lg hover:bg-neutral-800"
                            >
                                <Bell className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-neutral-400 hover:text-white p-1.5 transition rounded-lg hover:bg-neutral-800"
                            title={isCollapsed ? 'Perbesar Player' : 'Kecilkan Player'}
                        >
                            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Player Body */}
                {!isCollapsed && (
                    <div className="p-4 space-y-3">
                        {/* Juz & Surah Details */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                                    <span className="text-emerald-400 font-extrabold">{currentJuz?.name || 'Juz'}</span>
                                    <span className="text-neutral-300 font-normal">({currentJuz?.arabicName})</span>
                                </div>
                                <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                                    Mulai: {currentJuz?.startVerse || currentSurah.arti}
                                </div>
                                <div className="text-[9px] text-neutral-500 font-mono mt-0.5 flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                                    <span className="truncate">Lokasi: {userLocation}</span>
                                </div>
                            </div>

                            {/* Next Prayer Pill */}
                            {nextPrayer && (
                                <Link
                                    href={route('prayer.schedule')}
                                    className="text-right shrink-0 block hover:opacity-90 transition group"
                                    title="Klik untuk membuka Halaman Jadwal Waktu Sholat Lengkap"
                                >
                                    <div className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 rounded-lg group-hover:border-emerald-500">
                                        <Clock className="h-3 w-3 text-emerald-400" />
                                        <span>{nextPrayer.name} {nextPrayer.time}</span>
                                    </div>
                                    <div className="text-[9px] text-emerald-400/80 font-mono mt-0.5 flex items-center justify-end gap-1">
                                        <Calendar className="h-2.5 w-2.5" />
                                        <span>Jadwal Sholat &gt;</span>
                                    </div>
                                </Link>
                            )}
                        </div>

                        {/* Controls Bar: Play/Pause, Volume, Mute, Switch to Quran Page */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                            {/* Play & Mute Buttons */}
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={togglePlay}
                                    className={`h-8 px-3.5 rounded-xl font-bold text-xs uppercase transition shadow-sm ${
                                        isPlaying 
                                            ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                >
                                    {isPlaying ? (
                                        <>
                                            <Pause className="h-3.5 w-3.5 mr-1" />
                                            <span>Jeda</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3.5 w-3.5 mr-1" />
                                            <span>Putar</span>
                                        </>
                                    )}
                                </Button>

                                <button
                                    onClick={toggleMute}
                                    className="p-1.5 text-neutral-400 hover:text-white transition rounded-lg hover:bg-neutral-800"
                                    title={isMuted ? 'Suarakan' : 'Bisukan'}
                                >
                                    {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                                </button>

                                {/* Volume slider */}
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-14 h-1 bg-neutral-700 accent-emerald-500 cursor-pointer rounded-lg"
                                    title={`Volume: ${Math.round(volume * 100)}%`}
                                />
                            </div>

                            {/* Link to Quran Page */}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={stopAndRedirectToQuran}
                                className="h-8 px-3 border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl shrink-0"
                                title="Buka Al-Qur'an Digital 30 Juz"
                            >
                                <BookOpen className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                                <span>Al-Qur'an 30 Juz</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
