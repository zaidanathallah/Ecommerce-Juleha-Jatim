import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { BuyerProduct } from '@/types';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatRupiah } from '@/lib/utils';
import {
    ShieldCheck,
    MapPin,
    Truck,
    CreditCard,
    ArrowLeft,
    CheckCircle2,
    Share2,
    Package,
    Scale,
} from 'lucide-react';

interface Props {
    product: BuyerProduct;
    schemaJson: any;
}

export default function Show({ product, schemaJson }: Props) {
    return (
        <MarketplaceLayout>
            <Head>
                <title>{`${product.title} - Jual Beli Juleha Jawa Timur`}</title>
                <meta name="description" content={product.description.slice(0, 160)} />
                <meta property="og:title" content={product.title} />
                <meta property="og:description" content={product.description.slice(0, 160)} />
                <meta property="og:image" content={product.image_url} />
                <script type="application/ld+json">
                    {JSON.stringify(schemaJson)}
                </script>
            </Head>

            {/* Breadcrumb Navigation */}
            <nav className="mb-4 flex items-center gap-2 text-xs text-neutral-500 font-medium">
                <Link href={route('home')} className="hover:text-emerald-700 flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Kembali ke Etalase
                </Link>
                <span>/</span>
                <span className="text-neutral-400">{product.category?.name || 'Katalog'}</span>
                <span>/</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-bold truncate max-w-xs">
                    {product.title}
                </span>
            </nav>

            {/* Product Detail Layout (Semantic HTML) */}
            <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg p-6 sm:p-8 shadow-sm">
                {/* Left Column: Image Gallery */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="aspect-square w-full border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        <img
                            src={product.image_url || '/logo-juleha.jpg'}
                            alt={product.title}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {product.gallery && product.gallery.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.gallery.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Foto detail ${idx + 1}`}
                                    className="h-16 w-16 object-cover rounded border border-neutral-300 cursor-pointer hover:border-emerald-700"
                                />
                            ))}
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-lg space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Jaminan Keaslian & Syar'i DPW Juleha</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-normal">
                            Produk ini telah melalui verifikasi dua tingkat: Admin Ekop daerah dan Super Admin DPW Jatim untuk memastikan spesifikasi sesuai standar sembelihan halal.
                        </p>
                    </div>
                </div>

                {/* Right Column: Title, Specifications & Pricing */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="default" className="text-xs">
                                {product.category?.name || 'Peralatan Juleha'}
                            </Badge>
                            <Badge variant="success" className="text-xs gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Terverifikasi
                            </Badge>
                            <Badge variant="secondary" className="text-xs gap-1">
                                <MapPin className="h-3 w-3 text-emerald-700" />
                                {product.region_name}
                            </Badge>
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white leading-tight">
                            {product.title}
                        </h1>

                        {/* Final Price Block (Strictly Hiding internal margins) */}
                        <div className="p-4 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg border border-neutral-300 dark:border-neutral-700">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                        Harga Final Resmi Anggota
                                    </span>
                                    <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                                        {formatRupiah(product.price)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                                        Stok Tersedia
                                    </span>
                                    <span className="text-sm font-mono font-bold text-emerald-700">
                                        {product.stock} Unit
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Seller Metadata Box */}
                        <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-md flex items-center justify-between text-xs">
                            <div>
                                <span className="text-neutral-500 block text-[11px]">Penjual (Anggota Terdaftar):</span>
                                <strong className="text-neutral-900 dark:text-neutral-100 font-bold">
                                    {product.seller.name}
                                </strong>
                                <span className="text-neutral-500 block text-[10px]">
                                    Wilayah: {product.seller.region_name}
                                </span>
                            </div>
                            <Badge variant="outline" className="font-mono text-[10px]">
                                ID: {product.seller.is_verified ? 'TERVALIDASI' : 'ANGGOTA'}
                            </Badge>
                        </div>

                        {/* Specifications Table (Anti-slop data density) */}
                        <div className="border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden text-xs">
                            <div className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-700 uppercase tracking-wider text-[11px]">
                                Spesifikasi Teknis Pengiriman (Biteship Logistik)
                            </div>
                            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                <div className="grid grid-cols-2 p-2.5">
                                    <span className="text-neutral-500 flex items-center gap-1.5">
                                        <Scale className="h-3.5 w-3.5 text-neutral-400" /> Berat Paket:
                                    </span>
                                    <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
                                        {product.weight_gram} gram
                                    </strong>
                                </div>
                                <div className="grid grid-cols-2 p-2.5">
                                    <span className="text-neutral-500 flex items-center gap-1.5">
                                        <Truck className="h-3.5 w-3.5 text-neutral-400" /> Lokasi Asal Pickup:
                                    </span>
                                    <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
                                        {product.region_name} ({product.seller.lat ?? '-7.4726'}, {product.seller.lng ?? '112.7058'})
                                    </strong>
                                </div>
                                <div className="grid grid-cols-2 p-2.5">
                                    <span className="text-neutral-500 flex items-center gap-1.5">
                                        <CreditCard className="h-3.5 w-3.5 text-neutral-400" /> Metode Pembayaran:
                                    </span>
                                    <strong className="text-neutral-900 dark:text-neutral-100">
                                        DOKU SNAP (QRIS Instan & Virtual Account)
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Product Description */}
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-2">
                                Deskripsi Lengkap Produk
                            </h2>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-2 whitespace-pre-line border-t border-neutral-200 dark:border-neutral-800 pt-3">
                                {product.description}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex flex-col sm:flex-row gap-3">
                        <Link href={route('login')} className="flex-1">
                            <Button size="lg" className="w-full font-bold text-sm bg-emerald-700 hover:bg-emerald-800 gap-2">
                                <CreditCard className="h-4 w-4" />
                                Beli Sekarang via DOKU QRIS/VA
                            </Button>
                        </Link>
                        <a
                            href={`https://wa.me/628123456789?text=Halo%2C%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.title)}%20di%20Marketplace%20Juleha%20Jatim`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold text-sm">
                                Tanya Penjual
                            </Button>
                        </a>
                    </div>
                </div>
            </article>
        </MarketplaceLayout>
    );
}
