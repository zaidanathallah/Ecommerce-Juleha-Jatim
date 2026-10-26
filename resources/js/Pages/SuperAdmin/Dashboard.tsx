import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { ManagementProduct } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
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
} from 'lucide-react';

interface Props {
    stats: {
        waitingSuperReview: number;
        waitingEkopReview: number;
        liveProducts: number;
        totalMembers: number;
        totalEkopAdmins: number;
        totalKasProvinsi: number;
        totalKasDaerah: number;
    };
    approvalQueue: ManagementProduct[];
    allProducts: {
        data: ManagementProduct[];
        links: any[];
    };
}

export default function SuperAdminDashboard({
    stats,
    approvalQueue,
    allProducts,
}: Props) {
    const [selectedProduct, setSelectedProduct] = useState<ManagementProduct | null>(null);
    const [actionType, setActionType] = useState<'publish' | 'reject' | null>(null);

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
            <Head title="Panel Super Admin - DPW Juleha Jawa Timur" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="destructive" className="font-mono text-[10px]">
                                KONTROL PUSAT DPW JAWA TIMUR
                            </Badge>
                            <span className="text-xs font-mono font-bold text-neutral-500">
                                SELURUH KABUPATEN & KOTA
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-neutral-950 dark:text-white">
                            Pusat Komando & Finansial Super Admin
                        </h1>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            Otoritas tertinggi persetujuan publikasi (LIVE), audit kas organisasi (hierarki harga), dan pengawasan transaksi DOKU/Biteship.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-right">
                            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                                Kas Provinsi (super_margin)
                            </span>
                            <span className="text-lg font-mono font-black text-emerald-700">
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

                    <Card className="border-l-4 border-l-green-600">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                                    Produk Live di Jatim
                                </span>
                                <span className="text-xl font-black text-green-700">
                                    {stats.liveProducts} Item
                                </span>
                            </div>
                            <CheckCircle2 className="h-7 w-7 text-green-500" />
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
                </div>

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
                                        <TableHead>Wilayah DPD</TableHead>
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
                                            <TableCell className="font-bold text-xs text-emerald-700">
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
                                                    className="text-xs bg-emerald-700 hover:bg-emerald-800"
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
                                        className="w-full text-sm font-mono font-bold rounded border-neutral-300 focus:ring-emerald-700"
                                    />
                                    <span className="text-[11px] text-neutral-500 mt-1 block">
                                        Nominal ini akan dialokasikan ke Kas DPW Jatim untuk operasional dakwah dan pembinaan sembelih halal.
                                    </span>
                                </div>

                                {/* Live Kalkulasi Final Price */}
                                <div className="p-4 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 rounded text-xs space-y-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 block">
                                        Kalkulasi Final Price (Harga yang Tampil ke Pembeli):
                                    </span>
                                    <div className="flex justify-between items-baseline pt-1 border-t border-emerald-300">
                                        <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                                            Grand Total Final Publik:
                                        </span>
                                        <span className="text-xl font-mono font-black text-emerald-900 dark:text-emerald-100">
                                            {formatRupiah(
                                                selectedProduct.base_price +
                                                Number(selectedProduct.ekop_margin || 0) +
                                                Number(publishForm.data.super_margin)
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 italic">
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
                                        className="bg-emerald-700 hover:bg-emerald-800"
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
                                    <TableHead>Wilayah DPD</TableHead>
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
                                        <TableCell className="text-xs font-bold text-emerald-700">
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
                                        <TableCell className="font-mono font-black text-xs text-emerald-800">
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
            </div>
        </MarketplaceLayout>
    );
}
