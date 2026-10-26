import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { LogIn, Lock, UserCheck, Shield } from 'lucide-react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
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

    const fillCredentials = (login: string, pass: string) => {
        setData((prev) => ({
            ...prev,
            login,
            password: pass,
        }));
    };

    return (
        <MarketplaceLayout>
            <Head title="Masuk ke Sistem - Juleha Jatim" />

            <div className="max-w-md mx-auto py-8">
                <Card className="border border-neutral-300 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-5 w-5 text-emerald-700" />
                            <Badge variant="default" className="text-[10px]">
                                PORTAL RESMI JULEHA JATIM
                            </Badge>
                        </div>
                        <CardTitle className="text-xl font-black tracking-tight text-neutral-950 dark:text-white">
                            Masuk ke Marketplace
                        </CardTitle>
                        <CardDescription>
                            Gunakan Alamat Email atau Nomor ID Juleha Anda untuk mengakses dashboard dan layanan transaksi.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        {status && (
                            <div className="mb-4 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-300">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
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
                                        className="w-full text-xs pl-8 rounded border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700 font-medium"
                                    />
                                    <UserCheck className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                </div>
                                {errors.login && (
                                    <p className="text-xs text-red-600 font-bold mt-1">{errors.login}</p>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
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
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        className="w-full text-xs pl-8 rounded border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700 font-medium"
                                    />
                                    <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-600 font-bold mt-1">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-neutral-300 text-emerald-700 focus:ring-emerald-700"
                                    />
                                    <span className="ml-2">Ingat sesi login saya</span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                variant="default"
                                disabled={processing}
                                className="w-full py-2.5 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 gap-1.5"
                            >
                                <LogIn className="h-4 w-4" />
                                {processing ? 'Memproses Masuk...' : 'Masuk Sekarang'}
                            </Button>
                        </form>

                        {/* Quick Demo Access Pills for 3 Roles */}
                        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                                Akses Cepat Demo (Klik untuk Isi):
                            </span>
                            <div className="flex flex-col gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => fillCredentials('superadmin@julehajatim.com', 'superadmin123')}
                                    className="text-left p-2 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] flex justify-between items-center"
                                >
                                    <span>
                                        <strong className="text-red-700 font-bold">[Super Admin]</strong> DPW Jatim
                                    </span>
                                    <span className="text-neutral-500 font-mono">superadmin@julehajatim.com</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillCredentials('ekop.sidoarjo@julehajatim.com', 'ekop123')}
                                    className="text-left p-2 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] flex justify-between items-center"
                                >
                                    <span>
                                        <strong className="text-amber-700 font-bold">[Admin Ekop]</strong> Sidoarjo
                                    </span>
                                    <span className="text-neutral-500 font-mono">ekop.sidoarjo@julehajatim.com</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillCredentials('SDA220001', 'anggota123')}
                                    className="text-left p-2 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] flex justify-between items-center"
                                >
                                    <span>
                                        <strong className="text-emerald-700 font-bold">[Anggota]</strong> M. Slamet (ID: SDA220001)
                                    </span>
                                    <span className="text-neutral-500 font-mono">ID Juleha</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 text-center text-xs text-neutral-600 dark:text-neutral-400">
                            Belum terdaftar sebagai akun marketplace?{' '}
                            <Link href={route('register')} className="font-bold text-emerald-700 hover:underline">
                                Daftarkan ID Juleha Anda
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MarketplaceLayout>
    );
}
