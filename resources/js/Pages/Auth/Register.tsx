import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import { Button } from '@/Components/ui/button';
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
    Eye,
    EyeOff,
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
    const [verificationState, setVerificationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verifiedMember, setVerifiedMember] = useState<VerifiedMemberInfo | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setVerificationState('idle');
        setVerificationError(null);
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
                    shop_name: prev.shop_name || `Sentra Halal ${member.name}`,
                }));
            }
        } catch (err: any) {
            setVerificationState('error');
            setVerifiedMember(null);
            const msg = err.response?.data?.message || 'Nomor ID Juleha tidak terdaftar atau tidak aktif di database keanggotaan Juleha Jawa Timur.';
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
        <div className="min-h-screen flex flex-col bg-[#f5f5f5] font-sans antialiased">
            <Head title="Daftar Akun Baru - Juleha Jatim Marketplace" />

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
                            Daftar
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
            <div className="flex-1 bg-gradient-to-r from-[#ee4d2d] to-[#ff5722] py-10 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-10 border border-neutral-100">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-neutral-800">
                                Daftar Akun Marketplace
                            </h2>
                            <p className="text-xs text-neutral-500 mt-1">
                                Pendaftaran pembeli terbuka untuk umum sedunia. Penjualan khusus anggota Juleha Jatim resmi.
                            </p>

                            {/* Dual Registration Tabs (Shopee Style) */}
                            <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-neutral-100 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('buyer')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold transition-all ${
                                        accountType === 'buyer'
                                            ? 'bg-white text-[#ee4d2d] shadow-sm'
                                            : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    <span>Pembeli (Umum)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleTabChange('seller')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold transition-all ${
                                        accountType === 'seller'
                                            ? 'bg-white text-[#ee4d2d] shadow-sm'
                                            : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    <Store className="h-4 w-4" />
                                    <span>Penjual (Khusus Anggota)</span>
                                </button>
                            </div>
                        </div>

                        {/* Notice Box */}
                        <div className="mb-6 p-3.5 rounded-lg bg-orange-50 border border-orange-200 flex items-start gap-3 text-xs text-neutral-700">
                            {accountType === 'buyer' ? (
                                <>
                                    <ShoppingBag className="h-5 w-5 shrink-0 text-[#ee4d2d] mt-0.5" />
                                    <div className="leading-relaxed">
                                        <p className="font-bold text-neutral-900">Pendaftaran Pembeli Terbuka Untuk Siapa Saja</p>
                                        <p className="mt-0.5 text-neutral-600">Siapapun dari seluruh Indonesia dapat mendaftar untuk membeli bilah sembelih syar'i, daging segar halal, dan aneka perlengkapan.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-5 w-5 shrink-0 text-[#ee4d2d] mt-0.5" />
                                    <div className="leading-relaxed">
                                        <p className="font-bold text-neutral-900">Penjualan Eksklusif Anggota Juleha Jawa Timur</p>
                                        <p className="mt-0.5 text-neutral-600">Hak membuka toko penjualan di platform ini HANYA diberikan kepada anggota resmi Juleha Jatim yang memiliki ID Anggota terverifikasi.</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mandatory Juleha ID Verification for Sellers ONLY */}
                        {accountType === 'seller' && (
                            <div className="mb-6 p-5 bg-orange-50/60 border border-orange-200 rounded-lg space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                        Langkah 1: Masukkan Nomor ID Juleha Resmi Anda
                                    </label>
                                    <p className="text-[11px] text-neutral-500 mb-2">
                                        Contoh: SDA220001, SBY220001, atau ID resmi yang terdaftar di database pusat Juleha Jatim.
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="CONTOH: SDA220001"
                                            value={data.juleha_id}
                                            onChange={(e) => {
                                                setData('juleha_id', e.target.value.toUpperCase());
                                                if (verificationState !== 'idle') {
                                                    setVerificationState('idle');
                                                    setVerifiedMember(null);
                                                }
                                            }}
                                            required
                                            className="flex-1 text-sm uppercase font-mono font-bold tracking-wider rounded border-neutral-300 focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] py-2.5 px-3 outline-none"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleVerifyJulehaId}
                                            disabled={verificationState === 'loading'}
                                            className="text-xs font-bold gap-2 shrink-0 bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded px-4 py-2.5 shadow-sm"
                                        >
                                            <Search className="h-4 w-4" />
                                            {verificationState === 'loading' ? 'Memverifikasi...' : 'Verifikasi ID'}
                                        </Button>
                                    </div>
                                </div>

                                {verificationState === 'success' && verifiedMember && (
                                    <div className="p-3 bg-orange-50 border border-orange-200 rounded text-xs space-y-1">
                                        <div className="flex items-center gap-1.5 text-orange-900 font-bold">
                                            <CheckCircle2 className="h-4 w-4 text-[#ee4d2d]" />
                                            <span>ID Terverifikasi: Anggota Sah Juleha Jawa Timur</span>
                                        </div>
                                        <p className="text-neutral-700">
                                            <strong>Nama:</strong> {verifiedMember.name} &bull; <strong>Wilayah:</strong> {verifiedMember.region_name} ({verifiedMember.region_code})
                                        </p>
                                    </div>
                                )}

                                {verificationState === 'error' && verificationError && (
                                    <div className="p-3 bg-red-50 border border-red-300 rounded text-xs flex items-start gap-2 text-red-800">
                                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                                        <span>{verificationError}</span>
                                    </div>
                                )}

                                {errors.juleha_id && (
                                    <p className="text-xs text-red-600 font-bold mt-1">{errors.juleha_id}</p>
                                )}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* Seller Shop Name */}
                            {accountType === 'seller' && (
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                                        Nama Toko / Usaha Penjual <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.shop_name}
                                            onChange={(e) => setData('shop_name', e.target.value)}
                                            placeholder="Contoh: Sentra Bilah & Perlengkapan Halal Sidoarjo"
                                            required
                                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-neutral-300 focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] font-medium outline-none"
                                        />
                                        <Store className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    </div>
                                    {errors.shop_name && <p className="text-xs text-red-600 font-bold mt-1">{errors.shop_name}</p>}
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nama lengkap Anda sesuai identitas"
                                        required
                                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-neutral-300 focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] font-medium outline-none"
                                    />
                                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                </div>
                                {errors.name && <p className="text-xs text-red-600 font-bold mt-1">{errors.name}</p>}
                            </div>

                            {/* Contact: Phone & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                                        Nomor WhatsApp / HP <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Contoh: 08123456789"
                                            required
                                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-neutral-300 focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] font-medium outline-none"
                                        />
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-600 font-bold mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                                        Alamat Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="nama@email.com"
                                            required
                                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-neutral-300 focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] font-medium outline-none"
                                        />
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-600 font-bold mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            {/* Address & Coordinates */}
                            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-[#ee4d2d]" />
                                            <span>{accountType === 'seller' ? 'Alamat Pickup Toko (Syarat Kurir Biteship)' : 'Alamat Lengkap Pengiriman'}</span>
                                        </label>
                                        <span className="text-[10px] text-neutral-500">Jalan, RT/RW, Kelurahan, Kota</span>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Contoh: Jl. Simo Gunung Kramat Barat No. 28, Sawahan, Surabaya, Jawa Timur"
                                        required
                                        className="w-full text-xs p-2.5 rounded border border-neutral-300 focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] font-medium outline-none"
                                    />
                                    {errors.address && <p className="text-xs text-red-600 font-bold mt-1">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-500 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lat}
                                            onChange={(e) => setData('lat', e.target.value)}
                                            className="w-full text-xs font-mono rounded border border-neutral-300 py-1.5 px-2 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-500 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lng}
                                            onChange={(e) => setData('lng', e.target.value)}
                                            className="w-full text-xs font-mono rounded border border-neutral-300 py-1.5 px-2 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleDetectLocation}
                                            className="w-full text-xs border border-neutral-300 rounded py-2 font-bold hover:bg-neutral-100"
                                        >
                                            GPS Otomatis
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Passwords with Eye Toggle Button */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                                        Kata Sandi <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            required
                                            className="w-full text-xs pl-9 pr-10 py-2.5 rounded border border-neutral-300 focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] font-medium outline-none"
                                        />
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 p-0.5 rounded"
                                            title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4 text-[#ee4d2d]" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-600 font-bold mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                                        Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi kata sandi Anda"
                                            required
                                            className="w-full text-xs pl-9 pr-10 py-2.5 rounded border border-neutral-300 focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] font-medium outline-none"
                                        />
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 p-0.5 rounded"
                                            title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4 text-[#ee4d2d]" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Optional KTP for Seller */}
                            {accountType === 'seller' && (
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                                        Foto KTP (Opsional untuk Verifikasi Tambahan Penjual)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('ktp', e.target.files ? e.target.files[0] : null)}
                                        className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
                                    />
                                    {errors.ktp && <p className="text-xs text-red-600 font-bold mt-1">{errors.ktp}</p>}
                                </div>
                            )}

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 text-sm font-bold uppercase tracking-wider bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded shadow-md transition-all active:scale-[0.99]"
                                >
                                    {processing
                                        ? 'Mendaftarkan Akun...'
                                        : accountType === 'buyer'
                                        ? 'Daftar Sekarang'
                                        : 'Daftarkan Toko Anggota Juleha'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-500">
                            Sudah memiliki akun terdaftar?{' '}
                            <Link href={route('login')} className="font-bold text-[#ee4d2d] hover:underline">
                                Masuk ke Akun
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
