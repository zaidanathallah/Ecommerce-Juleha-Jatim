import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { BuyerProduct, Category } from '@/types';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/Contexts/CartContext';
import {
    ShieldCheck,
    MapPin,
    ArrowRight,
    ShoppingBag,
    Search,
    Star,
    CheckCircle2,
    Plus,
    Sparkles,
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
    const { addToCart } = useCart();

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
                <title>Marketplace Juru Sembelih Halal Jawa Timur | jualbeli.julehajatim.com</title>
                <meta
                    name="description"
                    content="Marketplace resmi juru sembelih halal Jawa Timur. Jual beli pisau sembelih, herder, asahan, wearpack, APD, daging segar halal, hewan ternak, dan perlengkapan sembelih terstandarisasi syariat."
                />
                <meta property="og:title" content="Marketplace Juleha Jawa Timur - Bilah & Perlengkapan Halal" />
                <meta
                    property="og:description"
                    content="Platform resmi Juru Sembelih Halal (Juleha) Jawa Timur untuk pengadaan peralatan dan produk halal berkualitas tinggi dan teruji syar'i."
                />
                <meta property="og:image" content="/logo-juleha.jpg" />
                <script type="application/ld+json">
                    {JSON.stringify(schemaJson)}
                </script>
            </Head>

            {/* Hero / Banner: BuildWithAngga Modern & Friendly Style */}
            <section className="mb-8 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                            <ShieldCheck className="h-4 w-4 text-emerald-300" />
                            <span>JURU SEMBELIH HALAL (JULEHA) JAWA TIMUR</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                            Pusat Perlengkapan & Kebutuhan Halal Terstandarisasi Syariat
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                            Belanja bilah sembelih teruji, asahan pisau impor, APD, hewan ternak qurban, serta daging segar halal. Diverifikasi resmi oleh pengurus wilayah dan tim mutu Juleha Jawa Timur.
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
                        <Link href={route('register')}>
                            <Button size="lg" className="w-full bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs gap-2 rounded-2xl shadow-md py-6 px-6">
                                <ShoppingBag className="h-4 w-4 text-emerald-700" />
                                <span>Buka Toko / Jual Produk</span>
                            </Button>
                        </Link>
                        <a
                            href="https://julehajatim.com"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-200 hover:text-white font-semibold py-2"
                        >
                            <span>Kunjungi Website Resmi Juleha Jatim</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Filter Categories Horizontal Carousel / Pills (BuildWithAngga Style) */}
            <div className="mb-8 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <span>Kategori Pilihan</span>
                    </h2>
                    {filters.category && (
                        <button
                            onClick={() => handleCategoryClick(undefined)}
                            className="text-xs font-bold text-emerald-700 hover:underline"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                        onClick={() => handleCategoryClick(undefined)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-none shrink-0 border ${
                            !filters.category
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                                : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-emerald-600'
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
                                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-none shrink-0 border ${
                                    isSelected
                                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                                        : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-emerald-600'
                                }`}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Products Grid: Shopee / BuildWithAngga Modern E-Commerce Cards */}
            <section aria-label="Daftar Produk Halal">
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h2 className="text-base font-black tracking-tight text-neutral-950 dark:text-white">
                            Etalase Produk ({products.total})
                        </h2>
                        <p className="text-xs text-neutral-500 font-medium">
                            Koleksi peralatan sembelih halal dan kebutuhan resmi terlengkap
                        </p>
                    </div>

                    {filters.search && (
                        <span className="text-xs text-neutral-600 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full font-medium">
                            Pencarian: <strong>"{filters.search}"</strong>
                        </span>
                    )}
                </div>

                {products.data.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900">
                        <ShoppingBag className="mx-auto h-14 w-14 text-neutral-300 mb-3" />
                        <h3 className="text-base font-black text-neutral-800 dark:text-neutral-200">
                            Belum Ada Produk Ditemukan
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                            Tidak ada produk aktif dalam kategori atau kata kunci ini. Silakan pilih kategori lain atau reset pencarian.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategoryClick(undefined)}
                            className="mt-4 rounded-full text-xs font-bold"
                        >
                            Lihat Semua Produk
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {products.data.map((product) => {
                            const rating = product.rating_avg ?? 5.0;
                            const reviewsCount = product.reviews_count ?? 0;
                            const soldCount = product.sold_count ?? 0;

                            return (
                                <article
                                    key={product.id}
                                    className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-emerald-600 transition-all duration-200"
                                >
                                    {/* Image Container with Badges */}
                                    <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                        <Link href={route('products.show', product.slug)}>
                                            <img
                                                src={product.image_url || '/logo-juleha.jpg'}
                                                alt={product.title}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </Link>

                                        {/* Status badge */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-700 text-white shadow-sm">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Lolos Standar Syar'i
                                            </span>
                                        </div>

                                        {/* Location tag */}
                                        <div className="absolute bottom-3 left-3">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white">
                                                <MapPin className="h-3 w-3 text-emerald-400" />
                                                {product.region_name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Details */}
                                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                                                {product.category?.name || 'Peralatan Juleha'}
                                            </span>
                                            <h3 className="font-extrabold text-sm text-neutral-950 dark:text-neutral-50 leading-snug line-clamp-2 hover:text-emerald-700">
                                                <Link href={route('products.show', product.slug)}>
                                                    {product.title}
                                                </Link>
                                            </h3>
                                        </div>

                                        {/* Rating & Sold Counter (Shopee Style) */}
                                        <div className="flex items-center gap-3 text-xs pt-1">
                                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                <span className="text-neutral-900 dark:text-neutral-100 font-extrabold">
                                                    {rating.toFixed(1)}
                                                </span>
                                                <span className="text-[11px] text-neutral-400">
                                                    ({reviewsCount})
                                                </span>
                                            </div>
                                            <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                                            <span className="text-[11px] font-semibold text-neutral-500">
                                                {soldCount > 0 ? `${soldCount} Terjual` : 'Produk Baru'}
                                            </span>
                                        </div>

                                        {/* Seller Store Name */}
                                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                            Toko:{' '}
                                            <strong className="text-neutral-800 dark:text-neutral-200">
                                                {product.seller.name}
                                            </strong>
                                        </div>

                                        {/* Price & Action Buttons */}
                                        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] text-neutral-400 block font-semibold leading-none">
                                                    Harga
                                                </span>
                                                <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                                                    {formatRupiah(product.price)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(product)}
                                                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-700 hover:text-white transition-none"
                                                    title="Tambah ke Keranjang"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                                <Link href={route('products.show', product.slug)}>
                                                    <Button size="sm" variant="default" className="text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 gap-1 px-3">
                                                        Detail
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </MarketplaceLayout>
    );
}
