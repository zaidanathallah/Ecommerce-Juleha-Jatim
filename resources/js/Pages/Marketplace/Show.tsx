import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { BuyerProduct, PageProps } from '@/types';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/Contexts/CartContext';
import {
    ShieldCheck,
    MapPin,
    Truck,
    CreditCard,
    ArrowLeft,
    CheckCircle2,
    ShoppingBag,
    Star,
    Scale,
    MessageSquare,
    Send,
    User as UserIcon,
    Plus,
    Minus,
} from 'lucide-react';

interface Props {
    product: BuyerProduct;
    schemaJson: any;
}

export default function Show({ product, schemaJson }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const { addToCart } = useCart();

    const [selectedImage, setSelectedImage] = useState<string>(product.image_url || '/logo-juleha.jpg');
    const [quantity, setQuantity] = useState<number>(1);

    const { data, setData, post, processing, reset, errors } = useForm({
        rating: 5,
        comment: '',
    });

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.reviews.store', product.slug), {
            onSuccess: () => reset('comment'),
        });
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    const ratingAvg = product.rating_avg ?? 5.0;
    const reviewsCount = product.reviews_count ?? 0;
    const soldCount = product.sold_count ?? 0;
    const reviewsList = product.reviews ?? [];

    return (
        <MarketplaceLayout>
            <Head>
                <title>{`${product.title} - Marketplace Juleha Jawa Timur`}</title>
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
                    Etalase
                </Link>
                <span>/</span>
                <span className="text-neutral-400">{product.category?.name || 'Katalog'}</span>
                <span>/</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-bold truncate max-w-xs">
                    {product.title}
                </span>
            </nav>

            {/* Main Product Card */}
            <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                {/* Left Column: Image Gallery */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="aspect-square w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        <img
                            src={selectedImage}
                            alt={product.title}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {product.gallery && product.gallery.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <button
                                type="button"
                                onClick={() => setSelectedImage(product.image_url)}
                                className={`h-16 w-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                                    selectedImage === product.image_url ? 'border-emerald-700' : 'border-neutral-200'
                                }`}
                            >
                                <img src={product.image_url} alt="Cover" className="h-full w-full object-cover" />
                            </button>
                            {product.gallery.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedImage(img)}
                                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                                        selectedImage === img ? 'border-emerald-700' : 'border-neutral-200'
                                    }`}
                                >
                                    <img src={img} alt={`Detail ${idx + 1}`} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Jaminan Keaslian & Syar'i Juleha Jawa Timur</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-normal">
                            Produk ini diverifikasi resmi oleh pengurus daerah dan tim audit Juleha Jatim guna menjamin kelayakan syariat dan standar kualitas sembelih halal.
                        </p>
                    </div>
                </div>

                {/* Right Column: Title, Rating, Pricing & Actions */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="default" className="text-xs bg-emerald-700">
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

                        <h1 className="text-xl sm:text-3xl font-black text-neutral-950 dark:text-white leading-tight">
                            {product.title}
                        </h1>

                        {/* Rating & Sold Stats */}
                        <div className="flex items-center gap-3 text-xs bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-black text-neutral-900 dark:text-neutral-100">
                                    {ratingAvg.toFixed(1)}
                                </span>
                            </div>
                            <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                            <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                                {reviewsCount} Penilaian
                            </span>
                            <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                            <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                                {soldCount > 0 ? `${soldCount} Terjual` : 'Produk Baru'}
                            </span>
                        </div>

                        {/* Final Price Block */}
                        <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-baseline justify-between flex-wrap gap-2">
                                <div>
                                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                        Harga Resmi Terverifikasi
                                    </span>
                                    <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400">
                                        {formatRupiah(product.price)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 block">
                                        Stok Siap Kirim
                                    </span>
                                    <span className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400">
                                        {product.stock} Unit
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Seller Metadata Box */}
                        <div className="p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between text-xs bg-neutral-50 dark:bg-neutral-800/40">
                            <div>
                                <span className="text-neutral-500 block text-[11px]">Toko Penjual:</span>
                                <strong className="text-neutral-900 dark:text-neutral-100 font-bold text-sm">
                                    {product.seller.name}
                                </strong>
                                <span className="text-neutral-500 block text-[11px]">
                                    Asal Pengiriman: {product.seller.region_name}
                                </span>
                            </div>
                            <Badge variant="outline" className="font-mono text-[10px] text-emerald-700 border-emerald-300">
                                MITRA TERDAFTAR
                            </Badge>
                        </div>

                        {/* Specifications Table */}
                        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden text-xs">
                            <div className="bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2 font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-700 uppercase tracking-wider text-[11px]">
                                Spesifikasi Pengiriman & Layanan
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
                                        <Truck className="h-3.5 w-3.5 text-neutral-400" /> Logistik Pengiriman:
                                    </span>
                                    <strong className="text-neutral-900 dark:text-neutral-100">
                                        Biteship Otomatis / Kurir Mandiri
                                    </strong>
                                </div>
                                <div className="grid grid-cols-2 p-2.5">
                                    <span className="text-neutral-500 flex items-center gap-1.5">
                                        <CreditCard className="h-3.5 w-3.5 text-neutral-400" /> Metode Pembayaran:
                                    </span>
                                    <strong className="text-neutral-900 dark:text-neutral-100">
                                        DOKU SNAP (QRIS & VA) / Transfer Bank
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Product Description */}
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-2">
                                Deskripsi Lengkap Produk
                            </h2>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line border-t border-neutral-200 dark:border-neutral-800 pt-3">
                                {product.description}
                            </div>
                        </div>
                    </div>

                    {/* Quantity & Action Buttons (Shopee Style) */}
                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 text-xs">
                            <span className="font-bold text-neutral-700 dark:text-neutral-300">Jumlah Beli:</span>
                            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 border border-neutral-300 dark:border-neutral-700">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-1 rounded-lg bg-white dark:bg-neutral-700 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="font-mono font-bold px-3 text-neutral-900 dark:text-white">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="p-1 rounded-lg bg-white dark:bg-neutral-700 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <span className="text-neutral-500 text-[11px]">
                                Tersisa {product.stock} buah
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                type="button"
                                size="lg"
                                variant="outline"
                                onClick={handleAddToCart}
                                className="flex-1 font-bold text-xs gap-2 rounded-2xl border-emerald-700 text-emerald-800 hover:bg-emerald-50 py-6"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                <span>+ Masukkan Keranjang</span>
                            </Button>

                            <Link
                                href={user ? route('checkout.index', product.slug) : route('login')}
                                className="flex-1"
                            >
                                <Button
                                    size="lg"
                                    className="w-full font-extrabold text-xs bg-emerald-700 hover:bg-emerald-800 text-white gap-2 rounded-2xl shadow-md py-6"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    <span>Beli Sekarang</span>
                                </Button>
                            </Link>

                            <a
                                href={`https://wa.me/6281262227663?text=Halo%2C%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.title)}%20di%20Marketplace%20Juleha%20Jatim`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="w-full sm:w-auto font-bold text-xs rounded-2xl py-6"
                                >
                                    Tanya Penjual
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </article>

            {/* Customer Reviews & Rating Section (Shopee Style) */}
            <section className="mt-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
                    <div>
                        <h2 className="text-lg font-black text-neutral-950 dark:text-white flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-emerald-600" />
                            <span>Penilaian & Ulasan Pembeli ({reviewsCount})</span>
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Ulasan nyata dari pembeli dan anggota yang telah membeli produk ini
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-2xl border border-amber-300">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="text-base font-black text-neutral-900 dark:text-neutral-100">
                            {ratingAvg.toFixed(1)}
                        </span>
                        <span className="text-xs text-neutral-500 font-semibold">/ 5.0</span>
                    </div>
                </div>

                {/* Form Tulis Ulasan (Bisa diisi oleh Super Admin, Admin Ekop, Penjual, Pembeli / Siapapun yang login) */}
                <div className="p-5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                    {user ? (
                        <form onSubmit={handleReviewSubmit} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                    Beri Bintang & Tulis Ulasan Anda ({user.name}):
                                </span>
                                {/* Interactive Star Selector */}
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('rating', star)}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={`h-5 w-5 ${
                                                    star <= data.rating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-neutral-300 dark:text-neutral-600'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-amber-600 ml-1">
                                        {data.rating} Bintang
                                    </span>
                                </div>
                            </div>

                            <textarea
                                rows={2}
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                                placeholder="Bagaimana pengalaman Anda menggunakan produk ini? (contoh: bilah sangat tajam, pengiriman cepat, packing aman)"
                                required
                                className="w-full text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-emerald-700"
                            />
                            {errors.comment && <p className="text-xs text-red-600 font-bold">{errors.comment}</p>}

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    size="sm"
                                    className="bg-emerald-700 hover:bg-emerald-800 text-xs font-bold rounded-xl gap-1.5"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    {processing ? 'Menyimpan Ulasan...' : 'Kirim Ulasan'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-3 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between flex-wrap gap-2">
                            <span>Ingin memberikan rating bintang dan ulasan untuk produk ini?</span>
                            <Link href={route('login')}>
                                <Button size="sm" variant="default" className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 rounded-xl">
                                    Masuk untuk Beri Ulasan
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Reviews List */}
                <div className="space-y-3 pt-2">
                    {reviewsList.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400 text-xs">
                            Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan penilaian!
                        </div>
                    ) : (
                        reviewsList.map((rev) => (
                            <div
                                key={rev.id}
                                className="p-4 bg-white dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                                            {rev.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <strong className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                    {rev.user_name}
                                                </strong>
                                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                    Pembeli
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-neutral-400">
                                                {rev.created_at}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Star Rating for this review */}
                                    <div className="flex items-center gap-0.5 text-amber-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`h-3.5 w-3.5 ${
                                                    s <= rev.rating ? 'fill-amber-400' : 'text-neutral-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pl-10">
                                    "{rev.comment}"
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </MarketplaceLayout>
    );
}
