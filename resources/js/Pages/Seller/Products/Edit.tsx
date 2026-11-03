import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Category } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, AlertTriangle, Flame, Scale, Tags } from 'lucide-react';

interface Props {
    product: any;
    categories: Category[];
}

export default function Edit({ product, categories }: Props) {
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        category_id: product.category_id,
        title: product.title,
        description: product.description,
        base_price: String(product.base_price ?? ''),
        stock: String(product.stock ?? '1'),
        weight_gram: String(product.weight_gram ?? '500'),
        length_cm: String(product.length_cm ?? '20'),
        width_cm: String(product.width_cm ?? '10'),
        height_cm: String(product.height_cm ?? '5'),
        image: null as File | null,
        is_flash_sale: Boolean(product.is_flash_sale),
        flash_sale_price: product.flash_sale_price ? String(product.flash_sale_price) : '',
        flash_sale_discount_percent: product.flash_sale_discount_percent ? String(product.flash_sale_discount_percent) : '',
        flash_sale_stock: product.flash_sale_stock ? String(product.flash_sale_stock) : '',
        flash_sale_end: product.flash_sale_end ? product.flash_sale_end.substring(0, 16) : '',
    });

    // Helper untuk input angka: mengizinkan backspace sampai kosong dan menghapus angka 0 di depan (misal 02222 -> 2222)
    const handleNumberChange = (field: any, rawVal: string) => {
        if (rawVal === '') {
            setData(field, '');
            return;
        }
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

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        setIsCreatingCategory(true);
        router.post(
            route('seller.categories.store'),
            { name: newCategoryName.trim() },
            {
                onSuccess: () => {
                    setNewCategoryName('');
                    setShowAddCategory(false);
                    setIsCreatingCategory(false);
                },
                onError: () => setIsCreatingCategory(false),
            }
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('seller.products.update', product.id));
    };

    return (
        <MarketplaceLayout>
            <Head title={`Edit Produk: ${product.title}`} />

            <div className="max-w-2xl mx-auto space-y-4">
                <nav className="flex items-center gap-2 text-xs text-neutral-500">
                    <Link href={route('seller.products.index')} className="hover:text-[#ee4d2d] flex items-center gap-1 font-semibold">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Daftar Produk
                    </Link>
                </nav>

                <Card>
                    <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b">
                        <CardTitle className="text-xl font-black">Edit Produk</CardTitle>
                        <CardDescription>
                            Perbarui informasi produk jualan Anda.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        {product.status === 'live' && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-800 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block font-bold">Perhatian Regulasi:</strong>
                                    Produk ini saat ini berstatus <strong>LIVE</strong>. Jika Anda mengubah <strong>Harga Dasar</strong> atau mengunggah <strong>Foto Baru</strong>, status produk akan secara otomatis kembali ke <strong>PENDING</strong> untuk diverifikasi ulang oleh Admin Ekop & Super Admin.
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                        Kategori Produk
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddCategory(!showAddCategory)}
                                        className="text-[11px] font-bold text-[#ee4d2d] hover:underline flex items-center gap-1"
                                    >
                                        <Tags className="h-3.5 w-3.5" />
                                        <span>{showAddCategory ? 'Batal' : '+ Tambah Kategori Baru'}</span>
                                    </button>
                                </div>

                                {showAddCategory && (
                                    <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg space-y-2 mb-2">
                                        <span className="text-[11px] font-bold text-orange-900 dark:text-orange-200">
                                            Buat Kategori Produk Baru:
                                        </span>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                placeholder="Contoh: Daging Segar, Bumbu Halal, Ternak Qurban..."
                                                className="flex-1 text-xs rounded border-neutral-300 dark:border-neutral-700 focus:ring-orange-500"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddCategory}
                                                disabled={isCreatingCategory || !newCategoryName.trim()}
                                                className="bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold"
                                            >
                                                {isCreatingCategory ? 'Menyimpan...' : 'Simpan Kategori'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', Number(e.target.value))}
                                    required
                                    className="w-full text-xs rounded border-neutral-300 focus:ring-orange-500"
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
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                    className="w-full text-xs rounded border-neutral-300 focus:ring-orange-500 font-medium"
                                />
                                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Harga Dasar (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="1000"
                                        step="1000"
                                        placeholder="750000"
                                        value={data.base_price}
                                        onChange={(e) => handleNumberChange('base_price', e.target.value)}
                                        required
                                        className="w-full text-xs font-mono font-bold rounded border-neutral-300 focus:ring-orange-500"
                                    />
                                    {errors.base_price && <p className="text-xs text-red-600 mt-1">{errors.base_price}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Stok Unit
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
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

                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Ganti Foto Produk (Kosongkan jika tidak ingin mengganti)
                                </label>
                                {product.image_url && (
                                    <img
                                        src={product.image_url}
                                        alt={product.title}
                                        className="h-16 w-16 object-cover rounded border mb-2"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                    className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                                />
                                {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Deskripsi Produk
                                </label>
                                <textarea
                                    rows={5}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    required
                                    className="w-full text-xs rounded border-neutral-300 focus:ring-orange-500"
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
                                    {processing ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MarketplaceLayout>
    );
}
