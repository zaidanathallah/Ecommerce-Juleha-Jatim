import React, { useState } from 'react';
import { useAudio } from '@/Contexts/AudioContext';
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    BookOpen, 
    Bell, 
    BellOff,
    Compass, 
    ChevronUp, 
    ChevronDown,
    Radio,
    Clock
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function GlobalAudioPlayer() {
    const {
        isPlaying,
        isMuted,
        volume,
        currentSurah,
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

    const [isCollapsed, setIsCollapsed] = useState(false);

    // If Adzan is active, display the special Adzan sticky banner
    if (isAdzanPlaying) {
        return (
            <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-bounce duration-1000">
                <div className="bg-emerald-950 text-white border-2 border-emerald-400 p-4 shadow-2xl rounded-none flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div>
                            <div className="text-[11px] font-mono tracking-widest uppercase text-emerald-300 font-bold">
                                KALLAMULLAH • ADZAN BERKUMANDANG
                            </div>
                            <div className="text-sm font-bold text-white">
                                Waktu Sholat {adzanPrayerName}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={stopAdzan}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase rounded-none border border-red-400"
                    >
                        Hentikan Adzan
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <aside 
            aria-label="Global Murottal Player & Jadwal Sholat"
            className="fixed bottom-3 right-3 left-3 sm:left-auto sm:w-96 z-40 select-none"
        >
            <div className="bg-neutral-900/95 dark:bg-neutral-950/95 text-white border border-neutral-700 dark:border-neutral-800 shadow-2xl backdrop-blur-sm rounded-none">
                {/* Header Bar */}
                <div className="px-3.5 py-2 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
                    <div className="flex items-center gap-2">
                        <Radio className={`h-3.5 w-3.5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-neutral-300">
                            Murottal • Misyari Rasyid
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {notificationPermission !== 'granted' && (
                            <button
                                onClick={requestNotificationPermission}
                                title="Aktifkan Notifikasi Sholat (PWA)"
                                className="text-neutral-400 hover:text-amber-400 p-1 transition"
                            >
                                <Bell className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-neutral-400 hover:text-white p-1 transition"
                            title={isCollapsed ? 'Perbesar Player' : 'Kecilkan Player'}
                        >
                            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Player Body */}
                {!isCollapsed && (
                    <div className="p-3.5 space-y-3">
                        {/* Surah Details */}
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>QS. {currentSurah.namaLatin}</span>
                                    <span className="text-[11px] font-serif text-emerald-400">({currentSurah.nama})</span>
                                </div>
                                <div className="text-[10px] text-neutral-400">
                                    {currentSurah.arti ? `Arti: ${currentSurah.arti}` : 'Lantunan Ayat Suci Al-Quran'}
                                </div>
                            </div>

                            {/* Next Prayer Pill */}
                            {nextPrayer && (
                                <div className="text-right shrink-0">
                                    <div className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-emerald-400">
                                        <Clock className="h-2.5 w-2.5" />
                                        <span>{nextPrayer.name} {nextPrayer.time}</span>
                                    </div>
                                    <div className="text-[9px] text-neutral-500 font-mono mt-0.5" title={userLocation}>
                                        {userLocation.length > 20 ? userLocation.substring(0, 18) + '...' : userLocation}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls Bar: Play/Pause, Volume, Mute, Switch to Quran Page */}
                        <div className="flex items-center justify-between gap-3 pt-1 border-t border-neutral-800">
                            {/* Play & Mute Buttons */}
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={togglePlay}
                                    className={`h-8 px-3 rounded-none font-mono text-xs font-bold uppercase transition ${
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
                                    className="p-1.5 text-neutral-400 hover:text-white transition"
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
                                    className="w-16 h-1 bg-neutral-700 accent-emerald-500 cursor-pointer"
                                    title={`Volume: ${Math.round(volume * 100)}%`}
                                />
                            </div>

                            {/* Required Strict Button: "Matikan / Beralih Mode" */}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={stopAndRedirectToQuran}
                                className="h-8 px-2.5 border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold rounded-none shrink-0"
                                title="Hentikan audio dan baca Al-Qur'an secara mandiri"
                            >
                                <BookOpen className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                                <span>Beralih Mode</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
