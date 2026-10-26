import React, { PropsWithChildren } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function MarketplaceLayout({ children }: PropsWithChildren) {
    const { flash } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 antialiased selection:bg-emerald-700 selection:text-white">
            <Navbar />

            {/* Global Flash Alerts (Anti-slop high contrast notification) */}
            {flash?.success && (
                <div className="bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold border-b border-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}

            {flash?.error && (
                <div className="bg-red-700 text-white py-2.5 px-4 text-xs font-bold border-b border-red-800 flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{flash.error}</span>
                </div>
            )}

            {flash?.info && (
                <div className="bg-sky-800 text-white py-2.5 px-4 text-xs font-bold border-b border-sky-900 flex items-center justify-center gap-2">
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
