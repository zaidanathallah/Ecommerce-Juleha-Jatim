import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, 
    Building2, 
    UserCheck, 
    Mail, 
    Phone, 
    Lock, 
    CreditCard, 
    Store, 
    Save, 
    Eye, 
    EyeOff,
    CheckCircle2,
    Shield
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

export interface AdminEkopData {
    id?: number;
    name: string;
    email: string;
    phone: string;
    password?: string;
    region_code: string;
    region_name?: string;
    juleha_id?: string;
    shop_name?: string;
}

export interface RegionOption {
    initial: string;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    adminToEdit?: AdminEkopData | null;
    initialRegionCode?: string | null;
    allRegions: RegionOption[];
}

export default function AdminEkopManageModal({
    isOpen,
    onClose,
    adminToEdit,
    initialRegionCode,
    allRegions = [],
}: Props) {
    const isEditMode = Boolean(adminToEdit && adminToEdit.id);

    const [formData, setFormData] = useState<AdminEkopData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        region_code: '',
        region_name: '',
        juleha_id: '',
        shop_name: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (adminToEdit && adminToEdit.id) {
            setFormData({
                id: adminToEdit.id,
                name: adminToEdit.name || '',
                email: adminToEdit.email || '',
                phone: adminToEdit.phone || '',
                password: '',
                region_code: adminToEdit.region_code || '',
                region_name: adminToEdit.region_name || '',
                juleha_id: adminToEdit.juleha_id || '',
                shop_name: adminToEdit.shop_name || '',
            });
        } else {
            const selectedCode = initialRegionCode || (allRegions[0]?.initial ?? 'SBY');
            const regionObj = allRegions.find((r) => r.initial === selectedCode);
            const rName = regionObj ? regionObj.name : 'Surabaya';

            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                region_code: selectedCode,
                region_name: rName,
                juleha_id: `${selectedCode}-EKOP-01`,
                shop_name: `Ekop ${rName}`,
            });
        }
        setErrors({});
    }, [adminToEdit, initialRegionCode, isOpen]);

    if (!isOpen) return null;

    const handleRegionChange = (newCode: string) => {
        const regionObj = allRegions.find((r) => r.initial === newCode);
        const rName = regionObj ? regionObj.name : newCode;

        setFormData((prev) => ({
            ...prev,
            region_code: newCode,
            region_name: rName,
            // Jika belum di-edit manual, auto-update juleha_id dan nama toko
            juleha_id: isEditMode ? prev.juleha_id : `${newCode}-EKOP-01`,
            shop_name: isEditMode ? prev.shop_name : `Ekop ${rName}`,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        if (isEditMode && adminToEdit?.id) {
            router.put(route('superadmin.admin-ekop.update', adminToEdit.id), formData as any, {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                },
                onError: (err) => {
                    setProcessing(false);
                    setErrors(err);
                },
            });
        } else {
            router.post(route('superadmin.admin-ekop.store'), formData as any, {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                },
                onError: (err) => {
                    setProcessing(false);
                    setErrors(err);
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-[#ee4d2d] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-black">
                                {isEditMode ? 'Edit Akun Admin Ekop Daerah' : 'Daftarkan Akun Admin Ekop Daerah Baru'}
                            </h2>
                            <p className="text-[11px] text-orange-100">
                                DPW Juleha Jawa Timur &bull; Otoritas Yurisdiksi Kabupaten/Kota
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* Region Selector */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                            Pilih Daerah Kabupaten / Kota Jatim <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.region_code}
                            onChange={(e) => handleRegionChange(e.target.value)}
                            className="w-full text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 p-2.5 focus:ring-2 focus:ring-[#ee4d2d]"
                            required
                        >
                            {allRegions.map((reg) => (
                                <option key={reg.initial} value={reg.initial}>
                                    [{reg.initial}] {reg.name}
                                </option>
                            ))}
                        </select>
                        {errors.region_code && (
                            <p className="text-[10px] text-red-500 font-bold mt-1">{errors.region_code}</p>
                        )}
                    </div>

                    {/* Nama Lengkap & No WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Nama Lengkap Pengurus Ekop <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: H. Ahmad Fauzi, S.Pt"
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 p-2.5 focus:ring-2 focus:ring-[#ee4d2d]"
                                required
                            />
                            {errors.name && (
                                <p className="text-[10px] text-red-500 font-bold mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Nomor WhatsApp / HP <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Contoh: 081234567890"
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 p-2.5 focus:ring-2 focus:ring-[#ee4d2d]"
                                required
                            />
                            {errors.phone && (
                                <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Email & Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Alamat Email Login <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="ekop.daerah@julehajatim.com"
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 p-2.5 focus:ring-2 focus:ring-[#ee4d2d]"
                                required
                            />
                            {errors.email && (
                                <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Password Login {isEditMode ? '(Kosongkan bila tidak diubah)' : <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={isEditMode ? '••••••••' : 'Min. 6 Karakter'}
                                    className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 p-2.5 pr-9 focus:ring-2 focus:ring-[#ee4d2d]"
                                    required={!isEditMode}
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[10px] text-red-500 font-bold mt-1">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    {/* Juleha ID & Nama Toko Koperasi Ekop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-neutral-200 dark:border-neutral-800">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Nomor Anggota / ID Juleha Ekop
                            </label>
                            <input
                                type="text"
                                value={formData.juleha_id}
                                onChange={(e) => setFormData({ ...formData, juleha_id: e.target.value.toUpperCase() })}
                                placeholder={`${formData.region_code}-EKOP-01`}
                                className="w-full text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 p-2.5 focus:ring-2 focus:ring-[#ee4d2d]"
                            />
                            <span className="text-[10px] text-neutral-500 mt-0.5 block">
                                Format: Inisial Daerah + EKOP (Misal: SBY-EKOP-01)
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Nama Toko / Koperasi Daerah
                            </label>
                            <input
                                type="text"
                                value={formData.shop_name}
                                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                                placeholder={`Ekop ${formData.region_name || formData.region_code}`}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 p-2.5 focus:ring-2 focus:ring-[#ee4d2d]"
                            />
                            <span className="text-[10px] text-neutral-500 mt-0.5 block">
                                Nama unit usaha resmi koperasi di wilayah ini
                            </span>
                        </div>
                    </div>

                    {/* Info Hak Akses Box */}
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-900/50 flex items-start gap-2.5">
                        <Shield className="h-4 w-4 text-[#ee4d2d] shrink-0 mt-0.5" />
                        <div className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                            <strong>Hak Akses Admin Ekop Daerah:</strong> Akun ini akan memiliki wewenang memverifikasi produk anggota di wilayah <strong>{formData.region_name || formData.region_code}</strong>, menetapkan margin kas daerah (<code>ekop_margin</code>), memantau anggota terdaftar, serta meninjau transaksi dan mutasi kas daerah.
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing}
                            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white font-bold rounded-xl gap-1.5 shadow-sm"
                        >
                            <Save className="h-4 w-4" />
                            <span>{processing ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Daftarkan Akun Ekop')}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

