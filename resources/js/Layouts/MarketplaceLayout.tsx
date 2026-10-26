import React, { PropsWithChildren } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function MarketplaceLayout({ children }: PropsWithChildren) {
    const { flash } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f5f5] font-sans text-neutral-900 antialiased selection:bg-[#ee4d2d] selection:text-white">
            <Navbar />

            {/* Global Flash Alerts (Shopee style notification) */}
            {flash?.success && (
                <div className="bg-[#26aa99] text-white py-2.5 px-4 text-xs font-bold border-b border-[#1f887a] flex items-center justify-center gap-2 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}

            {flash?.error && (
                <div className="bg-[#ee4d2d] text-white py-2.5 px-4 text-xs font-bold border-b border-[#d73211] flex items-center justify-center gap-2 shadow-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{flash.error}</span>
                </div>
            )}

            {flash?.info && (
                <div className="bg-sky-700 text-white py-2.5 px-4 text-xs font-bold border-b border-sky-800 flex items-center justify-center gap-2 shadow-sm">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>{flash.info}</span>
                </div>
            )}

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            <Footer />
        </div>
    );
}
