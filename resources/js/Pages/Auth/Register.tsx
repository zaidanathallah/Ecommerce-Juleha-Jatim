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
    FileText,
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
    const [verificationState, setVerificationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verifiedMember, setVerifiedMember] = useState<VerifiedMemberInfo | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        juleha_id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        lat: '-7.4726',
        lng: '112.7058',
        password: '',
        password_confirmation: '',
        ktp: null as File | null,
    });

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

                // Auto-fill form fields from central database
                setData((prev) => ({
                    ...prev,
                    juleha_id: member.juleha_id,
                    name: member.name || prev.name,
                    phone: member.phone || prev.phone,
                    address: member.address || prev.address,
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
            <Head title="Pendaftaran Anggota Resmi - Juleha Jatim" />

            <div className="max-w-2xl mx-auto py-4">
                <Card className="border border-neutral-300 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-5 w-5 text-emerald-700" />
                            <Badge variant="default" className="text-[10px]">
                                VALIDASI LINTAS DATABASE JAGOAN HOSTING
                            </Badge>
                        </div>
                        <CardTitle className="text-xl font-black tracking-tight text-neutral-950 dark:text-white">
                            Registrasi Akun Marketplace Juleha Jatim
                        </CardTitle>
                        <CardDescription>
                            Hanya anggota berstatus aktif di database keanggotaan pusat (members.julehajatim.com) yang dapat mendaftar untuk bertransaksi atau berjualan.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        {/* Step 1: Real-time Juleha ID Verification */}
                        <div className="mb-6 p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-md">
                            <label className="block text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-2">
                                Langkah 1: Masukkan Nomor ID Juleha Resmi Anda
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Contoh: SDA220003 atau SBY220001"
                                    value={data.juleha_id}
                                    onChange={(e) => {
                                        setData('juleha_id', e.target.value);
                                        if (verificationState !== 'idle') {
                                            setVerificationState('idle');
                                            setVerifiedMember(null);
                                        }
                                    }}
                                    className="flex-1 text-xs uppercase font-mono font-bold tracking-wider rounded border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700 focus:border-emerald-700"
                                />
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={handleVerifyJulehaId}
                                    disabled={verificationState === 'loading'}
                                    className="text-xs gap-1.5 shrink-0"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    {verificationState === 'loading' ? 'Memverifikasi...' : 'Verifikasi ID'}
                                </Button>
                            </div>
                            {errors.juleha_id && (
                                <p className="mt-2 text-xs font-bold text-red-600">{errors.juleha_id}</p>
                            )}

                            {/* Verification Result Feedback */}
                            {verificationState === 'success' && verifiedMember && (
                                <div className="mt-3 p-3 bg-white dark:bg-neutral-900 border border-emerald-500 rounded text-xs space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>ID Juleha Terverifikasi & Aktif!</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                                        <div>
                                            <span className="text-neutral-500">Nama Anggota:</span>{' '}
                                            <strong className="text-neutral-900 dark:text-neutral-100">{verifiedMember.name}</strong>
                                        </div>
                                        <div>
                                            <span className="text-neutral-500">Daerah DPD:</span>{' '}
                                            <strong className="text-neutral-900 dark:text-neutral-100">{verifiedMember.region_name} ({verifiedMember.region_code})</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {verificationState === 'error' && verificationError && (
                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-400 rounded text-xs flex items-start gap-2 text-red-700">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <div className="leading-tight font-medium">{verificationError}</div>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Auto-filled / Account Details */}
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Nama Lengkap (Auto-fill)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            className="w-full text-xs pl-8 rounded border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
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
                                            placeholder="08123456789"
                                            required
                                            className="w-full text-xs pl-8 rounded border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                        />
                                        <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Alamat Email (Untuk Login & Notifikasi Pembayaran DOKU)
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                        required
                                        className="w-full text-xs pl-8 rounded border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                    />
                                    <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                </div>
                                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                            </div>

                            {/* Alamat Lengkap & Koordinat Lat/Lng (Syarat Kurir Biteship) */}
                            <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded border border-neutral-300 dark:border-neutral-700 space-y-3">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                                            Alamat Lengkap Toko / Domisili
                                        </label>
                                        <span className="text-[10px] text-neutral-500 font-semibold">Syarat Pickup Kurir Biteship</span>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                                        required
                                        className="w-full text-xs rounded border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                    />
                                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                            Latitude (Gmaps)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lat}
                                            onChange={(e) => setData('lat', e.target.value)}
                                            required
                                            className="w-full text-xs font-mono rounded border-neutral-300 focus:ring-emerald-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                            Longitude (Gmaps)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lng}
                                            onChange={(e) => setData('lng', e.target.value)}
                                            required
                                            className="w-full text-xs font-mono rounded border-neutral-300 focus:ring-emerald-700"
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleDetectLocation}
                                            className="w-full text-xs border border-neutral-300"
                                        >
                                            GPS Otomatis
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Setup */}
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
                                            className="w-full text-xs pl-8 rounded border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
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
                                            className="w-full text-xs pl-8 rounded border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                                        />
                                        <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Upload KTP Opsional */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Foto KTP (Opsional untuk Verifikasi Tambahan Penjual)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('ktp', e.target.files ? e.target.files[0] : null)}
                                    className="block w-full text-xs text-neutral-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                                />
                                {errors.ktp && <p className="text-xs text-red-600 mt-1">{errors.ktp}</p>}
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={processing}
                                    className="w-full py-2.5 text-sm font-bold bg-emerald-700 hover:bg-emerald-800"
                                >
                                    {processing ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Marketplace'}
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
