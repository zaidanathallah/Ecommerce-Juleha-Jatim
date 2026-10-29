import React, { createContext, useContext, useEffect, useRef, useState, PropsWithChildren } from 'react';
import { router } from '@inertiajs/react';
import { JUZ_LIST, getRandomJuz, JuzInfo } from '@/data/juzData';

export interface SurahSummary {
    nomor: number;
    namaLatin: string;
    nama: string;
    arti?: string;
    jumlahAyat?: number;
    audioUrl?: string;
}

export interface PrayerTimes {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

interface AudioContextType {
    // Murottal state
    isPlaying: boolean;
    isMuted: boolean;
    volume: number; // 0 to 1
    playingMode: 'juz' | 'surah';
    currentSurah: SurahSummary;
    currentJuz: JuzInfo;
    togglePlay: () => void;
    toggleMute: () => void;
    setVolume: (v: number) => void;
    playSurah: (surah: SurahSummary) => void;
    playJuz: (juz: JuzInfo) => void;
    stopAndRedirectToQuran: () => void;

    // Adzan & Prayer Times state
    prayerTimes: PrayerTimes;
    nextPrayer: { name: string; time: string } | null;
    userLocation: string;
    userCoords: { lat: number; lng: number };
    isAdzanPlaying: boolean;
    adzanPrayerName: string | null;
    isShubuhAdzan: boolean;
    stopAdzan: () => void;
    isAdzanModalOpen: boolean;
    closeAdzanModal: () => void;

    // PWA Notification
    notificationPermission: NotificationPermission;
    requestNotificationPermission: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Default fallback prayer timings for Surabaya (East Java)
const DEFAULT_PRAYER_TIMINGS: PrayerTimes = {
    Fajr: '04:05',
    Dhuhr: '11:35',
    Asr: '14:50',
    Maghrib: '17:35',
    Isha: '18:45'
};

const PRAYER_NAMES_ID: Record<string, string> = {
    Fajr: 'Subuh',
    Dhuhr: 'Dzuhur',
    Asr: 'Ashar',
    Maghrib: 'Maghrib',
    Isha: 'Isya'
};

interface AudioProviderProps extends PropsWithChildren {
    initialSettings?: {
        is_global_murottal_active?: boolean;
        is_adzan_active?: boolean;
        murottal_volume?: number;
    };
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children, initialSettings }) => {
    // Read settings from props or default
    const isGlobalMurottalEnabled = initialSettings?.is_global_murottal_active ?? true;
    const isAdzanEnabled = initialSettings?.is_adzan_active ?? true;
    const configuredVolume = (initialSettings?.murottal_volume ?? 50) / 100;

    // Pick a random Juz on arrival every time user enters the ecommerce
    const [currentJuz, setCurrentJuz] = useState<JuzInfo>(() => getRandomJuz());
    const [playingMode, setPlayingMode] = useState<'juz' | 'surah'>('juz');

    // Audio instances (Persistent across page re-renders)
    const murottalRef = useRef<HTMLAudioElement | null>(null);
    const adzanRef = useRef<HTMLAudioElement | null>(null);

    // Audio states
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [volume, setVolumeState] = useState<number>(configuredVolume);
    const [currentSurah, setCurrentSurah] = useState<SurahSummary>({
        nomor: currentJuz.startSurahNumber,
        namaLatin: currentJuz.name,
        nama: currentJuz.arabicName,
        arti: currentJuz.startVerse,
        audioUrl: currentJuz.audioUrl,
    });

    // Adzan & Location states
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(DEFAULT_PRAYER_TIMINGS);
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
    const [userLocation, setUserLocation] = useState<string>('Surabaya, Jawa Timur');
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: -7.2575, lng: 112.7521 });
    const [isAdzanPlaying, setIsAdzanPlaying] = useState<boolean>(false);
    const [adzanPrayerName, setAdzanPrayerName] = useState<string | null>(null);
    const [isShubuhAdzan, setIsShubuhAdzan] = useState<boolean>(false);
    const [isAdzanModalOpen, setIsAdzanModalOpen] = useState<boolean>(false);

    // Notification states
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    // Track triggered adzans to prevent repeating inside the same minute
    const lastTriggeredRef = useRef<string>('');
    const hasAutoPlayedRef = useRef<boolean>(false);

    // 1. Initialize Audio Elements
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize Murottal Audio with random Juz
        const mAudio = new Audio(currentJuz.audioUrl);
        mAudio.preload = 'auto';
        mAudio.volume = volume;
        mAudio.loop = true;
        murottalRef.current = mAudio;

        // Initialize Adzan Audio with local fallbacks
        const aAudio = new Audio('/audio/adzan_regular.mp3');
        aAudio.preload = 'auto';
        aAudio.volume = 1.0;
        adzanRef.current = aAudio;

        // Murottal event listeners
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        mAudio.addEventListener('play', onPlay);
        mAudio.addEventListener('pause', onPause);
        mAudio.addEventListener('ended', onEnded);

        // Adzan event listeners
        const onAdzanEnded = () => {
            setIsAdzanPlaying(false);
            setAdzanPrayerName(null);
            setIsAdzanModalOpen(false);

            // Resume Murottal if it was playing and global enabled
            if (isGlobalMurottalEnabled && murottalRef.current) {
                murottalRef.current.play().catch((e) => console.log('Resume error:', e));
            }
        };

        aAudio.addEventListener('ended', onAdzanEnded);

        return () => {
            mAudio.removeEventListener('play', onPlay);
            mAudio.removeEventListener('pause', onPause);
            mAudio.removeEventListener('ended', onEnded);
            aAudio.removeEventListener('ended', onAdzanEnded);
            mAudio.pause();
            aAudio.pause();
        };
    }, []);

    // 2. Reliable Autoplay Handler for Murottal (Fixed for Reopening & First Gesture)
    useEffect(() => {
        if (!isGlobalMurottalEnabled || typeof window === 'undefined') return;

        const attemptAutoplay = () => {
            if (!murottalRef.current || isAdzanPlaying) return;

            // Direct unmuted playback attempt
            const playPromise = murottalRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        hasAutoPlayedRef.current = true;
                    })
                    .catch((err) => {
                        console.log('Unmuted autoplay standby, waiting user gesture:', err);
                        // Browser autoplay policy standby: start muted to buffer immediately
                        if (murottalRef.current && !hasAutoPlayedRef.current) {
                            murottalRef.current.muted = true;
                            murottalRef.current.play().then(() => {
                                setIsPlaying(true);
                            }).catch(() => {});
                        }
                    });
            }
        };

        attemptAutoplay();

        // On first user interaction anywhere (click, touch, pointer, scroll, keydown):
        // Unmute and ensure audio plays with full configured volume!
        const handleUnlockAudio = () => {
            if (murottalRef.current && isGlobalMurottalEnabled && !isAdzanPlaying) {
                murottalRef.current.muted = false;
                murottalRef.current.volume = volume;
                if (murottalRef.current.paused) {
                    murottalRef.current.play().then(() => {
                        setIsPlaying(true);
                        hasAutoPlayedRef.current = true;
                    }).catch(() => {});
                } else {
                    setIsPlaying(true);
                    hasAutoPlayedRef.current = true;
                }
            }
            cleanupUnlockListeners();
        };

        const cleanupUnlockListeners = () => {
            window.removeEventListener('pointerdown', handleUnlockAudio);
            window.removeEventListener('click', handleUnlockAudio);
            window.removeEventListener('keydown', handleUnlockAudio);
            window.removeEventListener('touchstart', handleUnlockAudio);
            window.removeEventListener('scroll', handleUnlockAudio);
        };

        window.addEventListener('pointerdown', handleUnlockAudio, { passive: true });
        window.addEventListener('click', handleUnlockAudio, { passive: true });
        window.addEventListener('keydown', handleUnlockAudio, { passive: true });
        window.addEventListener('touchstart', handleUnlockAudio, { passive: true });
        window.addEventListener('scroll', handleUnlockAudio, { passive: true });

        return () => {
            cleanupUnlockListeners();
        };
    }, [isGlobalMurottalEnabled, isAdzanPlaying]);

    // 3. Geolocation & Reverse Geocoding for readable location (e.g. Karang Pilang, Surabaya)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fetchPrayerTimings = async (lat: number, lng: number) => {
            setUserCoords({ lat, lng });

            // 1. Fetch readable district & city from Nominatim Reverse Geocoding
            try {
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
                    { headers: { 'Accept-Language': 'id' } }
                );
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    const addr = geoData.address || {};
                    const district = addr.suburb || addr.village || addr.quarter || addr.city_district || addr.town || '';
                    const city = addr.city || addr.regency || addr.county || 'Surabaya';
                    const readableName = district ? `${district}, ${city}` : city;
                    setUserLocation(`${readableName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                } else {
                    setUserLocation(`Jawa Timur (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                }
            } catch (e) {
                setUserLocation(`Jawa Timur (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }

            // 2. Fetch Islamic Prayer Times from Aladhan API
            try {
                const today = new Date();
                const d = today.getDate();
                const m = today.getMonth() + 1;
                const y = today.getFullYear();

                const res = await fetch(
                    `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lng}&method=20`
                );
                const data = await res.json();
                if (data.code === 200 && data.data?.timings) {
                    setPrayerTimes({
                        Fajr: data.data.timings.Fajr.substring(0, 5),
                        Dhuhr: data.data.timings.Dhuhr.substring(0, 5),
                        Asr: data.data.timings.Asr.substring(0, 5),
                        Maghrib: data.data.timings.Maghrib.substring(0, 5),
                        Isha: data.data.timings.Isha.substring(0, 5)
                    });
                }
            } catch (err) {
                console.log('Using default prayer times:', err);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchPrayerTimings(pos.coords.latitude, pos.coords.longitude),
                () => fetchPrayerTimings(-7.2575, 112.7521), // Default Surabaya
                { timeout: 10000, enableHighAccuracy: false }
            );
        } else {
            fetchPrayerTimings(-7.2575, 112.7521);
        }
    }, []);

    // 4. Calculate Next Prayer & Trigger Adzan
    useEffect(() => {
        const checkPrayerTimes = () => {
            const now = new Date();
            const currentHHMM = now.toTimeString().substring(0, 5);
            const todayStr = now.toISOString().substring(0, 10);

            const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let foundNext = false;

            for (const p of prayers) {
                const t = prayerTimes[p];
                if (t > currentHHMM) {
                    setNextPrayer({ name: PRAYER_NAMES_ID[p] || p, time: t });
                    foundNext = true;
                    break;
                }
            }

            if (!foundNext) {
                setNextPrayer({ name: 'Subuh (Besok)', time: prayerTimes.Fajr });
            }

            if (!isAdzanEnabled) return;

            for (const p of prayers) {
                const t = prayerTimes[p];
                if (t === currentHHMM) {
                    const triggerKey = `${todayStr}-${p}-${t}`;
                    if (lastTriggeredRef.current !== triggerKey) {
                        lastTriggeredRef.current = triggerKey;
                        triggerAdzan(p);
                    }
                    break;
                }
            }
        };

        checkPrayerTimes();
        const interval = setInterval(checkPrayerTimes, 15000);
        return () => clearInterval(interval);
    }, [prayerTimes, isAdzanEnabled]);

    // 5. Play Adzan Audio & Show Notification (Local reliable audio files)
    const triggerAdzan = (prayerKey: string) => {
        if (!adzanRef.current) return;

        if (murottalRef.current && !murottalRef.current.paused) {
            murottalRef.current.pause();
            setIsPlaying(false);
        }

        const prayerNameIndo = PRAYER_NAMES_ID[prayerKey] || prayerKey;
        const isFajr = prayerKey === 'Fajr';
        setIsShubuhAdzan(isFajr);
        setAdzanPrayerName(prayerNameIndo);

        // Always use local reliable audio files in public/audio/
        const adzanSrc = isFajr ? '/audio/adzan_shubuh.mp3' : '/audio/adzan_regular.mp3';

        adzanRef.current.src = adzanSrc;
        adzanRef.current.currentTime = 0;
        adzanRef.current
            .play()
            .then(() => {
                setIsAdzanPlaying(true);
                setIsAdzanModalOpen(true);
            })
            .catch((err) => {
                console.log('Adzan playback blocked:', err);
                setIsAdzanModalOpen(true);
            });

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
                new Notification(`Waktu Sholat ${prayerNameIndo} Tiba!`, {
                    body: `Wilayah ${userLocation}. Mari menunaikan ibadah sholat tepat waktu.`,
                    icon: '/favicon.ico',
                    tag: `adzan-${prayerKey}`
                });
            } catch (e) {
                console.log('Notification error:', e);
            }
        }
    };

    const stopAdzan = () => {
        if (adzanRef.current) {
            adzanRef.current.pause();
            adzanRef.current.currentTime = 0;
        }
        setIsAdzanPlaying(false);
        setAdzanPrayerName(null);
        setIsAdzanModalOpen(false);

        // Resume Murottal if enabled
        if (isGlobalMurottalEnabled && murottalRef.current) {
            murottalRef.current.play().catch(() => {});
        }
    };

    const closeAdzanModal = () => {
        setIsAdzanModalOpen(false);
    };

    // 6. Audio Controls
    const togglePlay = () => {
        if (!murottalRef.current) return;
        if (isPlaying) {
            murottalRef.current.pause();
            setIsPlaying(false);
        } else {
            murottalRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.log('Play failed:', err));
        }
    };

    const toggleMute = () => {
        if (!murottalRef.current) return;
        murottalRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const setVolume = (v: number) => {
        if (!murottalRef.current) return;
        murottalRef.current.volume = v;
        setVolumeState(v);
        if (v > 0 && isMuted) {
            murottalRef.current.muted = false;
            setIsMuted(false);
        }
    };

    const playSurah = (surah: SurahSummary) => {
        if (!murottalRef.current) return;
        setPlayingMode('surah');
        setCurrentSurah(surah);
        const url = surah.audioUrl || `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${String(surah.nomor).padStart(3, '0')}.mp3`;
        murottalRef.current.src = url;
        murottalRef.current.currentTime = 0;
        murottalRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => console.log('Surah play error:', err));
    };

    const playJuz = (juz: JuzInfo) => {
        if (!murottalRef.current) return;
        setPlayingMode('juz');
        setCurrentJuz(juz);
        setCurrentSurah({
            nomor: juz.startSurahNumber,
            namaLatin: juz.name,
            nama: juz.arabicName,
            arti: juz.startVerse,
            audioUrl: juz.audioUrl,
        });
        murottalRef.current.src = juz.audioUrl;
        murottalRef.current.currentTime = 0;
        murottalRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => console.log('Juz play error:', err));
    };

    const stopAndRedirectToQuran = () => {
        if (murottalRef.current) {
            murottalRef.current.pause();
        }
        setIsPlaying(false);
        router.visit(route('quran.index'));
    };

    const requestNotificationPermission = async () => {
        if (typeof Notification === 'undefined') return;
        try {
            const perm = await Notification.requestPermission();
            setNotificationPermission(perm);
        } catch (e) {
            console.log('Request permission error:', e);
        }
    };

    return (
        <AudioContext.Provider
            value={{
                isPlaying,
                isMuted,
                volume,
                playingMode,
                currentSurah,
                currentJuz,
                togglePlay,
                toggleMute,
                setVolume,
                playSurah,
                playJuz,
                stopAndRedirectToQuran,
                prayerTimes,
                nextPrayer,
                userLocation,
                userCoords,
                isAdzanPlaying,
                adzanPrayerName,
                isShubuhAdzan,
                stopAdzan,
                isAdzanModalOpen,
                closeAdzanModal,
                notificationPermission,
                requestNotificationPermission,
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
