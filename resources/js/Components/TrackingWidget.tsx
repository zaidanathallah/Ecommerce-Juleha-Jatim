import React, { useState } from 'react';
import { Truck, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface TrackingWidgetProps {
    className?: string;
    compact?: boolean;
}

export default function TrackingWidget({ className = '', compact = false }: TrackingWidgetProps) {
    const [waybill, setWaybill] = useState('');

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = waybill.trim();
        if (!trimmed) {
            alert('Masukkan nomor resi pengiriman.');
            return;
        }

        const trackingUrl = `https://track.biteship.com/track/${encodeURIComponent(trimmed)}`;
        window.open(trackingUrl, '_blank', 'noopener,noreferrer');
    };

    if (compact) {
        return (
            <form onSubmit={handleTrack} className={`flex items-center gap-1.5 ${className}`}>
                <div className="relative flex-1">
                    <Truck className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        type="text"
                        value={waybill}
                        onChange={(e) => setWaybill(e.target.value)}
                        placeholder="No. Resi Pengiriman..."
                        className="w-full pl-8 pr-2 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                    />
                </div>
                <Button
                    type="submit"
                    size="sm"
                    className="h-7 px-2.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1 shrink-0"
                >
                    <span>Lacak</span>
                    <ExternalLink className="h-3 w-3" />
                </Button>
            </form>
        );
    }

    return (
        <div className={`p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-white ${className}`}>
            <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                    Lacak Pengiriman Pesanan (Biteship)
                </h4>
            </div>
            <p className="text-[11px] text-neutral-400 mb-3">
                Masukkan nomor resi Biteship atau kurir partner (JNE, J&T, SiCepat) untuk memantau pergerakan paket secara real-time.
            </p>
            <form onSubmit={handleTrack} className="flex gap-2">
                <input
                    type="text"
                    value={waybill}
                    onChange={(e) => setWaybill(e.target.value)}
                    placeholder="Contoh: BITESHIP123456789"
                    className="flex-1 px-3 py-1.5 text-xs bg-neutral-800 border border-neutral-700 rounded text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1 px-4"
                >
                    <Search className="h-3.5 w-3.5" />
                    <span>Lacak Resi</span>
                    <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
                </Button>
            </form>
        </div>
    );
}
