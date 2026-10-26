import React, { createContext, useContext, useEffect, useRef, useState, PropsWithChildren } from 'react';
import { router } from '@inertiajs/react';

export interface SurahSummary {
    nomor: number;
    namaLatin: string;
    nama: string;
    arti?: string;
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
    currentSurah: SurahSummary;
    togglePlay: () => void;
    toggleMute: () => void;
    setVolume: (v: number) => void;
    playSurah: (surah: SurahSummary) => void;
    stopAndRedirectToQuran: () => void;

    // Adzan & Prayer Times state
    prayerTimes: PrayerTimes;
    nextPrayer: { name: string; time: string } | null;
    userLocation: string;
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

// Default starting surah (Al-Fatihah, reciter Syaikh Misyari Rasyid Al-Afasy)
const DEFAULT_SURAH: SurahSummary = {
    nomor: 1,
    namaLatin: 'Al-Fatihah',
    nama: 'الفاتحة',
    arti: 'Pembukaan',
    audioUrl: 'https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/001.mp3'
};

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

    // Audio instances (Persistent across page re-renders)
    const murottalRef = useRef<HTMLAudioElement | null>(null);
    const adzanRef = useRef<HTMLAudioElement | null>(null);

    // Audio states
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [volume, setVolumeState] = useState<number>(configuredVolume);
    const [currentSurah, setCurrentSurah] = useState<SurahSummary>(DEFAULT_SURAH);

    // Adzan states
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(DEFAULT_PRAYER_TIMINGS);
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
    const [userLocation, setUserLocation] = useState<string>('Surabaya (Default)');
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

        // Initialize Murottal Audio
        const mAudio = new Audio(currentSurah.audioUrl || DEFAULT_SURAH.audioUrl);
        mAudio.preload = 'auto';
        mAudio.volume = volume;
        mAudio.loop = true;
        murottalRef.current = mAudio;

        // Initialize Adzan Audio
        const aAudio = new Audio();
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
        };
        aAudio.addEventListener('ended', onAdzanEnded);

        // Register Service Worker for PWA Background Notifications
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((err) => {
                console.warn('Service worker registration failed:', err);
            });
        }

        return () => {
            mAudio.removeEventListener('play', onPlay);
            mAudio.removeEventListener('pause', onPause);
            mAudio.removeEventListener('ended', onEnded);
            aAudio.removeEventListener('ended', onAdzanEnded);
            mAudio.pause();
            aAudio.pause();
        };
    }, []);

    // 2. Handle Browser Autoplay Policy: play automatically on user's first interaction (click/scroll/touch)
    useEffect(() => {
        if (!isGlobalMurottalEnabled || typeof window === 'undefined') return;

        // Check if user previously manually turned off murottal
        const userMutedPreference = localStorage.getItem('juleha_user_murottal_disabled');
        if (userMutedPreference === 'true') {
            return;
        }

        const handleFirstInteraction = () => {
            if (hasAutoPlayedRef.current) return;
            hasAutoPlayedRef.current = true;

            if (murottalRef.current && isGlobalMurottalEnabled && !isAdzanPlaying) {
                murottalRef.current
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch((err) => {
                        console.log('Autoplay interaction attempt:', err);
                    });
            }

            // Cleanup one-time listeners
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('scroll', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };

        window.addEventListener('click', handleFirstInteraction, { passive: true });
        window.addEventListener('scroll', handleFirstInteraction, { passive: true });
        window.addEventListener('keydown', handleFirstInteraction, { passive: true });
        window.addEventListener('touchstart', handleFirstInteraction, { passive: true });

        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('scroll', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, [isGlobalMurottalEnabled, isAdzanPlaying]);

    // 3. Geolocation & Aladhan API Timings
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fetchPrayerTimings = (lat: number, lng: number, locName: string) => {
            setUserLocation(locName);

            // Fetch from Aladhan API v1
            fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=11`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.data?.timings) {
                        const t = data.data.timings;
                        setPrayerTimes({
                            Fajr: t.Fajr.substring(0, 5),
                            Dhuhr: t.Dhuhr.substring(0, 5),
                            Asr: t.Asr.substring(0, 5),
                            Maghrib: t.Maghrib.substring(0, 5),
                            Isha: t.Isha.substring(0, 5)
                        });
                    }
                })
                .catch((err) => {
                    console.warn('Aladhan API unavailable, using East Java default prayer times:', err);
                });
        };

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    fetchPrayerTimings(lat, lng, `Lokasi Anda (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
                },
                (err) => {
                    console.log('Geolocation permission denied/error, fallback to Surabaya:', err.message);
                    fetchPrayerTimings(-7.2575, 112.7521, 'Surabaya, Jawa Timur');
                },
                { timeout: 8000 }
            );
        } else {
            fetchPrayerTimings(-7.2575, 112.7521, 'Surabaya, Jawa Timur');
        }
    }, []);

    // 4. Calculate Next Prayer & Interval Checker (Every 30 seconds)
    useEffect(() => {
        const checkPrayerTimes = () => {
            const now = new Date();
            const currentHours = String(now.getHours()).padStart(2, '0');
            const currentMinutes = String(now.getMinutes()).padStart(2, '0');
            const currentHHMM = `${currentHours}:${currentMinutes}`;
            const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

            // Determine upcoming prayer
            const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let foundNext = false;
            for (const p of prayers) {
                const t = prayerTimes[p];
                if (t && t > currentHHMM) {
                    setNextPrayer({ name: PRAYER_NAMES_ID[p] || p, time: t });
                    foundNext = true;
                    break;
                }
            }
            if (!foundNext) {
                setNextPrayer({ name: 'Subuh (Besok)', time: prayerTimes.Fajr });
            }

            // Real-time Adzan Trigger Checker
            if (!isAdzanEnabled) return;

            for (const prayer of prayers) {
                const pTime = prayerTimes[prayer];
                if (pTime === currentHHMM) {
                    const triggerKey = `${todayStr}_${prayer}_${currentHHMM}`;
                    if (lastTriggeredRef.current !== triggerKey) {
                        lastTriggeredRef.current = triggerKey;
                        triggerAdzan(prayer);
                        break;
                    }
                }
            }
        };

        checkPrayerTimes();
        const interval = setInterval(checkPrayerTimes, 30000);

        return () => clearInterval(interval);
    }, [prayerTimes, isAdzanEnabled]);

    // 5. Trigger Adzan Logic
    const triggerAdzan = (prayerKey: string) => {
        const prayerNameIndo = PRAYER_NAMES_ID[prayerKey] || prayerKey;
        const isFajr = prayerKey === 'Fajr';

        setIsShubuhAdzan(isFajr);
        setAdzanPrayerName(prayerNameIndo);
        setIsAdzanModalOpen(true);

        // A. Immediately Stop / Pause Murottal
        if (murottalRef.current) {
            murottalRef.current.pause();
            setIsPlaying(false);
        }

        // B. Play Adzan Audio
        // Adzan Shubuh has "Ash-shalatu khairum minan naum" vs Regular Adzan
        const adzanSrc = isFajr ? '/audio/adzan_shubuh.mp3' : '/audio/adzan_regular.mp3';

        if (adzanRef.current) {
            adzanRef.current.src = adzanSrc;
            adzanRef.current.currentTime = 0;
            adzanRef.current
                .play()
                .then(() => setIsAdzanPlaying(true))
                .catch((err) => {
                    console.log('Adzan playback error:', err);
                    // Fallback to CDN source if local fails
                    if (adzanRef.current) {
                        adzanRef.current.src = isFajr
                            ? 'https://archive.org/download/Mp3CollectionAdzan/Adzan%20-%20Fajr.mp3'
                            : 'https://islamdownload.net/wp-content/uploads-by-id/123801/Adzan-Misyari-Rasyid.mp3';
                        adzanRef.current.play().then(() => setIsAdzanPlaying(true)).catch(() => {});
                    }
                });
        }

        // C. Send PWA Background Notification (Native OS notification for background tabs)
        sendPrayerNotification(prayerNameIndo);
    };

    const sendPrayerNotification = (prayerName: string) => {
        const title = `Waktu Sholat ${prayerName} Telah Tiba`;
        const body = `Waktunya Sholat ${prayerName} untuk wilayah ${userLocation}. Mari tunaikan sholat tepat waktu.`;

        // Service Worker message (for active background worker)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_PRAYER_NOTIFICATION',
                title,
                body,
                tag: `prayer-${prayerName.toLowerCase()}`
            });
        } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
                new Notification(title, {
                    body,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico'
                });
            } catch (e) {
                console.log('Standard notification error:', e);
            }
        }
    };

    const requestNotificationPermission = async () => {
        if (typeof Notification === 'undefined') return;
        try {
            const perm = await Notification.requestPermission();
            setNotificationPermission(perm);
        } catch (e) {
            console.warn('Error requesting notification permission:', e);
        }
    };

    // 6. Player Control Functions
    const togglePlay = () => {
        if (!murottalRef.current) return;

        if (isPlaying) {
            murottalRef.current.pause();
            setIsPlaying(false);
        } else {
            // If adzan is playing, stopping adzan first before starting murottal
            if (isAdzanPlaying && adzanRef.current) {
                adzanRef.current.pause();
                setIsAdzanPlaying(false);
            }
            murottalRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        }
    };

    const toggleMute = () => {
        if (!murottalRef.current) return;
        const newMuted = !isMuted;
        murottalRef.current.muted = newMuted;
        setIsMuted(newMuted);
    };

    const setVolume = (val: number) => {
        const clamped = Math.max(0, Math.min(1, val));
        setVolumeState(clamped);
        if (murottalRef.current) {
            murottalRef.current.volume = clamped;
        }
    };

    const playSurah = (surah: SurahSummary) => {
        setCurrentSurah(surah);
        if (murottalRef.current) {
            const url = surah.audioUrl || `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${String(surah.nomor).padStart(3, '0')}.mp3`;
            murottalRef.current.src = url;
            murottalRef.current.currentTime = 0;
            murottalRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        }
    };

    const stopAndRedirectToQuran = () => {
        if (murottalRef.current) {
            murottalRef.current.pause();
            setIsPlaying(false);
        }
        if (adzanRef.current) {
            adzanRef.current.pause();
            setIsAdzanPlaying(false);
        }
        localStorage.setItem('juleha_user_murottal_disabled', 'true');
        router.visit('/quran');
    };

    const stopAdzan = () => {
        if (adzanRef.current) {
            adzanRef.current.pause();
            setIsAdzanPlaying(false);
        }
        setIsAdzanModalOpen(false);
    };

    const closeAdzanModal = () => {
        setIsAdzanModalOpen(false);
    };

    return (
        <AudioContext.Provider
            value={{
                isPlaying,
                isMuted,
                volume,
                currentSurah,
                togglePlay,
                toggleMute,
                setVolume,
                playSurah,
                stopAndRedirectToQuran,
                prayerTimes,
                nextPrayer,
                userLocation,
                isAdzanPlaying,
                adzanPrayerName,
                isShubuhAdzan,
                stopAdzan,
                isAdzanModalOpen,
                closeAdzanModal,
                notificationPermission,
                requestNotificationPermission
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = (): AudioContextType => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
