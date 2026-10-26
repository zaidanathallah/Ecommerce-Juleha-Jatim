import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { BuyerProduct, Category } from '@/types';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatRupiah } from '@/lib/utils';
import {
    ShieldCheck,
    MapPin,
    ArrowRight,
    ShoppingBag,
    Search,
    Check,
} from 'lucide-react';

interface Props {
    products: {
        data: BuyerProduct[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: Category[];
    filters: {
        category?: string;
        search?: string;
    };
    schemaJson: any;
}

export default function Index({ products, categories, filters, schemaJson }: Props) {
    const handleCategoryClick = (slug?: string) => {
        router.get(
            route('home'),
            {
                category: slug || undefined,
                search: filters.search || undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <MarketplaceLayout>
            <Head>
                <title>Katalog Peralatan Sembelih Halal Resmi Jawa Timur | jualbeli.julehajatim.com</title>
                <meta
                    name="description"
                    content="Marketplace resmi juru sembelih halal Jawa Timur. Jual beli pisau sembelih, herder, asahan, wearpack, APD, dan peralatan RPH terstandarisasi syar'i."
                />
                <meta property="og:title" content="Marketplace Juleha Jawa Timur - Bilah & Perlengkapan Halal" />
                <meta
                    property="og:description"
                    content="Platform resmi DPW Juleha Jawa Timur untuk pengadaan peralatan sembelih halal berkualitas tinggi dan teruji syar'i."
                />
                <meta property="og:image" content="/logo-juleha.jpg" />
                <script type="application/ld+json">
                    {JSON.stringify(schemaJson)}
                </script>
            </Head>

            {/* Hero / Header Section: Semantic & Anti-Slop (High Contrast, Bold, Instant) */}
            <section className="mb-8 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                            ORGANISASI RESMI JURU SEMBELIH HALAL JAWA TIMUR
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white leading-tight">
                            Pusat Perlengkapan Sembelih Halal Terstandarisasi Syariat
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            Setiap bilah dan peralatan sembelih diverifikasi melalui pengurus wilayah (Admin Ekop) dan Super Admin DPW Jatim untuk menjamin kesempurnaan ihsan dalam sembelihan.
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                        <Link href={route('register')}>
                            <Button size="default" className="w-full text-xs font-bold gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                Gabung Jadi Penjual Anggota
                            </Button>
                        </Link>
                        <div className="text-[10px] text-neutral-500 text-center font-mono">
                            Sinkronisasi Real-Time members.julehajatim.com
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Categories Horizontal Pills */}
            <nav aria-label="Kategori Produk" className="mb-6 flex flex-wrap items-center gap-2">
                <button
                    onClick={() => handleCategoryClick(undefined)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-none border ${
                        !filters.category
                            ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900'
                            : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-neutral-500'
                    }`}
                >
                    Semua Kategori
                </button>
                {categories.map((cat) => {
                    const isSelected = filters.category === cat.slug;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.slug)}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-none border ${
                                isSelected
                                    ? 'bg-emerald-700 text-white border-emerald-700'
                                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-neutral-500'
                            }`}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </nav>

            {/* Products Grid */}
            <section aria-label="Daftar Produk Halal">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                        Produk Terverifikasi ({products.total} Item)
                    </h2>
                    {filters.search && (
                        <span className="text-xs text-neutral-500">
                            Hasil pencarian untuk: <strong>"{filters.search}"</strong>
                        </span>
                    )}
                </div>

                {products.data.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900">
                        <ShoppingBag className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                            Belum Ada Produk Tersedia
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                            Tidak ada produk aktif dalam kategori atau kata kunci ini. Silakan pilih kategori lain atau reset pencarian.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.data.map((product) => (
                            <article
                                key={product.id}
                                className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:border-emerald-700 transition-none shadow-sm"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                    <img
                                        src={product.image_url || '/logo-juleha.jpg'}
                                        alt={product.title}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        <Badge variant="default" className="text-[10px] bg-white/95 text-emerald-800 shadow-sm border border-emerald-700">
                                            LIVE & ACC
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-2 left-2">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white">
                                            <MapPin className="h-3 w-3 text-emerald-400" />
                                            {product.region_name}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Details (Margins strictly hidden!) */}
                                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                                            {product.category?.name || 'Peralatan Juleha'}
                                        </span>
                                        <h3 className="font-bold text-sm text-neutral-950 dark:text-neutral-50 leading-snug line-clamp-2">
                                            <Link href={route('products.show', product.slug)} className="hover:text-emerald-700">
                                                {product.title}
                                            </Link>
                                        </h3>
                                    </div>

                                    {/* Seller Info */}
                                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                                        Penjual:{' '}
                                        <strong className="text-neutral-800 dark:text-neutral-200">
                                            {product.seller.name}
                                        </strong>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-neutral-500 block leading-none font-medium">
                                                Harga Resmi
                                            </span>
                                            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                                                {formatRupiah(product.price)}
                                            </span>
                                        </div>

                                        <Link href={route('products.show', product.slug)}>
                                            <Button size="sm" variant="default" className="text-xs gap-1">
                                                Detail
                                                <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </MarketplaceLayout>
    );
}
