import React from 'react';

interface Props {
    slug: string;
    className?: string;
}

export default function CategoryIcon({ slug, className = 'w-10 h-10' }: Props) {
    switch (slug) {
        case 'pisau-sembelih':
            return (
                <div className={`${className} rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center p-2 text-amber-600 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M14.5 4l-9 9 3 3 9-9z" />
                        <path d="M3 21l3-3" />
                        <path d="M5.5 15.5l3 3" />
                        <path d="M14.5 4L20 9.5" />
                    </svg>
                </div>
            );
        case 'golok-dan-bendo':
            return (
                <div className={`${className} rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center p-2 text-orange-600 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M14 2L2 14l4 4 12-12z" />
                        <path d="M18 6l4 4" />
                        <path d="M14 10l-4 4" />
                    </svg>
                </div>
            );
        case 'batu-dan-alat-asah':
            return (
                <div className={`${className} rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center p-2 text-blue-600 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <rect x="3" y="7" width="18" height="10" rx="2" />
                        <line x1="7" y1="12" x2="17" y2="12" />
                        <line x1="12" y1="7" x2="12" y2="17" />
                    </svg>
                </div>
            );
        case 'wearpack-dan-apd':
            return (
                <div className={`${className} rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center p-2 text-emerald-600 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                    </svg>
                </div>
            );
        case 'tali-dan-handling':
            return (
                <div className={`${className} rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 flex items-center justify-center p-2 text-stone-700 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <circle cx="9" cy="12" r="6" />
                        <circle cx="15" cy="12" r="6" />
                    </svg>
                </div>
            );
        case 'hewan-qurban-ternak':
            return (
                <div className={`${className} rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center p-2 text-rose-600 shadow-sm text-lg`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M4 11a8 8 0 0 1 16 0v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7z" />
                        <circle cx="9" cy="14" r="1" />
                        <circle cx="15" cy="14" r="1" />
                        <path d="M9 7L6 3" />
                        <path d="M15 7l3-4" />
                    </svg>
                </div>
            );
        case 'daging-halal':
            return (
                <div className={`${className} rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-center p-2 text-red-600 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M8 12a4 4 0 0 0 8 0" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                    </svg>
                </div>
            );
        case 'bumbu-dan-pangan':
            return (
                <div className={`${className} rounded-2xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 flex items-center justify-center p-2 text-yellow-600 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                        <line x1="6" y1="1" x2="6" y2="4" />
                        <line x1="10" y1="1" x2="10" y2="4" />
                        <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                </div>
            );
        case 'peralatan-dapur-resto':
            return (
                <div className={`${className} rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center p-2 text-purple-600 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                </div>
            );
        case 'buku-dan-edukasi':
            return (
                <div className={`${className} rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center p-2 text-teal-600 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                </div>
            );
        default:
            return (
                <div className={`${className} rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center p-2 text-neutral-600 shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                </div>
            );
    }
}
