import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { ManagementProduct } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/Components/ui/table';
import { formatRupiah } from '@/lib/utils';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Shield,
    Users,
    MapPin,
    AlertCircle,
} from 'lucide-react';

interface Props {
    regionName: string;
    regionCode: string;
    stats: {
        pendingReview: number;
        waitingSuperAdmin: number;
        liveProducts: number;
        totalMembers: number;
        unsettledDebtOrdersCount?: number;
        totalUnsettledEkopDebt?: number;
        totalUnsettledSuperDebt?: number;
    };
    reviewQueue: ManagementProduct[];
    allProducts: {
        data: ManagementProduct[];
        links: any[];
    };
    unsettledDebts?: any[];
}

export default function AdminEkopDashboard({
    regionName,
    regionCode,
    stats,
    reviewQueue,
    allProducts,
    unsettledDebts = [],
}: Props) {
    const [selectedProduct, setSelectedProduct] = useState<ManagementProduct | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

    const approveForm = useForm({
        ekop_margin: 25000,
        notes: '',
    });

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const handleOpenApprove = (product: ManagementProduct) => {
        setSelectedProduct(product);
        setActionType('approve');
        approveForm.setData('ekop_margin', 25000);
    };

    const handleOpenReject = (product: ManagementProduct) => {
        setSelectedProduct(product);
        setActionType('reject');
        rejectForm.setData('rejection_reason', '');
    };

    const submitApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        approveForm.post(route('ekop.products.approve', selectedProduct.id), {
            onSuccess: () => {
                setSelectedProduct(null);
                setActionType(null);
            },
        });
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        rejectForm.post(route('ekop.products.reject', selectedProduct.id), {
            onSuccess: () => {
                setSelectedProduct(null);
                setActionType(null);
            },
        });
    };

    return (
        <MarketplaceLayout>
            <Head title={`Panel Admin Ekop - ${regionName}`} />

            <div className="space-y-6">
                {/* Region Jurisdiction Header */}
                <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="warning" className="font-mono text-[10px]">
                                YURISDIKSI DAERAH KABUPATEN/KOTA
                            </Badge>
                            <span className="text-xs font-mono font-bold text-neutral-500">
                                KODE: {regionCode}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-neutral-950 dark:text-white">
                            Panel Admin Ekop: {regionName}
                        </h1>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            Memverifikasi produk dari anggota di wilayah Anda dan menetapkan margin kas daerah (ekop_margin).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a 
                            href="/biteship/simulation" 
                            className="text-xs font-bold px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 inline-flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200"
                        >
                            <span>📦</span> Simulator Biteship
                        </a>
                        <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-right">
                            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                                Anggota Wilayah
                            </span>
                            <span className="text-xl font-mono font-black text-emerald-700">
                                {stats.totalMembers}
                            </span>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                    Butuh ACC Ekop
                                </span>
                                <span className="text-2xl font-black text-amber-700">
                                    {stats.pendingReview} Produk
                                </span>
                            </div>
                            <Clock className="h-7 w-7 text-amber-500" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-sky-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                    Menunggu SuperAdmin
                                </span>
                                <span className="text-2xl font-black text-sky-700">
                                    {stats.waitingSuperAdmin} Produk
                                </span>
                            </div>
                            <Shield className="h-7 w-7 text-sky-500" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-600">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                    Live Marketplace
                                </span>
                                <span className="text-2xl font-black text-emerald-700">
                                    {stats.liveProducts} Produk
                                </span>
                            </div>
                            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-rose-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                    Hutang Margin Penjual
                                </span>
                                <span className="text-xl font-black text-rose-700">
                                    {stats.unsettledDebtOrdersCount ?? 0} Pesanan
                                </span>
                                <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                                    Kas DPD: {formatRupiah(stats.totalUnsettledEkopDebt ?? 0)}
                                </span>
                            </div>
                            <AlertCircle className="h-7 w-7 text-rose-500" />
                        </CardContent>
                    </Card>
                </div>

                {/* Priority Queue: Butuh ACC Admin Ekop */}
                <Card className="border-2 border-amber-300 dark:border-amber-900">
                    <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-700" />
                            <CardTitle className="text-amber-900 dark:text-amber-300">
                                Antrean Verifikasi & Penetapan Margin Daerah ({reviewQueue.length} Produk)
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Tinjau bilah atau perlengkapan sembelih dari penjual di wilayah {regionName}, pastikan spesifikasi halal terpenuhi, lalu masukkan nominal margin untuk kas daerah Anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {reviewQueue.length === 0 ? (
                            <div className="text-center py-8 text-xs text-neutral-500">
                                Tidak ada antrean produk baru yang menunggu verifikasi di wilayah ini.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Foto & Produk</TableHead>
                                        <TableHead>Penjual</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Harga Dasar Penjual</TableHead>
                                        <TableHead>Status Saat Ini</TableHead>
                                        <TableHead className="text-right">Aksi Tindakan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reviewQueue.map((p) => (
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
                                                        <span className="text-[10px] text-neutral-500 font-mono">
                                                            {p.weight_gram}g &bull; Stok: {p.stock}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-xs">
                                                {p.seller_name}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {p.category?.name || '-'}
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-xs">
                                                {formatRupiah(p.base_price)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="warning">PENDING EKOP</Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => handleOpenApprove(p)}
                                                    className="text-xs bg-emerald-700 hover:bg-emerald-800"
                                                >
                                                    Setujui (ACC)
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

                {/* Modal Approval Persetujuan Margin Ekop */}
                {selectedProduct && actionType === 'approve' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h3 className="font-black text-base text-neutral-900 dark:text-neutral-100">
                                    Persetujuan Produk & Input Margin Daerah
                                </h3>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-neutral-400 hover:text-neutral-600"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="text-xs space-y-2">
                                <p className="font-bold text-neutral-900 dark:text-neutral-100">
                                    {selectedProduct.title}
                                </p>
                                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Penjual:</span>
                                        <strong>{selectedProduct.seller_name}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Harga Dasar Penjual (base_price):</span>
                                        <strong className="font-mono">{formatRupiah(selectedProduct.base_price)}</strong>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submitApprove} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                                        Nominal Margin Kas Daerah (ekop_margin)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={approveForm.data.ekop_margin}
                                        onChange={(e) => approveForm.setData('ekop_margin', Number(e.target.value))}
                                        required
                                        className="w-full text-sm font-mono font-bold rounded border-neutral-300 focus:ring-emerald-700"
                                    />
                                    <span className="text-[11px] text-neutral-500 mt-1 block">
                                        Nominal ini akan dialokasikan ke kas DPD {regionName} saat produk terjual.
                                    </span>
                                </div>

                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded text-xs">
                                    <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-300">
                                        <span>Subtotal Sementara (Base + Ekop):</span>
                                        <span className="font-mono">
                                            {formatRupiah(selectedProduct.base_price + Number(approveForm.data.ekop_margin))}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 mt-1">
                                        *Super Admin Jatim selanjutnya akan menetapkan super_margin sebelum produk tayang live.
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
                                        disabled={approveForm.processing}
                                        className="bg-emerald-700 hover:bg-emerald-800"
                                    >
                                        {approveForm.processing ? 'Menyimpan...' : 'Konfirmasi ACC Ekop'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Penolakan Produk */}
                {selectedProduct && actionType === 'reject' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h3 className="font-black text-base text-red-700">
                                    Tolak Pengajuan Produk
                                </h3>
                                <button onClick={() => setSelectedProduct(null)} className="text-neutral-400">
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={submitReject} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                                        Alasan Penolakan (Akan dikirim ke penjual)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={rejectForm.data.rejection_reason}
                                        onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                        placeholder="Contoh: Bilah belum memenuhi standar ketajaman sembelih halal / foto tidak jelas"
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

                {/* Penagihan Margin: Hutang Penjual ke Kas (Akibat Toko Non-PG DOKU) */}
                <Card className="border-2 border-rose-300 dark:border-rose-900">
                    <CardHeader className="bg-rose-50/50 dark:bg-rose-950/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-rose-700" />
                                <div>
                                    <CardTitle className="text-rose-950 dark:text-rose-200">
                                        Penagihan Margin Toko: Hutang Penjual ke Kas ({unsettledDebts?.length ?? 0} Pesanan)
                                    </CardTitle>
                                    <CardDescription className="text-xs text-rose-700 dark:text-rose-400">
                                        Pesanan berikut dibayar oleh pembeli via transfer langsung ke rekening pribadi penjual (Toko Non-PG). 
                                        Penjual wajib menyetorkan margin DPD ({regionName}) dan DPW Jatim ke kas organisasi.
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!unsettledDebts || unsettledDebts.length === 0 ? (
                            <div className="text-center py-6 text-xs text-neutral-500">
                                Tidak ada hutang margin yang tertunda. Semua penjual tertib atau menggunakan sistem otomatis Payment Gateway DOKU.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pesanan</TableHead>
                                        <TableHead>Penjual / Toko</TableHead>
                                        <TableHead>Bukti Transfer</TableHead>
                                        <TableHead>Bukti Terima & Qty</TableHead>
                                        <TableHead>Margin DPD ({regionCode})</TableHead>
                                        <TableHead>Margin DPW Jatim</TableHead>
                                        <TableHead>Total Kas</TableHead>
                                        <TableHead className="text-right">Tindakan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unsettledDebts.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <Link
                                                    href={route('orders.show', order.order_number)}
                                                    className="font-mono font-bold text-xs text-emerald-700 hover:underline block"
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
                                                <span className="text-[10px] text-neutral-500 font-mono block">
                                                    HP: {order.seller?.phone || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {order.transfer_receipt_path ? (
                                                    <a
                                                        href={order.transfer_receipt_path}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block"
                                                    >
                                                        <div className="w-14 h-12 border border-neutral-300 dark:border-neutral-700 rounded overflow-hidden bg-neutral-100">
                                                            <img
                                                                src={order.transfer_receipt_path}
                                                                alt="Bukti Transfer"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                                                            Lihat HD
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <Badge variant="outline" className="text-[9px]">
                                                        Belum Upload
                                                    </Badge>
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
                                                        <div className="w-14 h-12 border border-neutral-300 dark:border-neutral-700 rounded overflow-hidden bg-neutral-100">
                                                            <img
                                                                src={order.delivery_receipt_path}
                                                                alt="Bukti Terima"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 block mt-0.5">
                                                            Qty: {order.received_quantity ?? 1} Unit
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <Badge variant="warning" className="text-[9px]">
                                                        Belum Diterima
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-bold text-amber-700">
                                                {formatRupiah(order.total_ekop_margin)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-bold text-sky-700">
                                                {formatRupiah(order.total_super_margin)}
                                            </TableCell>
                                            <TableCell className="font-mono font-black text-xs text-rose-700">
                                                {formatRupiah(order.total_ekop_margin + order.total_super_margin)}
                                            </TableCell>
                                            <TableCell className="text-right space-y-1">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => {
                                                        if (confirm(`Konfirmasi pelunasan setoran kas untuk ${order.order_number}? Pastikan bukti terima barang telah diperiksa.`)) {
                                                            router.post(route('ekop.orders.settle-debt', order.id));
                                                        }
                                                    }}
                                                    className="text-xs bg-emerald-700 hover:bg-emerald-800 w-full"
                                                >
                                                    Tandai Lunas
                                                </Button>
                                                <Link
                                                    href={route('orders.show', order.order_number)}
                                                    className="block text-[10px] text-neutral-500 hover:text-emerald-700 font-bold"
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

                {/* All Regional Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Semua Produk di Wilayah {regionName}</CardTitle>
                        <CardDescription>
                            Arsip lengkap seluruh produk yang didaftarkan oleh anggota di daerah {regionName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Penjual</TableHead>
                                    <TableHead>Harga Dasar</TableHead>
                                    <TableHead>Margin Ekop</TableHead>
                                    <TableHead>Total Final</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allProducts.data.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-bold text-xs">{p.title}</TableCell>
                                        <TableCell className="text-xs">{p.seller_name}</TableCell>
                                        <TableCell className="font-mono text-xs">{formatRupiah(p.base_price)}</TableCell>
                                        <TableCell className="font-mono text-xs text-amber-700">
                                            {p.ekop_margin != null ? formatRupiah(p.ekop_margin) : '-'}
                                        </TableCell>
                                        <TableCell className="font-mono font-bold text-xs text-emerald-700">
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
