import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { LogIn, Lock, UserCheck, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

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
        <MarketplaceLayout>
            <Head title="Masuk ke Sistem - Juleha Jatim" />

            <div className="max-w-md mx-auto py-10 px-4">
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-md rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-emerald-700" />
                            <Badge variant="default" className="text-[10px] bg-emerald-700 hover:bg-emerald-800 font-bold tracking-wider">
                                PORTAL RESMI JULEHA JATIM
                            </Badge>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                            Masuk ke Marketplace
                        </CardTitle>
                        <CardDescription className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            Gunakan Alamat Email atau Nomor ID Juleha Anda untuk mengakses akun belanja maupun toko Anda.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        {status && (
                            <div className="mb-4 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-300 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Notifikasi Spesifik Jika Login Gagal */}
                        {errors.login && (
                            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-start gap-2.5 shadow-sm">
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-red-900">Email / ID Juleha Tidak Ditemukan</p>
                                    <p className="mt-0.5 text-red-700 leading-relaxed">{errors.login}</p>
                                </div>
                            </div>
                        )}

                        {errors.password && (
                            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-amber-950">Kata Sandi (Password) Tidak Sesuai</p>
                                    <p className="mt-0.5 text-amber-800 leading-relaxed">{errors.password}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                                    Alamat Email atau Nomor ID Juleha
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.login}
                                        onChange={(e) => setData('login', e.target.value)}
                                        placeholder="Contoh: SDA220001 atau nama@julehajatim.com"
                                        required
                                        autoFocus
                                        className={`w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border ${errors.login ? 'border-red-500 bg-red-50/30' : 'border-neutral-300 dark:border-neutral-700'} focus:ring-2 focus:ring-emerald-700 font-medium`}
                                    />
                                    <UserCheck className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                        Kata Sandi (Password)
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-[11px] font-semibold text-emerald-700 hover:underline"
                                        >
                                            Lupa password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan kata sandi akun Anda"
                                        required
                                        className={`w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border ${errors.password ? 'border-red-500 bg-red-50/30' : 'border-neutral-300 dark:border-neutral-700'} focus:ring-2 focus:ring-emerald-700 font-medium`}
                                    />
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-0.5 rounded"
                                        title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-emerald-700" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-neutral-500" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-neutral-300 text-emerald-700 focus:ring-emerald-700 h-4 w-4"
                                    />
                                    <span className="ml-2 font-medium">Ingat sesi login saya</span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                variant="default"
                                disabled={processing}
                                className="w-full py-3 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md gap-2 transition-all active:scale-[0.99]"
                            >
                                <LogIn className="h-4 w-4" />
                                {processing ? 'Memproses Masuk...' : 'Masuk Sekarang'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-5">
                            Belum memiliki akun marketplace?{' '}
                            <Link href={route('register')} className="font-bold text-emerald-700 hover:underline">
                                Daftar Akun Baru Sekarang
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MarketplaceLayout>
    );
}
