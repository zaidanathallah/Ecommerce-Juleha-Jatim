import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { useAudio } from '@/Contexts/AudioContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
    Clock, 
    MapPin, 
    Compass, 
    Bell, 
    Volume2, 
    VolumeX, 
    Calendar, 
    Sparkles, 
    CheckCircle2, 
    ArrowLeft,
    Sun,
    Sunrise,
    Sunset,
    Moon
} from 'lucide-react';

export default function PrayerSchedule() {
    const { 
        prayerTimes, 
        nextPrayer, 
        userLocation, 
        userCoords, 
        notificationPermission, 
        requestNotificationPermission 
    } = useAudio();

    // Live real-time ticking clock
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [audioTestPlaying, setAudioTestPlaying] = useState(false);
    const [audioTestInstance, setAudioTestInstance] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    const formattedDigitalClock = `${hours}:${minutes}:${seconds} WIB`;

    const formattedDate = currentTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Countdown to next prayer
    const [countdown, setCountdown] = useState<string>('');

    useEffect(() => {
        if (!nextPrayer || !nextPrayer.time) {
            setCountdown('');
            return;
        }

        const [targetHour, targetMinute] = nextPrayer.time.split(':').map(Number);
        const now = new Date();
        const targetDate = new Date();
        targetDate.setHours(targetHour, targetMinute, 0, 0);

        if (targetDate.getTime() <= now.getTime()) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const diffMs = targetDate.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

        setCountdown(
            `${String(diffHrs).padStart(2, '0')} jam ${String(diffMins).padStart(2, '0')} menit ${String(diffSecs).padStart(2, '0')} detik`
        );
    }, [currentTime, nextPrayer]);

    const handleTestAdzan = () => {
        if (audioTestPlaying && audioTestInstance) {
            audioTestInstance.pause();
            setAudioTestPlaying(false);
            return;
        }

        const audio = new Audio('/audio/adzan_regular.mp3');
        audio.volume = 1.0;
        audio.play().then(() => {
            setAudioTestPlaying(true);
            setAudioTestInstance(audio);
        }).catch((err) => {
            console.error('Play adzan failed:', err);
            alert('Tidak dapat memutar audio: ' + err.message);
        });

        audio.onended = () => {
            setAudioTestPlaying(false);
        };
    };

    const prayerCards = [
        {
            name: 'Subuh',
            key: 'Fajr',
            time: prayerTimes.Fajr,
            icon: Sunrise,
            color: 'from-blue-600 to-indigo-700',
            textColor: 'text-blue-600',
            bgLight: 'bg-blue-50 dark:bg-blue-950/40',
            borderColor: 'border-blue-200 dark:border-blue-800',
        },
        {
            name: 'Dzuhur',
            key: 'Dhuhr',
            time: prayerTimes.Dhuhr,
            icon: Sun,
            color: 'from-amber-500 to-orange-600',
            textColor: 'text-amber-600',
            bgLight: 'bg-amber-50 dark:bg-amber-950/40',
            borderColor: 'border-amber-200 dark:border-amber-800',
        },
        {
            name: 'Ashar',
            key: 'Asr',
            time: prayerTimes.Asr,
            icon: Sun,
            color: 'from-orange-500 to-rose-600',
            textColor: 'text-orange-600',
            bgLight: 'bg-orange-50 dark:bg-orange-950/40',
            borderColor: 'border-orange-200 dark:border-orange-800',
        },
        {
            name: 'Maghrib',
            key: 'Maghrib',
            time: prayerTimes.Maghrib,
            icon: Sunset,
            color: 'from-rose-600 to-purple-700',
            textColor: 'text-rose-600',
            bgLight: 'bg-rose-50 dark:bg-rose-950/40',
            borderColor: 'border-rose-200 dark:border-rose-800',
        },
        {
            name: 'Isya',
            key: 'Isha',
            time: prayerTimes.Isha,
            icon: Moon,
            color: 'from-indigo-700 to-neutral-900',
            textColor: 'text-indigo-600',
            bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
            borderColor: 'border-indigo-200 dark:border-indigo-800',
        },
    ];

    return (
        <MarketplaceLayout>
            <Head title="Jadwal Waktu Sholat Realtime - Juleha Jawa Timur" />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
                {/* Back button */}
                <div>
                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ee4d2d] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Beranda Marketplace</span>
                    </Link>
                </div>

                {/* Main Hero Card: Live Digital Clock & User Geolocation */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ee4d2d] via-orange-600 to-amber-600 text-white shadow-2xl p-6 sm:p-10 border border-orange-500/50">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-bold text-white tracking-wider backdrop-blur-sm">
                                <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                                <span>WAKTU SHOLAT REALTIME & AKURAT</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                                Jadwal Sholat Jawa Timur
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90">
                                <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20">
                                    <MapPin className="h-4 w-4 text-amber-300 shrink-0" />
                                    <span className="font-bold">Lokasi Anda:</span>
                                    <span>{userLocation}</span>
                                </div>

                                <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20 font-mono text-[11px]">
                                    <Compass className="h-4 w-4 text-amber-300 shrink-0" />
                                    <span>Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}</span>
                                </div>
                            </div>

                            <p className="text-xs text-white/80 pt-1">
                                Waktu dihitung presisi berdasarkan koordinat lintang & bujur GPS perangkat Anda menggunakan standar Kementerian Agama RI / Aladhan API.
                            </p>
                        </div>

                        {/* Digital Clock Box */}
                        <div className="bg-black/30 backdrop-blur-md border border-white/30 rounded-3xl p-6 sm:p-8 text-center shrink-0 shadow-lg">
                            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200 mb-1">
                                <Clock className="h-4 w-4 text-amber-300 animate-pulse" />
                                <span>Jam Digital Real-Time</span>
                            </div>
                            <div className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-white">
                                {formattedDigitalClock}
                            </div>
                            <div className="text-xs text-white/90 font-medium mt-2 flex items-center justify-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-amber-300" />
                                <span>{formattedDate}</span>
                            </div>

                            {nextPrayer && (
                                <div className="mt-4 pt-3 border-t border-white/20 text-xs">
                                    <div className="text-white font-bold">
                                        Menuju Waktu {nextPrayer.name} ({nextPrayer.time})
                                    </div>
                                    <div className="font-mono text-amber-200 font-black text-sm mt-0.5">
                                        {countdown}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Strip: Notification & Adzan Test */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-neutral-900 dark:text-white">
                                Notifikasi Adzan Otomatis (PWA)
                            </p>
                            <p className="text-[11px] text-neutral-500">
                                {notificationPermission === 'granted'
                                    ? 'Notifikasi aktif! Anda akan mendapatkan peringatan saat waktu sholat tiba.'
                                    : 'Izinkan notifikasi agar sistem berbunyi otomatis saat masuk waktu sholat.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {notificationPermission !== 'granted' && (
                            <Button
                                size="sm"
                                onClick={requestNotificationPermission}
                                className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm"
                            >
                                Aktifkan Notifikasi
                            </Button>
                        )}

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleTestAdzan}
                            className="text-xs font-bold rounded-xl border-neutral-300 dark:border-neutral-700 gap-1.5"
                        >
                            {audioTestPlaying ? (
                                <>
                                    <VolumeX className="h-4 w-4 text-red-500" />
                                    <span>Hentikan Suara Adzan</span>
                                </>
                            ) : (
                                <>
                                    <Volume2 className="h-4 w-4 text-emerald-700" />
                                    <span>Tes Suara Adzan Merdu</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* 5 Waktu Sholat Grid */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                        <span>Waktu 5 Sholat Fardhu Hari Ini</span>
                        <span className="text-xs font-normal text-neutral-500">({userLocation})</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {prayerCards.map((prayer) => {
                            const isNext = nextPrayer?.name.toLowerCase().includes(prayer.name.toLowerCase());
                            const IconComponent = prayer.icon;

                            return (
                                <Card
                                    key={prayer.key}
                                    className={`relative overflow-hidden rounded-2xl border-2 transition-all shadow-sm ${
                                        isNext
                                            ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-md scale-[1.02]'
                                            : `${prayer.borderColor} ${prayer.bgLight} hover:border-neutral-400`
                                    }`}
                                >
                                    {isNext && (
                                        <div className="bg-emerald-700 text-white text-[10px] font-black uppercase text-center py-1 tracking-wider">
                                            WAKTU BERIKUTNYA
                                        </div>
                                    )}

                                    <CardContent className="p-5 text-center space-y-3">
                                        <div className="inline-flex p-3 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm mx-auto">
                                            <IconComponent className={`h-6 w-6 ${prayer.textColor}`} />
                                        </div>

                                        <div>
                                            <div className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                                Sholat {prayer.name}
                                            </div>
                                            <div className="text-2xl sm:text-3xl font-mono font-black text-neutral-900 dark:text-white mt-1">
                                                {prayer.time || '--:--'}
                                            </div>
                                        </div>

                                        <div className="text-[10px] text-neutral-500 font-medium">
                                            WIB (Jawa Timur)
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Doa Setelah Adzan */}
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-sm">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <span>Doa Setelah Mendengar Kumandang Adzan</span>
                    </div>

                    <p className="text-lg sm:text-xl font-serif text-right text-neutral-900 dark:text-neutral-100 leading-loose">
                        اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاَةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ
                    </p>

                    <p className="text-xs italic text-neutral-700 dark:text-neutral-300">
                        "Allahumma rabba hazihid da'watit tammah, wash shalatil qa'imah, ati muhammadanil wasilata wal fadhilah, wab'atshu maqamam mahmudanillazi wa'adtah."
                    </p>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 border-t border-emerald-200 dark:border-emerald-800 pt-2 leading-relaxed">
                        <strong>Artinya:</strong> "Ya Allah, Tuhan pemilik seruan yang sempurna ini dan sholat yang senantiasa didirikan, berikanlah kepada Nabi Muhammad wasilah (kedudukan yang mulia) dan keutamaan, serta tempatkanlah beliau pada tempat terpuji yang telah Engkau janjikan." (HR. Bukhari).
                    </p>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
