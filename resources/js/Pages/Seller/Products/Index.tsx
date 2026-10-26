import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { ManagementProduct } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/Components/ui/table';
import { formatRupiah } from '@/lib/utils';
import { PlusCircle, Edit, Store, ExternalLink } from 'lucide-react';

interface Props {
    products: {
        data: ManagementProduct[];
        links: any[];
    };
}

export default function Index({ products }: Props) {
    return (
        <MarketplaceLayout>
            <Head title="Kelola Produk Jualan Saya - Juleha Jatim" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-xl font-black text-neutral-950 dark:text-white">
                            Kelola Produk Jualan Saya
                        </h1>
                        <p className="text-xs text-neutral-500">
                            Daftar bilah dan perlengkapan sembelih halal yang Anda daftarkan di Marketplace Juleha Jatim.
                        </p>
                    </div>

                    <Link href={route('seller.products.create')}>
                        <Button size="sm" variant="default" className="text-xs gap-1.5 font-bold bg-emerald-700 hover:bg-emerald-800">
                            <PlusCircle className="h-4 w-4" />
                            Tambah Produk Baru
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {products.data.length === 0 ? (
                            <div className="text-center py-12 text-xs text-neutral-500">
                                <Store className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                                Anda belum memiliki produk jualan.{' '}
                                <Link href={route('seller.products.create')} className="text-emerald-700 font-bold hover:underline">
                                    Mulai upload produk pertama Anda.
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Foto & Produk</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Harga Dasar Penjual</TableHead>
                                        <TableHead>Harga Jual Final</TableHead>
                                        <TableHead>Stok</TableHead>
                                        <TableHead>Status Persetujuan</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.data.map((p) => (
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
                                                            {p.weight_gram} gram
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">{p.category?.name || '-'}</TableCell>
                                            <TableCell className="font-mono text-xs font-bold">
                                                {formatRupiah(p.base_price)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-bold text-emerald-700">
                                                {formatRupiah(p.final_price)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{p.stock} unit</TableCell>
                                            <TableCell>
                                                {p.status === 'live' && (
                                                    <Badge variant="success">LIVE PUBLIK</Badge>
                                                )}
                                                {p.status === 'approved_ekop' && (
                                                    <Badge variant="info">ACC EKOP (Proses Jatim)</Badge>
                                                )}
                                                {p.status === 'pending' && (
                                                    <Badge variant="warning">PENDING REVIEW EKOP</Badge>
                                                )}
                                                {p.status === 'rejected' && (
                                                    <div>
                                                        <Badge variant="destructive">DITOLAK</Badge>
                                                        {p.rejection_reason && (
                                                            <span className="block text-[10px] text-red-600 mt-0.5">
                                                                Alasan: {p.rejection_reason}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-x-1.5">
                                                {p.status === 'live' && (
                                                    <Link href={route('products.show', p.slug)}>
                                                        <Button size="sm" variant="ghost" className="text-xs p-1.5" title="Lihat di Etalase">
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                <Link href={route('seller.products.edit', p.id)}>
                                                    <Button size="sm" variant="outline" className="text-xs gap-1">
                                                        <Edit className="h-3 w-3" />
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
