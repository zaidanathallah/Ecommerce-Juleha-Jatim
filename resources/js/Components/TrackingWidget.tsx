import React, { useState } from 'react';
import { Truck, Search, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/Components/ui/dialog';

interface TrackingWidgetProps {
    className?: string;
    compact?: boolean;
}

export default function TrackingWidget({ className = '', compact = false }: TrackingWidgetProps) {
    const [waybill, setWaybill] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [trackingData, setTrackingData] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = waybill.trim();
        if (!trimmed) {
            alert('Masukkan nomor resi pengiriman terlebih dahulu.');
            return;
        }

        setIsModalOpen(true);
        setIsLoading(true);
        setErrorMessage(null);
        setTrackingData(null);

        try {
            const res = await fetch(`/api/trackings/waybill?waybill=${encodeURIComponent(trimmed)}`, {
                headers: { Accept: 'application/json' },
            });
            const json = await res.json();
            if (json.success && json.data) {
                setTrackingData(json.data);
            } else if (json.data) {
                setTrackingData(json.data);
            } else {
                setErrorMessage(json.message || 'Status nomor resi belum terdaftar di kurir logistik.');
            }
        } catch (err) {
            setErrorMessage('Gagal memuat status pengiriman. Silakan coba beberapa saat lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {compact ? (
                <form onSubmit={handleTrack} className={`flex items-center gap-1.5 ${className}`}>
                    <div className="relative flex-1">
                        <Truck className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input
                            type="text"
                            value={waybill}
                            onChange={(e) => setWaybill(e.target.value)}
                            placeholder="No. Resi Pengiriman..."
                            className="w-full pl-8 pr-2 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#ee4d2d] font-mono"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading}
                        className="h-7 px-2.5 text-xs bg-[#ee4d2d] hover:bg-[#d73211] text-white font-bold flex items-center gap-1 shrink-0 rounded-lg shadow-sm"
                    >
                        <span>{isLoading ? '...' : 'Lacak'}</span>
                    </Button>
                </form>
            ) : (
                <div className={`p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm ${className}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-[#ee4d2d]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                            Lacak Pengiriman Pesanan
                        </h4>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-3">
                        Masukkan nomor resi kurir partner (JNE, J&T Express, SiCepat, Anteraja) untuk memantau pergerakan paket secara real-time.
                    </p>
                    <form onSubmit={handleTrack} className="flex gap-2">
                        <input
                            type="text"
                            value={waybill}
                            onChange={(e) => setWaybill(e.target.value)}
                            placeholder="Contoh: 004128569183"
                            className="flex-1 px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#ee4d2d] font-mono"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold gap-1 px-4 rounded-xl shadow-sm"
                        >
                            <Search className="h-3.5 w-3.5" />
                            <span>{isLoading ? 'Memuat...' : 'Lacak Resi'}</span>
                        </Button>
                    </form>
                </div>
            )}

            {/* IN-APP COURIER TRACKING MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent onClose={() => setIsModalOpen(false)}>
                    <DialogHeader className="bg-[#ee4d2d] -m-6 mb-4 p-5 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-white" />
                                <DialogTitle className="text-white text-base font-bold">
                                    Lacak Pengiriman Pesanan
                                </DialogTitle>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-bold uppercase">
                                {trackingData?.courier_name || 'KURIR'}
                            </span>
                        </div>
                        <DialogDescription className="text-white/80 text-xs mt-1">
                            Nomor Resi: <strong className="font-mono text-white font-bold">{waybill}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        {isLoading ? (
                            <div className="py-12 text-center space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ee4d2d] mx-auto" />
                                <p className="text-xs text-neutral-500 font-medium">Menghubungkan ke server kurir logistik...</p>
                            </div>
                        ) : errorMessage ? (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center space-y-2">
                                <AlertTriangle className="h-6 w-6 text-[#ee4d2d] mx-auto" />
                                <p className="text-xs font-bold text-neutral-800">{errorMessage}</p>
                                <p className="text-[11px] text-neutral-500">
                                    Pastikan nomor resi yang Anda masukkan sudah benar dan telah terbit di sistem logistik.
                                </p>
                            </div>
                        ) : trackingData ? (
                            <div className="space-y-4">
                                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-neutral-500 uppercase font-bold block">Status Terkini:</span>
                                        <span className="text-xs font-extrabold text-[#ee4d2d]">
                                            {trackingData.status_label || trackingData.status || 'Sedang Diproses'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-neutral-500 uppercase font-bold block">Layanan:</span>
                                        <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                            {trackingData.service_type || 'REGULER'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-[#ee4d2d]" />
                                        Riwayat Perjalanan Paket:
                                    </h4>

                                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-700">
                                        {trackingData.history && trackingData.history.length > 0 ? (
                                            trackingData.history.map((event: any, idx: number) => {
                                                const isLatest = idx === 0;
                                                return (
                                                    <div key={idx} className="relative">
                                                        <div
                                                            className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 ${
                                                                isLatest
                                                                    ? 'bg-[#ee4d2d] border-white ring-2 ring-orange-200'
                                                                    : 'bg-neutral-400 border-white'
                                                            }`}
                                                        />
                                                        <div className="space-y-0.5">
                                                            <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                                {event.note}
                                                            </div>
                                                            <div className="text-[10px] font-mono text-neutral-500">
                                                                {event.updated_at ? new Date(event.updated_at).toLocaleString('id-ID') : '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-xs text-neutral-500 italic">
                                                Resi terdaftar. Menunggu kurir melakukan scan awal di drop point logistik.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="text-xs font-bold rounded-xl"
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
