import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { BuyerProduct, Category, Voucher } from '@/types';
import CategoryIcon from '@/Components/CategoryIcon';
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
    Flame,
    Ticket,
    Clock,
    Zap,
    Percent,
    Gift,
    BookOpen,
    Copy,
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
    flashSaleProducts?: BuyerProduct[];
    vouchers?: Voucher[];
    categories: Category[];
    filters: {
        category?: string;
        search?: string;
    };
    schemaJson: any;
}

export default function Index({ products, flashSaleProducts = [], vouchers = [], categories, filters, schemaJson }: Props) {
    const { auth } = usePage<any>().props;
    const { addToCart, buyNow } = useCart();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Flash sale countdown timer (simulating 2 hours 40 mins)
    const [timeLeft, setTimeLeft] = useState({
        hours: 2,
        minutes: 40,
        seconds: 30,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return { hours: 2, minutes: 59, seconds: 59 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

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

            <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4 font-sans">
                {/* 1. Hero / Main Banner (Shopee + Halal Premium Theme) */}
                <section className="bg-gradient-to-r from-[#ee4d2d] via-orange-600 to-amber-600 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wider uppercase backdrop-blur-sm border border-white/30">
                                <ShieldCheck className="h-4 w-4" />
                                <span>MARKETPLACE RESMI JURU SEMBELIH HALAL JAWA TIMUR</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                                Pusat Perlengkapan & Kebutuhan Halal Terstandarisasi Syariat
                            </h1>
                            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl">
                                Belanja pisau sembelih herder solingen, golok jagal, batu asah, wearpack APD, daging segar, serta hewan qurban. Terverifikasi resmi pengurus Juleha Jawa Timur.
                            </p>
                        </div>

                        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
                            <Link href={route('register')}>
                                <Button size="lg" className="w-full bg-white text-[#ee4d2d] hover:bg-neutral-100 font-black text-xs gap-2 rounded-2xl shadow-lg py-6 px-6">
                                    <ShoppingBag className="h-4 w-4 text-[#ee4d2d]" />
                                    <span>Buka Toko Penjual Anggota</span>
                                </Button>
                            </Link>
                            <Link
                                href={route('prayer.schedule')}
                                className="inline-flex items-center justify-center gap-1.5 text-xs text-white/90 hover:text-white font-bold py-1.5"
                            >
                                <Clock className="h-3.5 w-3.5" />
                                <span>Cek Jadwal Waktu Sholat Realtime &gt;</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 2. Shopee Features Strip (Icon Badges) */}
                <section className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#ee4d2d] flex items-center justify-center">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Juleha Pilihan</span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#ee4d2d] flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">100% Syar'i Halal</span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
                            <Flame className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Flash Sale</span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                            <Ticket className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Gratis Ongkir</span>
                    </div>

                    <Link href={route('quran.index')} className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 flex items-center justify-center">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Al-Qur'an 30 Juz</span>
                    </Link>

                    <Link href={route('prayer.schedule')} className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Waktu Sholat</span>
                    </Link>
                </section>

                {/* 3. VOUCHERS STRIP (Shopee-style Coupons) */}
                {vouchers.length > 0 && (
                    <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:bg-neutral-900/60 p-5 rounded-3xl border border-amber-200 dark:border-neutral-800 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-[#ee4d2d]" />
                                <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                                    Voucher Belanja & Gratis Ongkir
                                </h2>
                            </div>
                            <span className="text-[11px] text-neutral-500">Klik "Klaim" untuk salin kode voucher</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {vouchers.map((voucher) => (
                                <div
                                    key={voucher.id}
                                    className="relative flex items-center justify-between p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-orange-200 dark:border-neutral-800 shadow-sm"
                                >
                                    <div className="space-y-0.5 min-w-0 pr-2">
                                        <div className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-[#ee4d2d]">
                                            {voucher.type === 'free_shipping' ? 'GRATIS ONGKIR' : 'DISKON SPESIAL'}
                                        </div>
                                        <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                            {voucher.title}
                                        </div>
                                        <div className="text-[10px] text-neutral-500 font-mono">
                                            Min. Belanja: {formatRupiah(voucher.min_spend)}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => handleCopyCode(voucher.code)}
                                        className="h-8 px-3 rounded-xl bg-[#ee4d2d] hover:bg-orange-700 text-white font-bold text-xs shrink-0 shadow-sm"
                                    >
                                        {copiedCode === voucher.code ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 mr-1" />
                                                <span>Tersalin</span>
                                            </>
                                        ) : (
                                            <span>Klaim</span>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. SHOPEE KATEGORI SECTION (Grid of Tiles with Real Icons) */}
                <section className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                                KATEGORI PILIHAN
                            </h2>
                        </div>
                        {filters.category && (
                            <button
                                type="button"
                                onClick={() => handleCategoryClick()}
                                className="text-xs font-bold text-[#ee4d2d] hover:underline"
                            >
                                Tampilkan Semua Kategori &gt;
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3">
                        {categories.map((cat) => {
                            const isSelected = filters.category === cat.slug;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    className={`flex flex-col items-center text-center p-2.5 rounded-2xl border transition-all group ${
                                        isSelected
                                            ? 'border-[#ee4d2d] bg-orange-50/60 dark:bg-orange-950/40 ring-2 ring-orange-500/20 scale-105'
                                            : 'border-neutral-200 dark:border-neutral-800 hover:border-orange-400 bg-neutral-50/50 dark:bg-neutral-800/40'
                                    }`}
                                >
                                    <CategoryIcon slug={cat.slug} className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-tight">
                                        {cat.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 5. ⚡ FLASH SALE SECTION (Shopee-Style with Countdown & Progress) */}
                {flashSaleProducts.length > 0 && (
                    <section className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-xl font-black text-[#ee4d2d] tracking-tight">
                                    <Flame className="h-6 w-6 fill-[#ee4d2d] animate-bounce-short" />
                                    <span>FLASH SALE</span>
                                </div>

                                {/* Running Countdown Boxes */}
                                <div className="flex items-center gap-1 text-white font-mono font-black text-xs">
                                    <span className="bg-neutral-900 px-2 py-1 rounded-lg">
                                        {String(timeLeft.hours).padStart(2, '0')}
                                    </span>
                                    <span className="text-neutral-800 font-bold">:</span>
                                    <span className="bg-neutral-900 px-2 py-1 rounded-lg">
                                        {String(timeLeft.minutes).padStart(2, '0')}
                                    </span>
                                    <span className="text-neutral-800 font-bold">:</span>
                                    <span className="bg-neutral-900 px-2 py-1 rounded-lg">
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>

                            <span className="text-xs font-bold text-[#ee4d2d] hover:underline cursor-pointer">
                                Lihat Semua Promo &gt;
                            </span>
                        </div>

                        {/* Flash Sale Product Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {flashSaleProducts.map((product) => {
                                const salePrice = product.flash_sale_price || product.price;
                                const originalPrice = product.price;
                                const discountPercent = product.flash_sale_discount_percent || 20;

                                return (
                                    <div
                                        key={product.id}
                                        className="group relative bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                <img
                                                    src={product.image_url}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {/* Discount Tag */}
                                                <div className="absolute top-0 right-0 bg-[#ee4d2d] text-white text-[11px] font-black px-2 py-1 rounded-bl-xl shadow-sm">
                                                    -{discountPercent}%
                                                </div>
                                            </div>

                                            <div className="p-3.5 space-y-2">
                                                <Link href={route('products.show', product.slug)}>
                                                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 hover:text-[#ee4d2d] transition leading-snug">
                                                        {product.title}
                                                    </h3>
                                                </Link>

                                                <div className="space-y-0.5">
                                                    <div className="text-base font-black text-[#ee4d2d]">
                                                        {formatRupiah(salePrice)}
                                                    </div>
                                                    {salePrice < originalPrice && (
                                                        <div className="text-[11px] text-neutral-400 line-through">
                                                            {formatRupiah(originalPrice)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Flame Progress Bar */}
                                                <div className="space-y-1">
                                                    <div className="h-3.5 w-full bg-orange-100 dark:bg-orange-950/60 rounded-full overflow-hidden relative flex items-center justify-center">
                                                        <div
                                                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                                                            style={{ width: '75%' }}
                                                        />
                                                        <span className="relative z-10 text-[9px] font-black uppercase text-white tracking-wider flex items-center gap-1 drop-shadow-sm">
                                                            <Flame className="h-2.5 w-2.5" /> STOK TERBATAS
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3.5 pt-0 flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => addToCart(product, 1, auth.user)}
                                                className="flex-1 text-xs font-bold rounded-xl border-[#ee4d2d] text-[#ee4d2d] hover:bg-orange-50 gap-1"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                <span>Keranjang</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => buyNow(product, 1, auth.user)}
                                                className="flex-1 text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl shadow-sm"
                                            >
                                                Beli
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 6. KATALOG PRODUK REGULER (Shopee-Style Products Grid) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                                {filters.category
                                    ? `Kategori: ${categories.find((c) => c.slug === filters.category)?.name || filters.category}`
                                    : 'SEMUA PRODUK TERVERIFIKASI'}
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Daging, pisau, perlengkapan sembelih teruji syar'i siap dikirim via Biteship
                            </p>
                        </div>
                    </div>

                    {products.data.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 text-center space-y-3">
                            <ShoppingBag className="h-10 w-10 text-neutral-400 mx-auto" />
                            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                                Belum ada produk pada kategori ini
                            </h3>
                            <p className="text-xs text-neutral-500">
                                Silakan pilih kategori lain atau gunakan pencarian untuk menemukan perlengkapan yang Anda butuhkan.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                            {products.data.map((product) => (
                                <div
                                    key={product.id}
                                    className="group bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between hover:border-orange-300"
                                >
                                    <div>
                                        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {/* Location Tag */}
                                            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-orange-400" />
                                                <span>{product.region_name}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-2">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                                {product.category?.name || 'Halal Equipment'}
                                            </div>

                                            <Link href={route('products.show', product.slug)}>
                                                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 hover:text-[#ee4d2d] transition leading-snug">
                                                    {product.title}
                                                </h3>
                                            </Link>

                                            {/* Price */}
                                            <div className="text-base sm:text-lg font-black text-[#ee4d2d]">
                                                {formatRupiah(product.price)}
                                            </div>

                                            {/* Star Rating & Sold Count */}
                                            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    <span>{product.rating_avg || 5.0}</span>
                                                </div>
                                                <span>&bull;</span>
                                                <span>{product.sold_count || 12} Terjual</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="p-4 pt-0 flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => addToCart(product, 1, auth.user)}
                                            className="flex-1 text-xs font-bold rounded-2xl border-orange-200 text-[#ee4d2d] hover:bg-orange-50 gap-1"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>Keranjang</span>
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={() => buyNow(product, 1, auth.user)}
                                            className="flex-1 text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-2xl shadow-sm"
                                        >
                                            Beli
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </MarketplaceLayout>
    );
}
