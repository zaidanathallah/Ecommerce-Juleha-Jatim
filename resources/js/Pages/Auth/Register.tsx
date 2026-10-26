import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import axios from 'axios';
import {
    CheckCircle2,
    AlertCircle,
    Search,
    MapPin,
    ShieldCheck,
    Lock,
    Mail,
    Phone,
    User as UserIcon,
    Store,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';

interface VerifiedMemberInfo {
    juleha_id: string;
    name: string;
    phone: string;
    nik: string;
    address: string;
    region_code: string;
    region_name: string;
    role_in_central: string;
}

export default function Register() {
    const [accountType, setAccountType] = useState<'buyer' | 'seller'>('buyer');
    const [isJulehaMember, setIsJulehaMember] = useState(false);
    const [verificationState, setVerificationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verifiedMember, setVerifiedMember] = useState<VerifiedMemberInfo | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        account_type: 'buyer',
        name: '',
        shop_name: '',
        juleha_id: '',
        email: '',
        phone: '',
        address: '',
        lat: '-7.2575',
        lng: '112.7521',
        password: '',
        password_confirmation: '',
        ktp: null as File | null,
    });

    const handleTabChange = (type: 'buyer' | 'seller') => {
        setAccountType(type);
        setData('account_type', type);
    };

    const handleVerifyJulehaId = async () => {
        if (!data.juleha_id.trim()) {
            setVerificationError('Silakan masukkan nomor ID Juleha Anda terlebih dahulu.');
            setVerificationState('error');
            return;
        }

        setVerificationState('loading');
        setVerificationError(null);

        try {
            const response = await axios.post(route('register.verify-juleha'), {
                juleha_id: data.juleha_id.trim(),
            });

            if (response.data.success && response.data.member) {
                const member: VerifiedMemberInfo = response.data.member;
                setVerifiedMember(member);
                setVerificationState('success');

                setData((prev) => ({
                    ...prev,
                    juleha_id: member.juleha_id,
                    name: member.name || prev.name,
                    phone: member.phone || prev.phone,
                    address: member.address || prev.address,
                    shop_name: prev.shop_name || `Toko ${member.name}`,
                }));
            }
        } catch (err: any) {
            setVerificationState('error');
            setVerifiedMember(null);
            const msg = err.response?.data?.message || 'Gagal memverifikasi ID Juleha. Pastikan koneksi server tersedia.';
            setVerificationError(msg);
        }
    };

    const handleDetectLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setData((prev) => ({
                        ...prev,
                        lat: position.coords.latitude.toFixed(6),
                        lng: position.coords.longitude.toFixed(6),
                    }));
                },
                (error) => {
                    alert('Tidak dapat mendeteksi lokasi GPS: ' + error.message);
                }
            );
        } else {
            alert('Browser Anda tidak mendukung geolokasi otomatis.');
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <MarketplaceLayout>
            <Head title="Pendaftaran Akun - Juleha Jatim" />

            <div className="max-w-2xl mx-auto py-6">
                <Card className="border border-neutral-300 dark:border-neutral-800 shadow-md rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
                    <CardHeader className="bg-emerald-950 text-white p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="p-1.5 rounded-lg bg-emerald-800 text-emerald-300">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                                Pendaftaran Akun Marketplace
                            </span>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight text-white">
                            Selamat Datang di Juleha Jawa Timur
                        </CardTitle>
                        <CardDescription className="text-emerald-100/80 text-xs">
                            Pendaftaran terbuka untuk seluruh masyarakat dunia, baik untuk berbelanja peralatan sembelih halal maupun untuk membuka toko penjualan.
                        </CardDescription>

                        {/* Dual Registration Tabs */}
                        <div className="grid grid-cols-2 gap-2 mt-6 p-1.5 bg-emerald-900/60 rounded-xl border border-emerald-800">
                            <button
                                type="button"
                                onClick={() => handleTabChange('buyer')}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-extrabold transition-none ${
                                    accountType === 'buyer'
                                        ? 'bg-white text-emerald-950 shadow-sm'
                                        : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
                                }`}
                            >
                                <ShoppingBag className="h-4 w-4" />
                                <span>Daftar Pembeli (Umum)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabChange('seller')}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-extrabold transition-none ${
                                    accountType === 'seller'
                                        ? 'bg-white text-emerald-950 shadow-sm'
                                        : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
                                }`}
                            >
                                <Store className="h-4 w-4" />
                                <span>Daftar Penjual (Buka Toko)</span>
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8">
                        {/* Tab Notice */}
                        <div className="mb-6 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                            {accountType === 'buyer' ? (
                                <>
                                    <ShoppingBag className="h-4 w-4 shrink-0 text-emerald-700" />
                                    <span>
                                        <strong>Mode Pembeli:</strong> Siapapun dapat mendaftar tanpa syarat ID Juleha untuk langsung berbelanja produk sembelih halal berkualitas.
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Store className="h-4 w-4 shrink-0 text-emerald-700" />
                                    <span>
                                        <strong>Mode Penjual:</strong> Buka toko Anda di Juleha Jatim. Anda dapat menjual pisau, perlengkapan sembelih, ternak, daging, maupun bumbu halal.
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Optional Juleha ID Verification for Sellers */}
                        {accountType === 'seller' && (
                            <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                        Apakah Anda Anggota Resmi Juleha Jatim?
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsJulehaMember(false);
                                                setData('juleha_id', '');
                                                setVerificationState('idle');
                                            }}
                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                                                !isJulehaMember
                                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                                            }`}
                                        >
                                            Penjual Umum
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsJulehaMember(true)}
                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                                                isJulehaMember
                                                    ? 'bg-emerald-700 text-white'
                                                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                                            }`}
                                        >
                                            Anggota Juleha
                                        </button>
                                    </div>
                                </div>

                                {isJulehaMember && (
                                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                                        <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                                            Nomor ID Juleha Anda:
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Contoh: SDA220001 atau SBY220001"
                                                value={data.juleha_id}
                                                onChange={(e) => {
                                                    setData('juleha_id', e.target.value);
                                                    if (verificationState !== 'idle') {
                                                        setVerificationState('idle');
                                                        setVerifiedMember(null);
                                                    }
                                                }}
                                                className="flex-1 text-xs uppercase font-mono font-bold tracking-wider rounded-lg border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                            />
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                onClick={handleVerifyJulehaId}
                                                disabled={verificationState === 'loading'}
                                                className="text-xs gap-1.5 shrink-0 bg-emerald-700 hover:bg-emerald-800"
                                            >
                                                <Search className="h-3.5 w-3.5" />
                                                {verificationState === 'loading' ? 'Memverifikasi...' : 'Verifikasi ID'}
                                            </Button>
                                        </div>

                                        {verificationState === 'success' && verifiedMember && (
                                            <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 rounded-lg text-xs space-y-1">
                                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>ID Juleha Terverifikasi & Aktif!</span>
                                                </div>
                                                <p className="text-[11px] text-neutral-700 dark:text-neutral-300">
                                                    {verifiedMember.name} &bull; Daerah: {verifiedMember.region_name} ({verifiedMember.region_code})
                                                </p>
                                            </div>
                                        )}

                                        {verificationState === 'error' && verificationError && (
                                            <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-300 rounded-lg text-xs flex items-start gap-1.5 text-red-700">
                                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                <span>{verificationError}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* Seller Shop Name */}
                            {accountType === 'seller' && (
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Nama Toko / Usaha Penjual
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.shop_name}
                                            onChange={(e) => setData('shop_name', e.target.value)}
                                            placeholder="Contoh: Sentra Bilah & Perlengkapan Halal"
                                            required
                                            className="w-full text-xs pl-8 rounded-lg border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                        />
                                        <Store className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                    </div>
                                    {errors.shop_name && <p className="text-xs text-red-600 mt-1">{errors.shop_name}</p>}
                                </div>
                            )}

                            {/* Name & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Nama Lengkap
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Nama lengkap Anda"
                                            required
                                            className="w-full text-xs pl-8 rounded-lg border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                        />
                                        <UserIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                    </div>
                                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Nomor WhatsApp / HP
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Contoh: 08123456789"
                                            required
                                            className="w-full text-xs pl-8 rounded-lg border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                        />
                                        <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Alamat Email (Untuk Login & Notifikasi Pesanan)
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                        required
                                        className="w-full text-xs pl-8 rounded-lg border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                    />
                                    <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                </div>
                                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                            </div>

                            {/* Alamat Lengkap & Koordinat GPS (Biteship Syarat) */}
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-3">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                                            {accountType === 'seller' ? 'Alamat Pickup Toko' : 'Alamat Pengiriman Lengkap'}
                                        </label>
                                        <span className="text-[10px] text-neutral-500 font-semibold">Integrasi Ongkir Otomatis</span>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten"
                                        required
                                        className="w-full text-xs rounded-lg border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                    />
                                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lat}
                                            onChange={(e) => setData('lat', e.target.value)}
                                            className="w-full text-xs font-mono rounded-lg border-neutral-300 focus:ring-emerald-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lng}
                                            onChange={(e) => setData('lng', e.target.value)}
                                            className="w-full text-xs font-mono rounded-lg border-neutral-300 focus:ring-emerald-700"
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleDetectLocation}
                                            className="w-full text-xs border border-neutral-300 rounded-lg"
                                        >
                                            GPS Otomatis
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Kata Sandi (Password)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            className="w-full text-xs pl-8 rounded-lg border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                        />
                                        <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                    </div>
                                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Konfirmasi Kata Sandi
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                            className="w-full text-xs pl-8 rounded-lg border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                        />
                                        <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Optional KTP for Seller */}
                            {accountType === 'seller' && (
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Foto KTP (Opsional untuk Verifikasi Penjual)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('ktp', e.target.files ? e.target.files[0] : null)}
                                        className="block w-full text-xs text-neutral-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                                    />
                                    {errors.ktp && <p className="text-xs text-red-600 mt-1">{errors.ktp}</p>}
                                </div>
                            )}

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={processing}
                                    className="w-full py-3 text-sm font-black bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md"
                                >
                                    {processing
                                        ? 'Mendaftarkan Akun...'
                                        : accountType === 'buyer'
                                        ? 'Daftar Sebagai Pembeli Sekarang'
                                        : 'Daftarkan Toko / Penjual Sekarang'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6 text-center text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                            Sudah memiliki akun terdaftar?{' '}
                            <Link href={route('login')} className="font-bold text-emerald-700 hover:underline">
                                Masuk ke akun Anda di sini
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MarketplaceLayout>
    );
}
