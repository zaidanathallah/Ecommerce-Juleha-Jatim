import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    X,
    UserCheck,
    Mail,
    Phone,
    Lock,
    Store,
    Save,
    Eye,
    EyeOff,
    CheckCircle2,
    Shield,
    Users,
    MapPin,
    BadgeCheck,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

export interface UserManageData {
    id?: number;
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: 'user' | 'admin_ekop' | 'super_admin';
    user_type: 'buyer' | 'seller';
    is_member: boolean;
    is_verified: boolean;
    juleha_id?: string;
    region_code?: string;
    region_name?: string;
    shop_name?: string;
    address?: string;
}

export interface RegionOption {
    initial: string;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userToEdit?: UserManageData | null;
    allRegions: RegionOption[];
}

export default function UserManageModal({
    isOpen,
    onClose,
    userToEdit,
    allRegions = [],
}: Props) {
    const isEditMode = Boolean(userToEdit && userToEdit.id);

    const [formData, setFormData] = useState<UserManageData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        user_type: 'buyer',
        is_member: false,
        is_verified: true,
        juleha_id: '',
        region_code: '',
        region_name: '',
        shop_name: '',
        address: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (userToEdit && userToEdit.id) {
            setFormData({
                id: userToEdit.id,
                name: userToEdit.name || '',
                email: userToEdit.email || '',
                phone: userToEdit.phone || '',
                password: '',
                role: userToEdit.role || 'user',
                user_type: userToEdit.user_type || 'buyer',
                is_member: Boolean(userToEdit.is_member),
                is_verified: Boolean(userToEdit.is_verified),
                juleha_id: userToEdit.juleha_id === '-' ? '' : (userToEdit.juleha_id || ''),
                region_code: userToEdit.region_code === '-' ? '' : (userToEdit.region_code || ''),
                region_name: userToEdit.region_name === '-' ? '' : (userToEdit.region_name || ''),
                shop_name: userToEdit.shop_name === '-' ? '' : (userToEdit.shop_name || ''),
                address: userToEdit.address === '-' ? '' : (userToEdit.address || ''),
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                role: 'user',
                user_type: 'buyer',
                is_member: false,
                is_verified: true,
                juleha_id: '',
                region_code: 'SBY',
                region_name: 'Surabaya',
                shop_name: '',
                address: '',
            });
        }
        setErrors({});
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const reg = allRegions.find((r) => r.initial === code);
        setFormData((prev) => ({
            ...prev,
            region_code: code,
            region_name: reg ? reg.name : '',
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        if (isEditMode && formData.id) {
            router.put(route('superadmin.users.update', formData.id), formData as any, {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                },
                onError: (errs) => {
                    setProcessing(false);
                    setErrors(errs);
                },
            });
        } else {
            router.post(route('superadmin.users.store'), formData as any, {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                },
                onError: (errs) => {
                    setProcessing(false);
                    setErrors(errs);
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#ee4d2d] to-orange-600 p-5 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-base leading-tight">
                                {isEditMode ? 'Edit Data Pengguna / Anggota' : 'Tambah Pengguna / Anggota Baru'}
                            </h3>
                            <p className="text-white/80 text-xs">
                                Kelola profil, peran akses, keanggotaan, & daerah di Juleha Jatim.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
                    {/* Role & Keanggotaan Pill Selector */}
                    <div className="p-3.5 bg-orange-50/60 dark:bg-neutral-800 rounded-2xl border border-orange-200 dark:border-neutral-700 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Peran / Hak Akses (Role)
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full text-xs rounded-xl border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold"
                                >
                                    <option value="user">User Biasa / Anggota Juleha</option>
                                    <option value="admin_ekop">Admin Ekop Daerah</option>
                                    <option value="super_admin">Super Admin DPW Jatim</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Tipe Akun (Buyer / Seller)
                                </label>
                                <select
                                    value={formData.user_type}
                                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value as any })}
                                    className="w-full text-xs rounded-xl border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold"
                                >
                                    <option value="buyer">Pembeli (Buyer)</option>
                                    <option value="seller">Penjual Toko (Seller)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-1 border-t border-orange-200 dark:border-neutral-700">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                <input
                                    type="checkbox"
                                    checked={formData.is_member}
                                    onChange={(e) => setFormData({ ...formData, is_member: e.target.checked })}
                                    className="h-4 w-4 text-[#ee4d2d] focus:ring-[#ee4d2d] rounded"
                                />
                                <span>Anggota Resmi Juleha Jatim</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                <input
                                    type="checkbox"
                                    checked={formData.is_verified}
                                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded"
                                />
                                <span>Akun Terverifikasi (Verified)</span>
                            </label>
                        </div>
                    </div>

                    {/* Identitas Pengguna */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nama Lengkap"
                                    required
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-[#ee4d2d]"
                                />
                            </div>
                            {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Nomor Telepon / WhatsApp
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="08123456789"
                                    required
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-[#ee4d2d]"
                                />
                            </div>
                            {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    required
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-[#ee4d2d]"
                                />
                            </div>
                            {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                {isEditMode ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Masuk'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={isEditMode ? '••••••••' : 'Min. 6 Karakter'}
                                    required={!isEditMode}
                                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-[#ee4d2d]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[11px] text-red-600 mt-1">{errors.password}</p>}
                        </div>
                    </div>

                    {/* Data Daerah & ID Juleha */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Wilayah / DPD Daerah Jawa Timur
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <select
                                    value={formData.region_code || ''}
                                    onChange={handleRegionChange}
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-[#ee4d2d]"
                                >
                                    <option value="">Pilih Daerah / Non-Daerah</option>
                                    {allRegions.map((reg) => (
                                        <option key={reg.initial} value={reg.initial}>
                                            {reg.name} ({reg.initial})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Nomor ID Anggota Juleha
                            </label>
                            <input
                                type="text"
                                value={formData.juleha_id || ''}
                                onChange={(e) => setFormData({ ...formData, juleha_id: e.target.value })}
                                placeholder="Contoh: SBY22008, SDA22001"
                                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-[#ee4d2d]"
                            />
                        </div>
                    </div>

                    {/* Toko / Usaha Penjual */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                            Nama Toko / Usaha Penjual (Opsional)
                        </label>
                        <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                value={formData.shop_name || ''}
                                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                                placeholder="Contoh: Sentra Pandai Besi & Bilah Sidoarjo"
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-[#ee4d2d]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                            Alamat Domisili / Lokasi Toko
                        </label>
                        <textarea
                            rows={2}
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Alamat lengkap jalan, RT/RW, kelurahan, kecamatan, kota..."
                            className="w-full px-3 py-2 text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-[#ee4d2d]"
                        />
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="text-xs font-bold rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm px-5"
                        >
                            <Save className="h-4 w-4" />
                            <span>{processing ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Buat Pengguna'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
