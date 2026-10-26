import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { PageProps } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/Components/ui/table';
import { formatRupiah } from '@/lib/utils';
import {
    PlusCircle,
    Package,
    Clock,
    CheckCircle2,
    ShieldCheck,
    Store,
    ShoppingBag,
    MapPin,
} from 'lucide-react';

interface Props {
    myProductsCount: number;
    myLiveCount: number;
    myPendingCount: number;
    recentProducts: any[];
}

export default function Dashboard({
    myProductsCount,
    myLiveCount,
    myPendingCount,
    recentProducts,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <MarketplaceLayout>
            <Head title="Dashboard Anggota - Juleha Jatim" />

            <div className="space-y-6">
                {/* Member Identity Banner */}
                <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl border border-emerald-300">
                            {user?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-neutral-950 dark:text-white">
                                    {user?.name}
                                </h1>
                                <Badge variant="success" className="gap-1 font-mono text-[10px]">
                                    <ShieldCheck className="h-3 w-3" />
                                    TERVALIDASI PUSAT
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                    ID JULEHA: {user?.juleha_id ?? '-'}
                                </span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                                    {user?.region_name ?? 'Jawa Timur'}
                                </span>
                                <span>&bull;</span>
                                <span>Email: {user?.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Link href={route('seller.products.create')}>
                            <Button size="sm" variant="default" className="text-xs gap-1.5 font-bold">
                                <PlusCircle className="h-4 w-4" />
                                Jual Produk Baru
                            </Button>
                        </Link>
                        <Link href={route('seller.products.index')}>
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 font-bold">
                                <Package className="h-4 w-4" />
                                Kelola Produk ({myProductsCount})
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics: Data-dense, high-contrast, zero-slop */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-emerald-600">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                    Total Produk Terdaftar
                                </span>
                                <span className="text-2xl font-black text-neutral-900 dark:text-white">
                                    {myProductsCount}
                                </span>
                            </div>
                            <Store className="h-8 w-8 text-neutral-400" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-600">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                    Produk Live di Marketplace
                                </span>
                                <span className="text-2xl font-black text-green-700">
                                    {myLiveCount}
                                </span>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-600">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                    Menunggu Persetujuan Admin
                                </span>
                                <span className="text-2xl font-black text-amber-700">
                                    {myPendingCount}
                                </span>
                            </div>
                            <Clock className="h-8 w-8 text-amber-500" />
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Products Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Produk Terbaru Saya</CardTitle>
                            <CardDescription>
                                Produk yang Anda jual melalui verifikasi Admin Ekop daerah dan Super Admin provinsi
                            </CardDescription>
                        </div>
                        <Link href={route('seller.products.index')}>
                            <Button size="sm" variant="ghost" className="text-xs">
                                Lihat Semua &rarr;
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentProducts.length === 0 ? (
                            <div className="text-center py-8 text-xs text-neutral-500">
                                Anda belum memiliki produk jualan.{' '}
                                <Link href={route('seller.products.create')} className="text-emerald-700 font-bold hover:underline">
                                    Klik di sini untuk upload bilah/peralatan sembelih pertama Anda.
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Produk</TableHead>
                                        <TableHead>Harga Dasar Penjual</TableHead>
                                        <TableHead>Stok</TableHead>
                                        <TableHead>Status Persetujuan</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentProducts.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-bold text-neutral-900 dark:text-neutral-100">
                                                {p.title}
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {formatRupiah(p.base_price)}
                                            </TableCell>
                                            <TableCell className="font-mono">{p.stock} unit</TableCell>
                                            <TableCell>
                                                {p.status === 'live' && (
                                                    <Badge variant="success">LIVE PUBLIK</Badge>
                                                )}
                                                {p.status === 'approved_ekop' && (
                                                    <Badge variant="info">ACC EKOP (Menunggu Super Admin)</Badge>
                                                )}
                                                {p.status === 'pending' && (
                                                    <Badge variant="warning">PENDING REVIEW EKOP</Badge>
                                                )}
                                                {p.status === 'rejected' && (
                                                    <Badge variant="destructive">DITOLAK</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('seller.products.edit', p.id)}>
                                                    <Button size="sm" variant="outline" className="text-xs">
                                                        Edit
                                                    </Button>
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
