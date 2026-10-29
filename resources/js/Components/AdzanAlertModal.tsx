import React from 'react';
import { useAudio } from '@/Contexts/AudioContext';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Volume2, VolumeX, Moon, Sun, Clock, MapPin } from 'lucide-react';

export default function AdzanAlertModal() {
    const {
        isAdzanModalOpen,
        closeAdzanModal,
        isAdzanPlaying,
        adzanPrayerName,
        isShubuhAdzan,
        stopAdzan,
        userLocation
    } = useAudio();

    if (!isAdzanModalOpen) return null;

    return (
        <Dialog open={isAdzanModalOpen} onOpenChange={(open) => !open && closeAdzanModal()}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-950 border-2 border-[#ee4d2d] rounded-2xl p-6 shadow-2xl">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                        <div className="flex items-center gap-2">
                            {isShubuhAdzan ? (
                                <Moon className="h-5 w-5 text-[#ee4d2d]" />
                            ) : (
                                <Sun className="h-5 w-5 text-amber-500" />
                            )}
                            <span className="font-mono text-xs uppercase tracking-widest text-[#ee4d2d] font-bold">
                                Pengingat Sholat Otomatis
                            </span>
                        </div>
                        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950/80 text-[#ee4d2d] font-mono text-[10px] font-bold rounded-full border border-orange-200">
                            LIVE ADZAN
                        </span>
                    </div>

                    <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                        Waktunya Sholat {adzanPrayerName || 'Wajib'} untuk wilayah Anda.
                    </DialogTitle>

                    <DialogDescription className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
                        <div className="flex items-center gap-1.5 font-mono text-neutral-700 dark:text-neutral-300">
                            <MapPin className="h-3.5 w-3.5 text-[#ee4d2d] shrink-0" />
                            <span>Wilayah: {userLocation}</span>
                        </div>

                        {isShubuhAdzan ? (
                            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-l-4 border-[#ee4d2d] rounded-r-xl font-serif text-xs text-neutral-800 dark:text-neutral-200 italic">
                                "Ash-shalātu khairum minan naum" (Sholat itu lebih baik daripada tidur) — Adzan Subuh Syaikh Misyari Rasyid Al-Afasy.
                            </div>
                        ) : (
                            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-l-4 border-[#ee4d2d] rounded-r-xl text-xs text-neutral-700 dark:text-neutral-300">
                                Kumandang Adzan {adzanPrayerName} oleh Syaikh Misyari Rasyid Al-Afasy sedang berlangsung. Mari bersegera mengambil wudhu dan merapatkan shaf sholat berjamaah.
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    <blockquote className="text-[11px] text-neutral-500 italic border-t border-neutral-200 dark:border-neutral-800 pt-3">
                        "Sesungguhnya shalat itu adalah fardhu yang ditentukan waktunya atas orang-orang yang beriman." (QS. An-Nisa: 103)
                    </blockquote>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    {isAdzanPlaying && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={stopAdzan}
                            className="rounded-xl font-mono text-xs font-bold uppercase w-full sm:w-auto"
                        >
                            <VolumeX className="h-4 w-4 mr-1.5" />
                            Hentikan Suara Adzan
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={closeAdzanModal}
                        className="rounded-xl font-mono text-xs font-bold uppercase border-neutral-300 dark:border-neutral-700 w-full sm:w-auto"
                    >
                        Tutup Pengingat
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
