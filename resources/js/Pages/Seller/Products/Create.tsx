import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Category } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, ShieldCheck, Scale, Tags, Flame, Zap } from 'lucide-react';
import CategoryManageModal from '@/Components/CategoryManageModal';

interface Props {
    categories: Category[];
}

export default function Create({ categories }: Props) {
    const [showCategoryModal, setShowCategoryModal] = React.useState(false);

    const { data, setData, post, processing, errors } = useForm({
        category_id: categories[0]?.id || '',
        title: '',
        description: '',
        base_price: '',
        stock: '1',
        weight_gram: '500',
        length_cm: '20',
        width_cm: '10',
        height_cm: '5',
        image: null as File | null,
        is_flash_sale: false,
        flash_sale_price: '',
        flash_sale_discount_percent: '',
        flash_sale_stock: '',
        flash_sale_end: '',
    });

    // Helper untuk input angka: mengizinkan backspace sampai kosong dan menghapus angka 0 di depan (misal 02222 -> 2222)
    const handleNumberChange = (field: any, rawVal: string) => {
        if (rawVal === '') {
            setData(field, '');
            return;
        }
        // Hapus angka 0 di depan jika diikuti angka lain (misal 02222 -> 2222, 021 -> 21)
        const cleaned = rawVal.replace(/^0+(?=\d)/, '');
        setData(field, cleaned);
    };

    // Auto-kalkulasi persentase diskon saat harga flash sale diubah
    const handleFlashPriceChange = (val: string) => {
        handleNumberChange('flash_sale_price', val);
        const base = parseFloat(data.base_price);
        const flash = parseFloat(val);
        if (base > 0 && flash > 0 && flash < base) {
            const disc = Math.round(((base - flash) / base) * 100);
            setData((prev) => ({
                ...prev,
                flash_sale_price: val.replace(/^0+(?=\d)/, ''),
                flash_sale_discount_percent: String(disc),
            }));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('seller.products.store'));
    };

    return (
        <MarketplaceLayout>
            <Head title="Upload Produk Baru - Juleha Jatim" />

            <CategoryManageModal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                categories={categories}
            />

            <div className="max-w-2xl mx-auto space-y-4">
                <nav className="flex items-center gap-2 text-xs text-neutral-500">
                    <Link href={route('seller.products.index')} className="hover:text-[#ee4d2d] flex items-center gap-1 font-semibold">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Produk Saya
                    </Link>
                </nav>

                <Card>
                    <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-5 w-5 text-[#ee4d2d]" />
                            <Badge variant="default" className="text-[10px]">
                                ALUR APPROVAL BERJENJANG
                            </Badge>
                        </div>
                        <CardTitle className="text-xl font-black">Tambah Produk Penjualan</CardTitle>
                        <CardDescription>
                            Anda dapat menjual peralatan sembelih, bilah, APD, hewan ternak qurban, daging, maupun bumbu halal. Produk akan ditinjau oleh Admin Ekop wilayah Anda sebelum tampil live.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                        Kategori Produk
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryModal(true)}
                                        className="text-[11px] font-bold text-[#ee4d2d] hover:underline flex items-center gap-1"
                                    >
                                        <Tags className="h-3.5 w-3.5" />
                                        <span>+ Kelola / Tambah Kategori & Ikon</span>
                                    </button>
                                </div>

                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    required
                                    className="w-full text-xs rounded border-neutral-300 dark:border-neutral-700 focus:ring-orange-500"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-xs text-red-600 mt-1">{errors.category_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Nama / Judul Produk
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Pisau Sembelih Herder Solingen 30cm Cap Garpu Original"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                    className="w-full text-xs rounded border-neutral-300 focus:ring-orange-500 font-medium"
                                />
                                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            {/* Harga Dasar Penjual & Stok */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700">
                                    <label className="block text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                                        Harga Dasar Penjual (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="1000"
                                        step="1000"
                                        placeholder="750000"
                                        value={data.base_price}
                                        onChange={(e) => handleNumberChange('base_price', e.target.value)}
                                        required
                                        className="w-full text-sm font-mono font-bold rounded border-neutral-300 focus:ring-orange-500"
                                    />
                                    <span className="text-[10px] text-neutral-500 mt-1 block">
                                        Nominal bersih yang Anda terima per unit terjual.
                                    </span>
                                    {errors.base_price && <p className="text-xs text-red-600 mt-1">{errors.base_price}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Jumlah Stok Unit
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={data.stock}
                                        onChange={(e) => handleNumberChange('stock', e.target.value)}
                                        required
                                        className="w-full text-xs font-mono rounded border-neutral-300 focus:ring-orange-500"
                                    />
                                    {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
                                </div>
                            </div>

                            {/* PENGATURAN PROMO FLASH SALE (CRUD FLASH SALE) */}
                            <div className="p-4 bg-orange-50/70 dark:bg-neutral-800/80 border border-orange-200 dark:border-neutral-700 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Flame className="h-4 w-4 text-[#ee4d2d] fill-[#ee4d2d]" />
                                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                            Pengaturan Promo Flash Sale
                                        </span>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700 dark:text-neutral-200">
                                        <input
                                            type="checkbox"
                                            checked={data.is_flash_sale}
                                            onChange={(e) => setData('is_flash_sale', e.target.checked)}
                                            className="h-4 w-4 text-[#ee4d2d] focus:ring-[#ee4d2d] rounded"
                                        />
                                        <span>Aktifkan Flash Sale</span>
                                    </label>
                                </div>

                                {data.is_flash_sale && (
                                    <div className="pt-2 border-t border-orange-200 dark:border-neutral-700 space-y-3 animate-in fade-in duration-200">
                                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                            Produk ini akan tampil di bagian <strong>FLASH SALE</strong> halaman utama marketplace secara realtime dengan tag kepemilikan toko Anda.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                                    Harga Flash Sale (Rp)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1000"
                                                    step="1000"
                                                    placeholder="Contoh: 650000"
                                                    value={data.flash_sale_price}
                                                    onChange={(e) => handleFlashPriceChange(e.target.value)}
                                                    required={data.is_flash_sale}
                                                    className="w-full text-xs font-mono font-bold rounded border-neutral-300"
                                                />
                                                {errors.flash_sale_price && (
                                                    <p className="text-xs text-red-600 mt-1">{errors.flash_sale_price}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                                    Diskon Promo (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="99"
                                                    placeholder="15"
                                                    value={data.flash_sale_discount_percent}
                                                    onChange={(e) => handleNumberChange('flash_sale_discount_percent', e.target.value)}
                                                    className="w-full text-xs font-mono rounded border-neutral-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                                    Kuota Stok Promo
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="10"
                                                    value={data.flash_sale_stock}
                                                    onChange={(e) => handleNumberChange('flash_sale_stock', e.target.value)}
                                                    className="w-full text-xs font-mono rounded border-neutral-300"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                                Batas Waktu Berakhir Promo (Opsional)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={data.flash_sale_end}
                                                onChange={(e) => setData('flash_sale_end', e.target.value)}
                                                className="w-full text-xs rounded border-neutral-300"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Spesifikasi Biteship Kurir */}
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                    <Scale className="h-4 w-4 text-[#ee4d2d]" />
                                    <span>Spesifikasi Dimensi Paket Pengiriman (Kurir Logistik)</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">Berat (gram)</label>
                                        <input
                                            type="number"
                                            min="50"
                                            placeholder="500"
                                            value={data.weight_gram}
                                            onChange={(e) => handleNumberChange('weight_gram', e.target.value)}
                                            required
                                            className="w-full text-xs font-mono rounded border-neutral-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">Panjang (cm)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="20"
                                            value={data.length_cm}
                                            onChange={(e) => handleNumberChange('length_cm', e.target.value)}
                                            className="w-full text-xs font-mono rounded border-neutral-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">Lebar (cm)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="10"
                                            value={data.width_cm}
                                            onChange={(e) => handleNumberChange('width_cm', e.target.value)}
                                            className="w-full text-xs font-mono rounded border-neutral-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">Tinggi (cm)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="5"
                                            value={data.height_cm}
                                            onChange={(e) => handleNumberChange('height_cm', e.target.value)}
                                            className="w-full text-xs font-mono rounded border-neutral-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Foto Produk */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Foto Utama Produk (Jelas & Resolusi Baik)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                    required
                                    className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#ee4d2d] hover:file:bg-orange-100"
                                />
                                {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}
                            </div>

                            {/* Deskripsi Produk */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Deskripsi Spesifikasi Teknis & Ketajaman Syar'i
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="Jelaskan bahan bilah, panjang bilah, handle gagang, sarung/kualiti asahan, dan kesesuaian untuk sembelih hewan..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    required
                                    className="w-full text-xs rounded border-neutral-300 focus:ring-orange-500 leading-relaxed"
                                />
                                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={processing}
                                    className="w-full py-3 text-sm font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl shadow-sm"
                                >
                                    {processing ? 'Menyimpan & Mengirim ke Admin...' : 'Simpan & Ajukan ke Admin Ekop'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MarketplaceLayout>
    );
}
