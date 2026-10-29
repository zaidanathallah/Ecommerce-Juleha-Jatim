import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import TrackingWidget from '@/Components/TrackingWidget';
import { useCart } from '@/Contexts/CartContext';
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
    BookOpen,
    Clock,
    HelpCircle,
    Bell,
    ExternalLink,
} from 'lucide-react';

export default function Navbar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { totalItems, openCart, syncUser } = useCart();

    React.useEffect(() => {
        if (syncUser) {
            syncUser(user ?? null);
        }
    }, [user]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('home'), { search: searchQuery }, { preserveState: true });
    };

    const getRoleBadge = () => {
        if (!user) return null;
        if (user.role === 'super_admin') {
            return (
                <Badge variant="destructive" className="font-mono text-[9px] bg-red-600">
                    SUPER ADMIN
                </Badge>
            );
        }
        if (user.role === 'admin_ekop') {
            return (
                <Badge variant="warning" className="font-mono text-[9px] bg-amber-500 text-white">
                    EKOP {user.region_code ?? ''}
                </Badge>
            );
        }
        if (user.is_member) {
            return (
                <Badge variant="default" className="font-mono text-[9px] bg-[#ee4d2d] text-white">
                    ANGGOTA {user.juleha_id ?? ''}
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="font-mono text-[9px] bg-neutral-200 text-neutral-800">
                PEMBELI
            </Badge>
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full shadow-md">
            {/* Shopee Top Mini Bar (Red-Orange Accent) */}
            <div className="bg-[#d73211] text-white text-[11px] font-medium py-1 px-4 sm:px-8 flex justify-between items-center tracking-tight">
                <div className="flex items-center gap-4">
                    <a
                        href="https://julehajatim.com"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-orange-200 transition flex items-center gap-1"
                    >
                        <span>Portal Juleha Jatim</span>
                        <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="text-white/40">|</span>
                    <Link href={route('seller.products.create')} className="hover:text-orange-200 transition">
                        Buka Toko / Jual Produk
                    </Link>
                    <span className="text-white/40 hidden md:inline">|</span>
                    <span className="hidden md:inline text-white/90">
                        Marketplace Halal Terstandarisasi Syariat
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href={route('prayer.schedule')}
                        className="hover:text-orange-200 transition flex items-center gap-1 font-bold"
                    >
                        <Clock className="h-3.5 w-3.5 text-amber-300" />
                        <span>Waktu Sholat Realtime</span>
                    </Link>
                    <span className="text-white/40">|</span>
                    <Link
                        href={route('quran.index')}
                        className="hover:text-orange-200 transition flex items-center gap-1 font-bold"
                    >
                        <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                        <span>Al-Qur'an 30 Juz</span>
                    </Link>
                </div>
            </div>

            {/* Shopee Main Header (Signature Shopee Orange #ee4d2d) */}
            <div className="bg-[#ee4d2d] text-white py-3.5 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Brand Logo & Title */}
                    <Link href={route('home')} className="flex items-center gap-3 shrink-0 group">
                        <img
                            src="/logo-juleha.jpg"
                            alt="Logo Juleha Jatim"
                            className="h-11 w-11 object-contain rounded-xl border border-white/30 bg-white p-0.5 shadow-sm"
                        />
                        <div className="flex flex-col">
                            <span className="font-black text-lg tracking-tight text-white leading-none drop-shadow-xs">
                                JUALBELI.JULEHAJATIM
                            </span>
                            <span className="text-[10px] font-bold text-orange-100 tracking-wider uppercase mt-0.5">
                                Marketplace Halal Jawa Timur
                            </span>
                        </div>
                    </Link>

                    {/* Shopee-style Search Box with Sub-Keywords */}
                    <div className="hidden md:flex flex-col flex-1 max-w-2xl mx-4">
                        <form onSubmit={handleSearch} className="flex bg-white rounded-lg overflow-hidden shadow-sm p-1">
                            <input
                                type="text"
                                placeholder="Cari pisau sembelih, golok, asahan, APD, hewan qurban, daging halal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 border-none outline-none focus:ring-0 font-medium"
                            />
                            <button
                                type="submit"
                                className="bg-[#ee4d2d] hover:bg-[#d73211] text-white px-6 py-2 rounded-md flex items-center justify-center transition shadow-xs"
                                title="Cari Produk"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </form>

                        {/* Search Suggestions Row */}
                        <div className="flex items-center gap-3 text-[11px] text-white/90 pt-1.5 px-1 truncate">
                            <span
                                onClick={() => setSearchQuery('Herder Solingen')}
                                className="hover:underline cursor-pointer opacity-90 hover:opacity-100"
                            >
                                Pisau Herder
                            </span>
                            <span
                                onClick={() => setSearchQuery('Golok Baja Per')}
                                className="hover:underline cursor-pointer opacity-90 hover:opacity-100"
                            >
                                Golok Baja Per
                            </span>
                            <span
                                onClick={() => setSearchQuery('Batu Asah')}
                                className="hover:underline cursor-pointer opacity-90 hover:opacity-100"
                            >
                                Batu Asah Arkansas
                            </span>
                            <span
                                onClick={() => setSearchQuery('Wearpack')}
                                className="hover:underline cursor-pointer opacity-90 hover:opacity-100"
                            >
                                Wearpack APD
                            </span>
                            <span
                                onClick={() => setSearchQuery('Daging Sapi')}
                                className="hover:underline cursor-pointer opacity-90 hover:opacity-100"
                            >
                                Daging Sapi Segar
                            </span>
                        </div>
                    </div>

                    {/* Navigation Actions: Cart & Auth */}
                    <div className="hidden lg:flex items-center gap-4 shrink-0">
                        {/* Cart Trigger with Circular Badge */}
                        <button
                            type="button"
                            onClick={openCart}
                            className="relative flex items-center gap-2 p-2 rounded-xl text-white hover:bg-white/10 transition"
                            title="Keranjang Belanja"
                        >
                            <div className="relative">
                                <ShoppingBag className="h-6 w-6 text-white" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-white text-[#ee4d2d] text-[10px] font-black flex items-center justify-center shadow-md">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-bold text-white">Keranjang</span>
                        </button>

                        <div className="h-6 w-px bg-white/30" />

                        {user ? (
                            <div className="flex items-center gap-3">
                                {user.role === 'super_admin' && (
                                    <Link href={route('superadmin.dashboard')}>
                                        <Button size="sm" className="bg-red-900 hover:bg-red-950 text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs">
                                            <ShieldAlert className="h-3.5 w-3.5" />
                                            Approval Jatim
                                        </Button>
                                    </Link>
                                )}

                                {user.role === 'admin_ekop' && (
                                    <Link href={route('ekop.dashboard')}>
                                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Admin Ekop ({user.region_code})
                                        </Button>
                                    </Link>
                                )}

                                {user.role === 'user' && user.user_type === 'seller' && (
                                    <Link href={route('seller.products.create')}>
                                        <Button size="sm" className="bg-white text-[#ee4d2d] hover:bg-orange-50 text-xs font-bold rounded-xl gap-1.5 shadow-xs">
                                            <PlusCircle className="h-3.5 w-3.5" />
                                            Jual Produk
                                        </Button>
                                    </Link>
                                )}

                                <Link href={route('dashboard')}>
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs font-bold text-white leading-tight">
                                            {user.name}
                                        </span>
                                        <div>{getRoleBadge()}</div>
                                    </div>
                                </Link>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
                                    title="Keluar"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href={route('login')}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs font-bold bg-white/10 hover:bg-white text-white hover:text-[#ee4d2d] border-white/40 rounded-xl"
                                    >
                                        <LogIn className="h-3.5 w-3.5 mr-1" />
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button
                                        size="sm"
                                        className="text-xs font-bold bg-white text-[#ee4d2d] hover:bg-orange-50 rounded-xl shadow-xs"
                                    >
                                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                                        Daftar Akun
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Cart & Hamburger */}
                    <div className="lg:hidden flex items-center gap-2">
                        <button
                            type="button"
                            onClick={openCart}
                            className="relative p-2 text-white"
                        >
                            <ShoppingBag className="h-6 w-6" />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 h-4 min-w-4 px-1 rounded-full bg-white text-[#ee4d2d] text-[9px] font-black flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-white"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-white/20 mt-3 pt-3 space-y-2.5">
                        <form onSubmit={handleSearch} className="flex bg-white rounded-lg overflow-hidden p-1">
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-3 py-1.5 text-xs text-neutral-800 border-none outline-none"
                            />
                            <button type="submit" className="bg-[#ee4d2d] text-white px-3 py-1.5 rounded text-xs">
                                <Search className="h-3.5 w-3.5" />
                            </button>
                        </form>

                        <Link href={route('home')} className="block py-1.5 text-xs font-bold text-white">
                            Etalase Produk
                        </Link>
                        <Link href={route('quran.index')} className="flex items-center gap-1.5 py-1.5 text-xs font-bold text-white">
                            <BookOpen className="h-3.5 w-3.5 text-amber-200" />
                            <span>Al-Qur'an 30 Juz</span>
                        </Link>
                        <Link href={route('prayer.schedule')} className="flex items-center gap-1.5 py-1.5 text-xs font-bold text-white">
                            <Clock className="h-3.5 w-3.5 text-amber-200" />
                            <span>Jadwal Waktu Sholat Realtime</span>
                        </Link>

                        {user ? (
                            <>
                                <Link href={route('dashboard')} className="block py-1.5 text-xs font-bold text-white">
                                    Dashboard ({user.name})
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="block py-1.5 text-xs font-bold text-red-200 text-left w-full"
                                >
                                    Keluar (Logout)
                                </Link>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link href={route('login')}>
                                    <Button size="sm" variant="outline" className="w-full text-xs font-bold bg-white text-[#ee4d2d]">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button size="sm" className="w-full text-xs font-bold bg-neutral-900 text-white">
                                        Daftar Akun
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
