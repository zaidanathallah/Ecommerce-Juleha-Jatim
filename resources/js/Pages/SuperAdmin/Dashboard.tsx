import React, { useState, useMemo } from 'react';
import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { ManagementProduct, PageProps } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/Components/ui/table';
import { formatRupiah } from '@/lib/utils';
import {
    CheckCircle2,
    ShieldAlert,
    Building2,
    Coins,
    Users,
    Layers,
    ArrowUpRight,
    PackageCheck,
    CreditCard,
    Moon,
    Volume2,
    BellRing,
    Music,
    Tags,
    Plus,
    Package,
    Ticket,
    Edit2,
    Trash2,
    Search,
    UserPlus,
    MapPin,
    AlertCircle,
    Check,
} from 'lucide-react';
import CategoryManageModal from '@/Components/CategoryManageModal';
import VoucherManageModal from '@/Components/VoucherManageModal';
import AdminEkopManageModal, { AdminEkopData, RegionOption } from '@/Components/AdminEkopManageModal';

interface Props {
    stats: {
        waitingSuperReview: number;
        waitingEkopReview: number;
        liveProducts: number;
        totalMembers: number;
        totalEkopAdmins: number;
        totalKasProvinsi: number;
        totalKasDaerah: number;
        totalRegisteredRegions?: number;
        totalAllRegions?: number;
    };
    approvalQueue: ManagementProduct[];
    allProducts: {
        data: ManagementProduct[];
        links: any[];
    };
    recentOrders?: any[];
    categories?: any[];
    ekopRegions?: Array<{
        initial: string;
        name: string;
        is_registered: boolean;
        admins_count: number;
        members_count: number;
        total_kas_ekop: number;
        admins: Array<{
            id: number;
            name: string;
            email: string;
            phone: string;
            juleha_id: string;
            shop_name: string;
            region_code: string;
            region_name: string;
            created_at: string;
        }>;
    }>;
    allRegionsList?: RegionOption[];
    adminEkopList?: any[];
}

export default function SuperAdminDashboard({
    stats,
    approvalQueue,
    allProducts,
    recentOrders = [],
    categories = [],
    ekopRegions = [],
    allRegionsList = [],
    adminEkopList = [],
}: Props) {
    const [selectedProduct, setSelectedProduct] = useState<ManagementProduct | null>(null);
    const [actionType, setActionType] = useState<'publish' | 'reject' | null>(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);

    // State Manajemen Akun Admin Ekop Daerah
    const [showAdminEkopModal, setShowAdminEkopModal] = useState(false);
    const [adminToEdit, setAdminToEdit] = useState<AdminEkopData | null>(null);
    const [selectedRegionForNewAdmin, setSelectedRegionForNewAdmin] = useState<string | null>(null);
    const [ekopFilter, setEkopFilter] = useState<'all' | 'registered' | 'unregistered'>('all');
    const [ekopSearch, setEkopSearch] = useState('');

    const filteredEkopRegions = useMemo(() => {
        return ekopRegions.filter((r) => {
            if (ekopFilter === 'registered' && !r.is_registered) return false;
            if (ekopFilter === 'unregistered' && r.is_registered) return false;

            if (ekopSearch.trim()) {
                const s = ekopSearch.toLowerCase();
                const matchRegion = r.name.toLowerCase().includes(s) || r.initial.toLowerCase().includes(s);
                const matchAdmin = r.admins.some((a) =>
                    a.name.toLowerCase().includes(s) ||
                    a.email.toLowerCase().includes(s) ||
                    a.phone.toLowerCase().includes(s) ||
                    a.juleha_id.toLowerCase().includes(s)
                );
                return matchRegion || matchAdmin;
            }
            return true;
        });
    }, [ekopRegions, ekopFilter, ekopSearch]);

    const handleOpenCreateAdminEkop = (preferredRegionCode?: string) => {
        setAdminToEdit(null);
        setSelectedRegionForNewAdmin(preferredRegionCode || null);
        setShowAdminEkopModal(true);
    };

    const handleOpenEditAdminEkop = (admin: any) => {
        setAdminToEdit({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            region_code: admin.region_code,
            region_name: admin.region_name,
            juleha_id: admin.juleha_id,
            shop_name: admin.shop_name,
        });
        setSelectedRegionForNewAdmin(admin.region_code);
        setShowAdminEkopModal(true);
    };

    const handleDeleteAdminEkop = (admin: any) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun Admin Ekop "${admin.name}" (${admin.region_name || admin.region_code})? Tindakan ini akan menghapus akses pengurus daerah tersebut.`)) {
            router.delete(route('superadmin.admin-ekop.delete', admin.id), {
                preserveScroll: true,
            });
        }
    };

    const { site_settings } = usePage<PageProps>().props;

    const settingsForm = useForm({
        is_global_murottal_active: site_settings?.is_global_murottal_active ?? true,
        is_adzan_active: site_settings?.is_adzan_active ?? true,
        murottal_volume: site_settings?.murottal_volume ?? 50,
    });

    const submitSettings = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.put(route('superadmin.settings.update'), {
            preserveScroll: true,
        });
    };

    const publishForm = useForm({
        super_margin: 15000,
    });

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const handleOpenPublish = (product: ManagementProduct) => {
        setSelectedProduct(product);
        setActionType('publish');
        publishForm.setData('super_margin', 15000);
    };

    const handleOpenReject = (product: ManagementProduct) => {
        setSelectedProduct(product);
        setActionType('reject');
        rejectForm.setData('rejection_reason', '');
    };

    const submitPublish = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        publishForm.post(route('superadmin.products.publish', selectedProduct.id), {
            onSuccess: () => {
                setSelectedProduct(null);
                setActionType(null);
            },
        });
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        rejectForm.post(route('superadmin.products.reject', selectedProduct.id), {
            onSuccess: () => {
                setSelectedProduct(null);
                setActionType(null);
            },
        });
    };

    return (
        <MarketplaceLayout>
            <Head title="Panel Super Admin - Juleha Jawa Timur" />

            <CategoryManageModal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                categories={categories}
            />

            <VoucherManageModal
                isOpen={showVoucherModal}
                onClose={() => setShowVoucherModal(false)}
            />

            <AdminEkopManageModal
                isOpen={showAdminEkopModal}
                onClose={() => setShowAdminEkopModal(false)}
                adminToEdit={adminToEdit}
                initialRegionCode={selectedRegionForNewAdmin}
                allRegions={allRegionsList}
            />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="destructive" className="font-mono text-[10px]">
                                KONTROL PUSAT JULEHA JAWA TIMUR
                            </Badge>
                            <span className="text-xs font-mono font-bold text-neutral-500">
                                SELURUH KABUPATEN & KOTA
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-neutral-950 dark:text-white">
                            Pusat Komando & Finansial Super Admin
                        </h1>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            Otoritas tertinggi persetujuan publikasi (LIVE), audit kas organisasi (hierarki harga), dan pengawasan transaksi QRIS Dinamis & Logistik Kurir.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenCreateAdminEkop()}
                                className="text-xs font-bold border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl gap-1.5 shadow-xs"
                            >
                                <Building2 className="h-4 w-4" />
                                + Tambah Admin Ekop
                            </Button>
                            <Link href={route('seller.products.create')}>
                                <Button
                                    size="sm"
                                    className="bg-[#ee4d2d] hover:bg-[#d03e1f] text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    + Jual Produk Baru
                                </Button>
                            </Link>
                            <Link href={route('seller.products.index')}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs font-bold border-neutral-300 dark:border-neutral-700 rounded-xl gap-1.5"
                                >
                                    <Package className="h-4 w-4" />
                                    Produk Jualan Saya
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowVoucherModal(true)}
                                className="text-xs font-bold border-orange-300 text-[#ee4d2d] hover:bg-orange-50 rounded-xl gap-1.5"
                            >
                                <Ticket className="h-4 w-4" />
                                Kelola Voucher
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowCategoryModal(true)}
                                className="text-xs font-bold border-[#ee4d2d] text-[#ee4d2d] hover:bg-orange-50 rounded-xl gap-1.5"
                            >
                                <Tags className="h-4 w-4" />
                                Kelola Kategori
                            </Button>
                        </div>
                        <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-right">
                            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                                Kas Provinsi (super_margin)
                            </span>
                            <span className="text-lg font-mono font-black text-[#ee4d2d]">
                                {formatRupiah(stats.totalKasProvinsi)}
                            </span>
                        </div>
                        <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-right">
                            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                                Kas Daerah (ekop_margin)
                            </span>
                            <span className="text-lg font-mono font-black text-amber-700">
                                {formatRupiah(stats.totalKasDaerah)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="border-l-4 border-l-red-600">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                                    Butuh ACC Super Admin
                                </span>
                                <span className="text-xl font-black text-red-700">
                                    {stats.waitingSuperReview} Produk
                                </span>
                            </div>
                            <ShieldAlert className="h-7 w-7 text-red-500" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                                    Antrean di Admin Ekop
                                </span>
                                <span className="text-xl font-black text-amber-700">
                                    {stats.waitingEkopReview} Produk
                                </span>
                            </div>
                            <Layers className="h-7 w-7 text-amber-500" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[#ee4d2d]">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                                    Produk Live di Jatim
                                </span>
                                <span className="text-xl font-black text-[#ee4d2d]">
                                    {stats.liveProducts} Item
                                </span>
                            </div>
                            <CheckCircle2 className="h-7 w-7 text-orange-500" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-sky-600">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                                    Total Anggota Tervalidasi
                                </span>
                                <span className="text-xl font-black text-sky-700">
                                    {stats.totalMembers} Orang
                                </span>
                            </div>
                            <Users className="h-7 w-7 text-sky-500" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-indigo-600">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                                    Cakupan Daerah Ekop
                                </span>
                                <span className="text-xl font-black text-indigo-700">
                                    {stats.totalRegisteredRegions ?? 0} / {stats.totalAllRegions ?? 31}
                                </span>
                                <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">
                                    {stats.totalEkopAdmins} Akun Admin Terdaftar
                                </span>
                            </div>
                            <Building2 className="h-7 w-7 text-indigo-500" />
                        </CardContent>
                    </Card>
                </div>

                {/* Pengaturan Fitur Islami (Murottal Global & Adzan) */}
                <Card className="border-2 border-orange-400 dark:border-orange-500">
                    <CardHeader className="bg-[#ee4d2d] text-white py-3 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Moon className="h-5 w-5 text-orange-200" />
                                <div>
                                    <CardTitle className="text-sm text-white">
                                        Konfigurasi Global Fitur Islami (Murottal & Pengingat Adzan)
                                    </CardTitle>
                                    <CardDescription className="text-orange-100 text-[11px]">
                                        Pengaturan otomatis suasana Islami untuk seluruh pengunjung platform jualbeli.julehajatim.com
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-white border-white font-mono text-[10px]">
                                FITUR PUSAT JULEHA JATIM
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5">
                        <form onSubmit={submitSettings} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Toggle 1: Global Murottal */}
                                <div className="p-4 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Music className="h-4 w-4 text-[#ee4d2d]" />
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                Murottal Al-Qur'an Otomatis (Global)
                                            </span>
                                        </div>
                                        <Switch
                                            checked={settingsForm.data.is_global_murottal_active}
                                            onCheckedChange={(checked) => settingsForm.setData('is_global_murottal_active', checked)}
                                        />
                                    </div>
                                    <p className="text-[11px] text-neutral-500">
                                        Memutar lantunan Al-Qur'an (Misyari Rasyid) via Quran Foundation API v4 secara otomatis saat pengunjung berinteraksi dengan website.
                                    </p>
                                </div>

                                {/* Toggle 2: Real-time Adzan */}
                                <div className="p-4 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BellRing className="h-4 w-4 text-[#ee4d2d]" />
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                Pengingat & Audio Adzan Waktu Sholat
                                            </span>
                                        </div>
                                        <Switch
                                            checked={settingsForm.data.is_adzan_active}
                                            onCheckedChange={(checked) => settingsForm.setData('is_adzan_active', checked)}
                                        />
                                    </div>
                                    <p className="text-[11px] text-neutral-500">
                                        Otomatis memotong/menghentikan murottal dan membunyikan audio adzan 5 waktu (khusus adzan Shubuh memuat tatsywid) sesuai geolocation daerah.
                                    </p>
                                </div>
                            </div>

                            {/* Volume Slider */}
                            <div className="p-4 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Volume2 className="h-4 w-4 text-neutral-600" />
                                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            Volume Suara Default: {settingsForm.data.murottal_volume}%
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500">
                                        Tingkat kenyamanan volume audio awal saat diputar pertama kali di browser user.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-64">
                                    <input
                                        type="range"
                                        min={5}
                                        max={100}
                                        step={5}
                                        value={settingsForm.data.murottal_volume}
                                        onChange={(e) => settingsForm.setData('murottal_volume', parseInt(e.target.value))}
                                        className="w-full accent-[#ee4d2d] cursor-pointer"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={settingsForm.processing}
                                        size="sm"
                                        className="bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold shrink-0"
                                    >
                                        {settingsForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Manajemen Akun Admin Ekop Kabupaten & Kota (Jawa Timur) */}
                <Card className="border-2 border-indigo-300 dark:border-indigo-900 shadow-sm">
                    <CardHeader className="bg-indigo-50/70 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-black text-indigo-950 dark:text-indigo-200">
                                            Manajemen Akun Admin Ekop Daerah (31 Kab/Kota Jawa Timur)
                                        </CardTitle>
                                        <Badge variant="outline" className="text-indigo-700 border-indigo-300 font-mono text-[10px]">
                                            CRUD KHUSUS SUPER ADMIN
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                                        Pantau status registrasi pengurus Ekop tiap kabupaten/kota, buat akun baru, ubah data wilayah, atau hapus akses akun.
                                    </CardDescription>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                onClick={() => handleOpenCreateAdminEkop()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl gap-1.5 shadow-sm shrink-0"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>+ Daftarkan Akun Ekop Baru</span>
                            </Button>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 mt-2 border-t border-indigo-200/60 dark:border-indigo-900/40">
                            <div className="flex items-center gap-1.5">
                                <Button
                                    size="sm"
                                    variant={ekopFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setEkopFilter('all')}
                                    className={`text-[11px] h-7 rounded-lg ${ekopFilter === 'all' ? 'bg-indigo-600 text-white' : 'border-indigo-200 text-indigo-800'}`}
                                >
                                    Semua Daerah ({ekopRegions.length})
                                </Button>
                                <Button
                                    size="sm"
                                    variant={ekopFilter === 'registered' ? 'default' : 'outline'}
                                    onClick={() => setEkopFilter('registered')}
                                    className={`text-[11px] h-7 rounded-lg ${ekopFilter === 'registered' ? 'bg-emerald-600 text-white' : 'border-emerald-200 text-emerald-800'}`}
                                >
                                    Terdaftar ({ekopRegions.filter(r => r.is_registered).length})
                                </Button>
                                <Button
                                    size="sm"
                                    variant={ekopFilter === 'unregistered' ? 'default' : 'outline'}
                                    onClick={() => setEkopFilter('unregistered')}
                                    className={`text-[11px] h-7 rounded-lg ${ekopFilter === 'unregistered' ? 'bg-amber-600 text-white' : 'border-amber-200 text-amber-800'}`}
                                >
                                    Belum Terdaftar ({ekopRegions.filter(r => !r.is_registered).length})
                                </Button>
                            </div>

                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
                                <input
                                    type="text"
                                    value={ekopSearch}
                                    onChange={(e) => setEkopSearch(e.target.value)}
                                    placeholder="Cari daerah, kode, admin, email..."
                                    className="w-full text-xs pl-8 pr-3 py-1 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredEkopRegions.length === 0 ? (
                            <div className="text-center py-8 text-xs text-neutral-500">
                                Tidak ada daerah atau akun Admin Ekop yang sesuai dengan pencarian Anda.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">Kode</TableHead>
                                            <TableHead>Nama Daerah (Kab/Kota)</TableHead>
                                            <TableHead>Status Registrasi</TableHead>
                                            <TableHead>Akun Admin Ekop Terdaftar</TableHead>
                                            <TableHead>Kas Ekop Daerah</TableHead>
                                            <TableHead>Anggota Terdata</TableHead>
                                            <TableHead className="text-right">Aksi Kelola</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEkopRegions.map((region) => (
                                            <TableRow key={region.initial} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                                                <TableCell>
                                                    <span className="font-mono font-black text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md border text-neutral-800 dark:text-neutral-200">
                                                        {region.initial}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                                                        {region.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {region.is_registered ? (
                                                        <Badge variant="success" className="text-[10px] gap-1">
                                                            <Check className="h-3 w-3" />
                                                            <span>Terdaftar ({region.admins_count} Akun)</span>
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/20">
                                                            Belum Ada Akun
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {region.is_registered && region.admins.length > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {region.admins.map((adm) => (
                                                                <div key={adm.id} className="p-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <strong className="text-neutral-900 dark:text-neutral-100">
                                                                            {adm.name}
                                                                        </strong>
                                                                        <span className="font-mono text-[10px] text-neutral-500 font-bold">
                                                                            {adm.juleha_id}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-[10px] text-neutral-500 flex flex-wrap gap-x-2 mt-0.5">
                                                                        <span>✉ {adm.email}</span>
                                                                        <span>📱 {adm.phone}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-neutral-400 italic">
                                                            Belum ada penugasan admin daerah
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono font-bold text-xs text-amber-700">
                                                    {formatRupiah(region.total_kas_ekop)}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                        {region.members_count}
                                                    </span>{' '}
                                                    <span className="text-[10px] text-neutral-500">Anggota</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {region.is_registered && region.admins.length > 0 ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleOpenEditAdminEkop(region.admins[0])}
                                                                    className="h-7 text-[11px] border-neutral-300 gap-1 rounded-lg"
                                                                    title="Edit Akun Admin Ekop"
                                                                >
                                                                    <Edit2 className="h-3 w-3" />
                                                                    <span>Edit</span>
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleDeleteAdminEkop(region.admins[0])}
                                                                    className="h-7 text-[11px] gap-1 rounded-lg px-2"
                                                                    title="Hapus Akun Admin Ekop"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleOpenCreateAdminEkop(region.initial)}
                                                                    className="h-7 text-[11px] border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1 rounded-lg"
                                                                    title="Tambah Akun Ekop Lainnya di Daerah Ini"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleOpenCreateAdminEkop(region.initial)}
                                                                className="h-7 text-[11px] font-bold border-indigo-300 text-indigo-700 hover:bg-indigo-50 rounded-lg gap-1"
                                                            >
                                                                <UserPlus className="h-3 w-3" />
                                                                <span>+ Daftarkan</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Priority Queue: Antrean Publish Live (Sudah di-ACC Ekop) */}
                <Card className="border-2 border-red-300 dark:border-red-900">
                    <CardHeader className="bg-red-50/50 dark:bg-red-950/20">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-700" />
                            <CardTitle className="text-red-900 dark:text-red-300">
                                Antrean Publikasi Final: Penetapan Margin Provinsi & Penerbitan LIVE ({approvalQueue.length} Produk)
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Produk di bawah ini telah disetujui oleh Admin Ekop daerah masing-masing beserta margin daerahnya. Tetapkan margin kas provinsi untuk menerbitkan produk secara resmi ke publik.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {approvalQueue.length === 0 ? (
                            <div className="text-center py-8 text-xs text-neutral-500">
                                Tidak ada antrean produk menunggu persetujuan Super Admin.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produk</TableHead>
                                        <TableHead>Wilayah Daerah</TableHead>
                                        <TableHead>Harga Dasar Penjual</TableHead>
                                        <TableHead>Margin Daerah (Ekop)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Tindakan Publikasi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {approvalQueue.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={p.image_url || '/logo-juleha.jpg'}
                                                        alt={p.title}
                                                        className="h-10 w-10 rounded object-cover border border-neutral-300"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                                                            {p.title}
                                                        </div>
                                                        <span className="text-[10px] text-neutral-500">
                                                            Penjual: {p.seller_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-xs text-orange-600">
                                                {p.region_name} ({p.region_code})
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {formatRupiah(p.base_price)}
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-xs text-amber-700">
                                                + {formatRupiah(p.ekop_margin || 0)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="info">ACC EKOP OK</Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => handleOpenPublish(p)}
                                                    className="text-xs bg-[#ee4d2d] hover:bg-[#d73211] text-white"
                                                >
                                                    Publish LIVE
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleOpenReject(p)}
                                                    className="text-xs"
                                                >
                                                    Tolak
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Modal Publish LIVE & Margin Hierarchy Calculation */}
                {selectedProduct && actionType === 'publish' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
                            <div className="flex justify-between items-center border-b pb-3">
                                <div>
                                    <h3 className="font-black text-base text-neutral-900 dark:text-neutral-100">
                                        Penerbitan Produk LIVE & Hitung Hierarki Harga
                                    </h3>
                                    <span className="text-[10px] text-neutral-500 font-mono">
                                        Final Price = base_price + ekop_margin + super_margin
                                    </span>
                                </div>
                                <button onClick={() => setSelectedProduct(null)} className="text-neutral-400">
                                    &times;
                                </button>
                            </div>

                            <div className="text-xs space-y-2">
                                <p className="font-bold text-neutral-900 dark:text-neutral-100">
                                    {selectedProduct.title}
                                </p>
                                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded space-y-1.5 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Penjual & Wilayah:</span>
                                        <strong>{selectedProduct.seller_name} ({selectedProduct.region_name})</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">1. Harga Dasar Penjual (base_price):</span>
                                        <strong className="font-mono">{formatRupiah(selectedProduct.base_price)}</strong>
                                    </div>
                                    <div className="flex justify-between text-amber-700 font-bold">
                                        <span>2. Margin Kas Daerah (ekop_margin):</span>
                                        <span className="font-mono">+ {formatRupiah(selectedProduct.ekop_margin || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submitPublish} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                                        3. Tetapkan Margin Kas Provinsi (super_margin / Jatim)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={publishForm.data.super_margin}
                                        onChange={(e) => publishForm.setData('super_margin', Number(e.target.value))}
                                        required
                                        className="w-full text-sm font-mono font-bold rounded border-neutral-300 focus:ring-orange-500"
                                    />
                                    <span className="text-[11px] text-neutral-500 mt-1 block">
                                        Nominal ini akan dialokasikan ke Kas Juleha Jatim untuk operasional dakwah dan pembinaan sembelih halal.
                                    </span>
                                </div>

                                {/* Live Kalkulasi Final Price */}
                                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded text-xs space-y-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-900 dark:text-orange-300 block">
                                        Kalkulasi Final Price (Harga yang Tampil ke Pembeli):
                                    </span>
                                    <div className="flex justify-between items-baseline pt-1 border-t border-orange-200">
                                        <span className="font-semibold text-orange-800 dark:text-orange-200">
                                            Grand Total Final Publik:
                                        </span>
                                        <span className="text-xl font-mono font-black text-[#ee4d2d]">
                                            {formatRupiah(
                                                selectedProduct.base_price +
                                                Number(selectedProduct.ekop_margin || 0) +
                                                Number(publishForm.data.super_margin)
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-orange-700 dark:text-orange-400 italic">
                                        *Catatan Keamanan: Rincian margin disembunyikan secara absolut dari frontend pembeli publik.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedProduct(null)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="default"
                                        size="sm"
                                        disabled={publishForm.processing}
                                        className="bg-[#ee4d2d] hover:bg-[#d73211] text-white"
                                    >
                                        {publishForm.processing ? 'Menerbitkan...' : 'Terbitkan LIVE Sekarang'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Penolakan Super Admin */}
                {selectedProduct && actionType === 'reject' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h3 className="font-black text-base text-red-700">
                                    Tolak Publikasi Produk (Super Admin Jatim)
                                </h3>
                                <button onClick={() => setSelectedProduct(null)} className="text-neutral-400">
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={submitReject} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                                        Alasan Penolakan Provinsi
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={rejectForm.data.rejection_reason}
                                        onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                        placeholder="Tuliskan alasan penolakan untuk penjual dan admin daerah"
                                        required
                                        className="w-full text-xs rounded border-neutral-300 focus:ring-red-600"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        size="sm"
                                        disabled={rejectForm.processing}
                                    >
                                        {rejectForm.processing ? 'Memproses...' : 'Tolak Produk'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* All Products in Jatim Audit Table (Data-dense table view) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Lengkap Seluruh Produk Jawa Timur</CardTitle>
                        <CardDescription>
                            Tabel terpadu rincian hierarki harga: Harga Dasar | Margin Ekop | Margin Super | Total Final
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Wilayah Daerah</TableHead>
                                    <TableHead>Penjual</TableHead>
                                    <TableHead>Harga Dasar</TableHead>
                                    <TableHead>Margin Daerah</TableHead>
                                    <TableHead>Margin Jatim</TableHead>
                                    <TableHead>Total Final</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allProducts.data.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-bold text-xs">{p.title}</TableCell>
                                        <TableCell className="text-xs font-bold text-orange-600">
                                            {p.region_name}
                                        </TableCell>
                                        <TableCell className="text-xs">{p.seller_name}</TableCell>
                                        <TableCell className="font-mono text-xs">{formatRupiah(p.base_price)}</TableCell>
                                        <TableCell className="font-mono text-xs text-amber-700 font-bold">
                                            {p.ekop_margin != null ? formatRupiah(p.ekop_margin) : '-'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-red-700 font-bold">
                                            {p.super_margin != null ? formatRupiah(p.super_margin) : '-'}
                                        </TableCell>
                                        <TableCell className="font-mono font-black text-xs text-[#ee4d2d]">
                                            {formatRupiah(p.final_price)}
                                        </TableCell>
                                        <TableCell>
                                            {p.status === 'live' && <Badge variant="success">LIVE</Badge>}
                                            {p.status === 'approved_ekop' && <Badge variant="info">ACC EKOP</Badge>}
                                            {p.status === 'pending' && <Badge variant="warning">PENDING</Badge>}
                                            {p.status === 'rejected' && <Badge variant="destructive">DITOLAK</Badge>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Audit Transaksi & Bukti Pesanan (Provinsi) */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Audit Transaksi & Bukti Pembayaran / Penerimaan</CardTitle>
                                <CardDescription>
                                    Transparansi bukti transfer bank manual dan bukti fisik terima barang dari seluruh kabupaten/kota se-Jawa Timur
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {recentOrders.length} Pesanan Terakhir
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-6 text-xs text-neutral-500">
                                Belum ada pesanan yang tercatat dalam sistem.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No. Pesanan</TableHead>
                                        <TableHead>Penjual / Toko</TableHead>
                                        <TableHead>Pembeli</TableHead>
                                        <TableHead>Metode Bayar</TableHead>
                                        <TableHead>Bukti Transfer</TableHead>
                                        <TableHead>Bukti Terima & Qty</TableHead>
                                        <TableHead>Total Nilai</TableHead>
                                        <TableHead>Kas Jatim</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <Link
                                                    href={route('orders.show', order.order_number)}
                                                    className="font-mono font-bold text-xs text-[#ee4d2d] hover:underline block"
                                                >
                                                    {order.order_number}
                                                </Link>
                                                <span className="text-[10px] text-neutral-500 font-mono">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                    {order.seller?.name || 'Penjual'}
                                                </div>
                                                <span className="text-[10px] text-neutral-500">
                                                    {order.seller?.region_name || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {order.buyer?.name || 'Pembeli'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={order.payment_method_type === 'manual_transfer' ? 'warning' : 'success'}
                                                    className="text-[10px]"
                                                >
                                                    {order.payment_method_type === 'manual_transfer' ? 'Rek. Pribadi' : 'QRIS Dinamis'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {order.transfer_receipt_path ? (
                                                    <a
                                                        href={order.transfer_receipt_path}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block"
                                                    >
                                                        <div className="w-12 h-10 border border-neutral-300 dark:border-neutral-700 rounded overflow-hidden bg-neutral-100">
                                                            <img
                                                                src={order.transfer_receipt_path}
                                                                alt="Transfer"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-[9px] text-orange-600 font-bold block mt-0.5">
                                                            Lihat HD
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] text-neutral-400">
                                                        {order.payment_method_type === 'manual_transfer' ? 'Belum Ada' : 'Otomatis PG'}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {order.delivery_receipt_path ? (
                                                    <a
                                                        href={order.delivery_receipt_path}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block"
                                                    >
                                                        <div className="w-12 h-10 border border-neutral-300 dark:border-neutral-700 rounded overflow-hidden bg-neutral-100">
                                                            <img
                                                                src={order.delivery_receipt_path}
                                                                alt="Terima"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200 block mt-0.5">
                                                            {order.received_quantity ?? 1} Unit
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <Badge variant="outline" className="text-[9px]">
                                                        Belum Diterima
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-bold">
                                                {formatRupiah(order.grand_total)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-bold text-red-700">
                                                {formatRupiah(order.total_super_margin)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={route('orders.show', order.order_number)}
                                                    className="inline-block text-xs font-bold text-[#ee4d2d] hover:underline"
                                                >
                                                    Detail &rarr;
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MarketplaceLayout>
    );
}
