import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Category } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Upload, ShieldCheck, Scale, Package, Tags } from 'lucide-react';
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
        stock: 1,
        weight_gram: 500,
        length_cm: 20,
        width_cm: 10,
        height_cm: 5,
        image: null as File | null,
    });

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
                                        onChange={(e) => setData('base_price', e.target.value)}
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
                                        value={data.stock}
                                        onChange={(e) => setData('stock', Number(e.target.value))}
                                        required
                                        className="w-full text-xs font-mono rounded border-neutral-300 focus:ring-orange-500"
                                    />
                                    {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
                                </div>
                            </div>

                            {/* Spesifikasi Biteship Kurir */}
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                    <Scale className="h-4 w-4 text-[#ee4d2d]" />
                                    <span>Spesifikasi Paket untuk Biteship Logistik</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-neutral-600">Berat (gram)</label>
                                        <input
                                            type="number"
                                            min="50"
                                            value={data.weight_gram}
                                            onChange={(e) => setData('weight_gram', Number(e.target.value))}
                                            required
                                            className="w-full text-xs font-mono rounded border-neutral-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-neutral-600">Panjang (cm)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.length_cm}
                                            onChange={(e) => setData('length_cm', Number(e.target.value))}
                                            className="w-full text-xs font-mono rounded border-neutral-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-neutral-600">Lebar (cm)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.width_cm}
                                            onChange={(e) => setData('width_cm', Number(e.target.value))}
                                            className="w-full text-xs font-mono rounded border-neutral-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-neutral-600">Tinggi (cm)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.height_cm}
                                            onChange={(e) => setData('height_cm', Number(e.target.value))}
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
