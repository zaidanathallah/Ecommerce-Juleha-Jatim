import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import { Button } from '@/Components/ui/button';
import { Lock, UserCheck, Eye, EyeOff, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f5f5] font-sans antialiased">
            <Head title="Masuk ke Akun - Juleha Jatim Marketplace" />

            {/* Shopee-style Auth Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('home')} className="flex items-center gap-3">
                            <img src="/logo-juleha.jpg" alt="Logo Juleha Jatim" className="h-10 w-10 rounded-lg object-contain shadow-sm" />
                            <div>
                                <span className="font-black text-lg tracking-tight text-neutral-900 block leading-tight">
                                    JUALBELI.JULEHAJATIM
                                </span>
                                <span className="text-[10px] text-neutral-500 font-semibold block">
                                    MARKETPLACE HALAL JAWA TIMUR
                                </span>
                            </div>
                        </Link>
                        <div className="h-7 w-[1.5px] bg-neutral-300 hidden sm:block" />
                        <span className="text-xl font-bold text-neutral-800 hidden sm:block">
                            Masuk
                        </span>
                    </div>

                    <a
                        href="https://wa.me/6281262227663"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#ee4d2d] hover:underline font-semibold"
                    >
                        Butuh bantuan?
                    </a>
                </div>
            </header>

            {/* Shopee Signature Gradient Auth Body */}
            <div className="flex-1 bg-gradient-to-r from-[#ee4d2d] to-[#ff5722] py-12 px-4 flex items-center">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left Banner Marketing (Shopee Style) */}
                    <div className="hidden lg:flex lg:col-span-7 flex-col items-center justify-center text-white px-8 text-center space-y-6">
                        <div className="relative">
                            <div className="w-56 h-56 rounded-full bg-white/10 blur-2xl absolute inset-0 -m-4 pointer-events-none" />
                            <img
                                src="/logo-juleha.jpg"
                                alt="Juleha Official"
                                className="relative w-36 h-36 rounded-3xl object-contain shadow-2xl p-2 bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tight">
                                Marketplace Juru Sembelih Halal
                            </h1>
                            <p className="text-base text-white/90 max-w-md mx-auto leading-relaxed">
                                Jual beli pisau sembelih standar syar'i, herder, asahan, wearpack APD, daging segar halal & perlengkapan sembelih se-Jawa Timur.
                            </p>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-white/90 font-bold">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-amber-300" />
                                <span>100% Standar Syariat</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-amber-300" />
                                <span>Logistik Otomatis Biteship</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Login Card (Shopee Clean Elevated White Box) */}
                    <div className="lg:col-span-5 w-full max-w-md mx-auto">
                        <div className="bg-white rounded-lg shadow-2xl p-8 sm:p-10 border border-neutral-100">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-neutral-800">
                                    Masuk
                                </h2>
                                <p className="text-xs text-neutral-500 mt-1">
                                    Akses akun pembeli, anggota, atau toko penjual Anda
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded border border-emerald-300 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>{status}</span>
                                </div>
                            )}

                            {/* Notifikasi Error Email / ID Juleha */}
                            {errors.login && (
                                <div className="mb-4 p-3.5 rounded bg-red-50 border border-red-300 text-red-800 text-xs flex items-start gap-2.5">
                                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-red-900">Email / ID Juleha Tidak Ditemukan</p>
                                        <p className="mt-0.5 text-red-700 leading-relaxed">{errors.login}</p>
                                    </div>
                                </div>
                            )}

                            {/* Notifikasi Error Password */}
                            {errors.password && (
                                <div className="mb-4 p-3.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-amber-950">Kata Sandi (Password) Tidak Sesuai</p>
                                        <p className="mt-0.5 text-amber-800 leading-relaxed">{errors.password}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                                        Email atau Nomor ID Juleha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.login}
                                            onChange={(e) => setData('login', e.target.value)}
                                            placeholder="Email atau No. ID Juleha (misal: SDA220001)"
                                            required
                                            autoFocus
                                            className={`w-full text-xs pl-9 pr-3 py-2.5 rounded border ${
                                                errors.login ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                                            } focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] font-medium outline-none transition-colors`}
                                        />
                                        <UserCheck className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-neutral-700">
                                            Kata Sandi
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-[11px] text-[#ee4d2d] hover:underline"
                                            >
                                                Lupa Password?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Masukkan kata sandi Anda"
                                            required
                                            className={`w-full text-xs pl-9 pr-10 py-2.5 rounded border ${
                                                errors.password ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                                            } focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] font-medium outline-none transition-colors`}
                                        />
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 p-0.5 rounded"
                                            title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-[#ee4d2d]" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-neutral-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center text-xs text-neutral-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="rounded border-neutral-300 text-[#ee4d2d] focus:ring-[#ee4d2d] h-4 w-4"
                                        />
                                        <span className="ml-2">Ingat saya</span>
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 text-sm font-bold uppercase tracking-wider bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded shadow-md transition-all active:scale-[0.99]"
                                >
                                    {processing ? 'Memproses...' : 'Log In'}
                                </Button>
                            </form>

                            {/* Shopee-style Footer of Card */}
                            <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-500">
                                Baru di Marketplace Juleha?{' '}
                                <Link href={route('register')} className="font-bold text-[#ee4d2d] hover:underline">
                                    Daftar Sekarang
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
