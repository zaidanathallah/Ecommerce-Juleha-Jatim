import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import TrackingWidget from '@/Components/TrackingWidget';
import {
    Search,
    ShoppingBag,
    PlusCircle,
    ShieldAlert,
    CheckCircle2,
    LogIn,
    UserPlus,
    LogOut,
    LayoutDashboard,
    Menu,
    X,
} from 'lucide-react';

export default function Navbar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('home'), { search: searchQuery }, { preserveState: true });
    };

    const getRoleBadge = () => {
        if (!user) return null;
        if (user.role === 'super_admin') {
            return (
                <Badge variant="destructive" className="font-mono text-[10px]">
                    SUPER ADMIN JATIM
                </Badge>
            );
        }
        if (user.role === 'admin_ekop') {
            return (
                <Badge variant="warning" className="font-mono text-[10px]">
                    ADMIN EKOP {user.region_code ?? ''}
                </Badge>
            );
        }
        return (
            <Badge variant="success" className="font-mono text-[10px]">
                ANGGOTA RESMI {user.juleha_id ?? ''}
            </Badge>
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            {/* Top Bar Banner: Verified Notice & Global Biteship Tracking */}
            <div className="bg-emerald-900 text-white text-[11px] font-semibold py-1.5 px-4 flex flex-wrap justify-between items-center gap-2 tracking-tight">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Marketplace Resmi DPW Juru Sembelih Halal (Juleha) Jawa Timur</span>
                </div>
                <div className="flex items-center gap-3">
                    <TrackingWidget compact className="w-56 sm:w-64" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Brand Logo & Name */}
                    <Link href={route('home')} className="flex items-center gap-3 shrink-0">
                        <img
                            src="/logo-juleha.jpg"
                            alt="Logo Juleha Jatim"
                            className="h-10 w-10 object-contain rounded border border-neutral-200"
                        />
                        <div className="flex flex-col">
                            <span className="font-black text-base tracking-tight text-neutral-900 dark:text-white leading-none">
                                JUALBELI.JULEHAJATIM
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">
                                E-Commerce Khusus Anggota
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md items-center">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Cari bilah herder, asahan, APD, wearpack..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 pl-9 pr-4 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md focus:ring-2 focus:ring-emerald-700 focus:border-transparent font-medium"
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                        </div>
                    </form>

                    {/* Navigation Actions */}
                    <nav className="hidden lg:flex items-center gap-3">
                        <Link
                            href={route('home')}
                            className="text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-emerald-700 px-2 py-1"
                        >
                            Etalase Produk
                        </Link>

                        {user ? (
                            <>
                                {user.role === 'super_admin' && (
                                    <Link href={route('superadmin.dashboard')}>
                                        <Button size="sm" variant="destructive" className="text-xs gap-1.5">
                                            <ShieldAlert className="h-3.5 w-3.5" />
                                            Approval Provinsi
                                        </Button>
                                    </Link>
                                )}

                                {user.role === 'admin_ekop' && (
                                    <Link href={route('ekop.dashboard')}>
                                        <Button size="sm" variant="outline" className="text-xs gap-1.5 border-amber-600 text-amber-700 hover:bg-amber-50">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Approval Daerah ({user.region_code})
                                        </Button>
                                    </Link>
                                )}

                                {user.role === 'user' && (
                                    <Link href={route('seller.products.create')}>
                                        <Button size="sm" variant="default" className="text-xs gap-1.5">
                                            <PlusCircle className="h-3.5 w-3.5" />
                                            Jual Produk
                                        </Button>
                                    </Link>
                                )}

                                <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-800" />

                                <div className="flex items-center gap-2">
                                    <Link href={route('dashboard')}>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                                {user.name}
                                            </span>
                                            <div>{getRoleBadge()}</div>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="p-2 text-neutral-500 hover:text-red-600 rounded-md hover:bg-neutral-100"
                                        title="Keluar"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href={route('login')}>
                                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                                        <LogIn className="h-3.5 w-3.5" />
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button size="sm" variant="default" className="text-xs gap-1.5">
                                        <UserPlus className="h-3.5 w-3.5" />
                                        Daftar via ID Juleha
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 py-3 space-y-2">
                        <form onSubmit={handleSearch} className="mb-3">
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-xs p-2 rounded border border-neutral-300"
                            />
                        </form>

                        <Link
                            href={route('home')}
                            className="block py-1.5 text-xs font-semibold text-neutral-800"
                        >
                            Etalase Produk
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    href={route('dashboard')}
                                    className="block py-1.5 text-xs font-semibold text-neutral-800"
                                >
                                    Dashboard Saya ({user.name})
                                </Link>
                                {user.role === 'user' && (
                                    <Link
                                        href={route('seller.products.create')}
                                        className="block py-1.5 text-xs font-semibold text-emerald-700"
                                    >
                                        + Jual Produk Baru
                                    </Link>
                                )}
                                {user.role === 'admin_ekop' && (
                                    <Link
                                        href={route('ekop.dashboard')}
                                        className="block py-1.5 text-xs font-semibold text-amber-700"
                                    >
                                        Panel Admin Ekop ({user.region_code})
                                    </Link>
                                )}
                                {user.role === 'super_admin' && (
                                    <Link
                                        href={route('superadmin.dashboard')}
                                        className="block py-1.5 text-xs font-semibold text-red-700"
                                    >
                                        Panel Super Admin Jatim
                                    </Link>
                                )}
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="block py-1.5 text-xs font-semibold text-red-600 text-left w-full"
                                >
                                    Keluar (Logout)
                                </Link>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link href={route('login')}>
                                    <Button size="sm" variant="outline" className="w-full text-xs">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button size="sm" variant="default" className="w-full text-xs">
                                        Daftar ID Juleha
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
