import React, { createContext, useContext, useEffect, useRef, useState, PropsWithChildren } from 'react';
import { router } from '@inertiajs/react';
import { JUZ_LIST, getRandomJuz, JuzInfo } from '@/data/juzData';

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

    // Pick a random Juz on arrival
    const [currentJuz, setCurrentJuz] = useState<JuzInfo>(() => getRandomJuz());

    // Audio instances (Persistent across page re-renders)
    const murottalRef = useRef<HTMLAudioElement | null>(null);
    const adzanRef = useRef<HTMLAudioElement | null>(null);

    // Audio states
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [volume, setVolumeState] = useState<number>(configuredVolume);
    const [currentSurah, setCurrentSurah] = useState<SurahSummary>({
        nomor: currentJuz.number,
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
            setIsAdzanModalOpen(false);

            // Resume Murottal if it was playing and not disabled by user
            const userMuted = localStorage.getItem('juleha_user_murottal_disabled') === 'true';
            if (isGlobalMurottalEnabled && !userMuted && murottalRef.current) {
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

    // 2. Autoplay Handler for Murottal Per Juz
    useEffect(() => {
        if (!isGlobalMurottalEnabled || typeof window === 'undefined') return;

        const userMutedPreference = localStorage.getItem('juleha_user_murottal_disabled');
        if (userMutedPreference === 'true') {
            return;
        }

        // Try direct autoplay immediately
        if (murottalRef.current && !isAdzanPlaying && !hasAutoPlayedRef.current) {
            murottalRef.current
                .play()
                .then(() => {
                    setIsPlaying(true);
                    hasAutoPlayedRef.current = true;
                })
                .catch(() => {
                    // Autoplay blocked by browser policy without user gesture; attach first user interaction
                });
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
                    const geo = await geoRes.json();
                    const district = geo.address?.suburb || geo.address?.city_district || geo.address?.village || geo.address?.town || 'Karang Pilang';
                    const city = geo.address?.city || geo.address?.county || 'Surabaya';
                    setUserLocation(`${district}, ${city} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                } else {
                    setUserLocation(`Karang Pilang, Surabaya (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                }
            } catch {
                setUserLocation(`Karang Pilang, Surabaya (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }

            // 2. Fetch from Aladhan API v1
            try {
                const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=11`);
                const data = await res.json();
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
            } catch (err) {
                console.warn('Aladhan API unavailable, using East Java default prayer times:', err);
            }
        };

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    fetchPrayerTimings(lat, lng);
                },
                (err) => {
                    console.log('Geolocation permission denied/error, fallback to Karang Pilang Surabaya:', err.message);
                    fetchPrayerTimings(-7.3245, 112.6982);
                },
                { timeout: 8000 }
            );
        } else {
            fetchPrayerTimings(-7.3245, 112.6982);
        }
    }, []);

    // 4. Calculate Next Prayer & Interval Checker
    useEffect(() => {
        const checkPrayerTimes = () => {
            const now = new Date();
            const currentHours = String(now.getHours()).padStart(2, '0');
            const currentMinutes = String(now.getMinutes()).padStart(2, '0');
            const currentHHMM = `${currentHours}:${currentMinutes}`;
            const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

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

    // 5. Play Adzan Audio & Show Notification
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

        const adzanSrc = isFajr
            ? 'https://cdn.islamic.network/audio/adzan/fajr.mp3'
            : 'https://cdn.islamic.network/audio/adzan/adzan_makkah.mp3';

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

        const userMuted = localStorage.getItem('juleha_user_murottal_disabled') === 'true';
        if (isGlobalMurottalEnabled && !userMuted && murottalRef.current) {
            murottalRef.current.play().catch(() => {});
        }
    };

    const closeAdzanModal = () => {
        setIsAdzanModalOpen(false);
    };

    const togglePlay = () => {
        if (!murottalRef.current) return;

        if (isPlaying) {
            murottalRef.current.pause();
            localStorage.setItem('juleha_user_murottal_disabled', 'true');
        } else {
            localStorage.removeItem('juleha_user_murottal_disabled');
            murottalRef.current.play().catch((err) => console.log('Play failed:', err));
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
        setCurrentSurah(surah);
        murottalRef.current.src = surah.audioUrl || `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${String(surah.nomor).padStart(3, '0')}.mp3`;
        murottalRef.current.currentTime = 0;
        murottalRef.current
            .play()
            .then(() => {
                setIsPlaying(true);
                localStorage.removeItem('juleha_user_murottal_disabled');
            })
            .catch((err) => console.log('Surah play error:', err));
    };

    const playJuz = (juz: JuzInfo) => {
        if (!murottalRef.current) return;
        setCurrentJuz(juz);
        setCurrentSurah({
            nomor: juz.number,
            namaLatin: juz.name,
            nama: juz.arabicName,
            arti: juz.startVerse,
            audioUrl: juz.audioUrl,
        });
        murottalRef.current.src = juz.audioUrl;
        murottalRef.current.currentTime = 0;
        murottalRef.current
            .play()
            .then(() => {
                setIsPlaying(true);
                localStorage.removeItem('juleha_user_murottal_disabled');
            })
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
