import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Category, ManagementProduct } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface Props {
    product: any;
    categories: Category[];
}

export default function Edit({ product, categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        category_id: product.category_id,
        title: product.title,
        description: product.description,
        base_price: product.base_price,
        stock: product.stock,
        weight_gram: product.weight_gram,
        image: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('seller.products.update', product.id));
    };

    return (
        <MarketplaceLayout>
            <Head title={`Edit Produk: ${product.title}`} />

            <div className="max-w-2xl mx-auto space-y-4">
                <nav className="flex items-center gap-2 text-xs text-neutral-500">
                    <Link href={route('seller.products.index')} className="hover:text-emerald-700 flex items-center gap-1 font-semibold">
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
                                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                    Kategori Produk
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', Number(e.target.value))}
                                    required
                                    className="w-full text-xs rounded border-neutral-300 focus:ring-emerald-700"
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
                                    className="w-full text-xs rounded border-neutral-300 focus:ring-emerald-700 font-medium"
                                />
                                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Harga Dasar (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="1000"
                                        step="1000"
                                        value={data.base_price}
                                        onChange={(e) => setData('base_price', e.target.value)}
                                        required
                                        className="w-full text-xs font-mono font-bold rounded border-neutral-300 focus:ring-emerald-700"
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
                                        value={data.stock}
                                        onChange={(e) => setData('stock', Number(e.target.value))}
                                        required
                                        className="w-full text-xs font-mono rounded border-neutral-300 focus:ring-emerald-700"
                                    />
                                    {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Berat (gram)
                                    </label>
                                    <input
                                        type="number"
                                        min="50"
                                        value={data.weight_gram}
                                        onChange={(e) => setData('weight_gram', Number(e.target.value))}
                                        required
                                        className="w-full text-xs font-mono rounded border-neutral-300 focus:ring-emerald-700"
                                    />
                                    {errors.weight_gram && <p className="text-xs text-red-600 mt-1">{errors.weight_gram}</p>}
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
                                    className="w-full text-xs rounded border-neutral-300 focus:ring-emerald-700"
                                />
                                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={processing}
                                    className="w-full py-2.5 text-sm font-bold bg-emerald-700 hover:bg-emerald-800"
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
