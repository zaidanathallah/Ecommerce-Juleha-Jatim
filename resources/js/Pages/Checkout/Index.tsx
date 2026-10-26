import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { BuyerProduct } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { formatRupiah } from '@/lib/utils';
import axios from 'axios';
import {
    MapPin,
    Truck,
    CreditCard,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    Building2,
    AlertCircle,
    Package,
} from 'lucide-react';

interface Props {
    product: BuyerProduct;
    seller: {
        id: number;
        name: string;
        region_name: string;
        lat: number;
        lng: number;
        is_pg_active: boolean;
        is_shipping_api_active: boolean;
        seller_bank_details?: string | null;
    };
    buyer: {
        id: number;
        name: string;
        phone: string;
        address: string;
        lat: number;
        lng: number;
    };
}

export default function CheckoutIndex({ product, seller, buyer }: Props) {
    const [courierOptions, setCourierOptions] = useState<any[]>([]);
    const [isLoadingRates, setIsLoadingRates] = useState(false);
    const [ratesError, setRatesError] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        recipient_name: buyer.name || '',
        recipient_phone: buyer.phone || '',
        shipping_address: buyer.address || '',
        destination_lat: buyer.lat ? String(buyer.lat) : '-7.2575',
        destination_lng: buyer.lng ? String(buyer.lng) : '112.7521',
        courier_company: seller.is_shipping_api_active ? '' : 'Kurir Mandiri Penjual',
        courier_service: seller.is_shipping_api_active ? '' : 'COD / Pengiriman Langsung',
        shipping_cost: 0,
        notes: '',
    });

    // Auto-fetch shipping rates if seller uses Biteship API
    const fetchShippingRates = async (lat: string, lng: string) => {
        if (!seller.is_shipping_api_active) return;

        setIsLoadingRates(true);
        setRatesError(null);

        try {
            const res = await axios.post(route('checkout.calculate-shipping'), {
                product_id: product.id,
                destination_lat: Number(lat),
                destination_lng: Number(lng),
            });

            if (res.data.success && Array.isArray(res.data.pricing)) {
                setCourierOptions(res.data.pricing);
                if (res.data.pricing.length > 0) {
                    const firstOption = res.data.pricing[0];
                    setData((prev) => ({
                        ...prev,
                        courier_company: firstOption.courier_name,
                        courier_service: firstOption.courier_service_name,
                        shipping_cost: firstOption.price,
                    }));
                }
            } else {
                setRatesError('Tidak dapat menemukan rute kurir untuk lokasi ini.');
            }
        } catch (err: any) {
            setRatesError(err.response?.data?.message || 'Gagal memuat ongkos kirim Biteship.');
        } finally {
            setIsLoadingRates(false);
        }
    };

    useEffect(() => {
        if (seller.is_shipping_api_active && data.destination_lat && data.destination_lng) {
            fetchShippingRates(data.destination_lat, data.destination_lng);
        }
    }, []);

    const handleDetectLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const latStr = pos.coords.latitude.toFixed(6);
                    const lngStr = pos.coords.longitude.toFixed(6);
                    setData((prev) => ({
                        ...prev,
                        destination_lat: latStr,
                        destination_lng: lngStr,
                    }));
                    fetchShippingRates(latStr, lngStr);
                },
                (err) => alert('Gagal mendeteksi lokasi GPS: ' + err.message)
            );
        }
    };

    const handleSelectCourier = (opt: any) => {
        setData((prev) => ({
            ...prev,
            courier_company: opt.courier_name,
            courier_service: opt.courier_service_name,
            shipping_cost: opt.price,
        }));
    };

    const grandTotal = Number(product.price) + Number(data.shipping_cost);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('checkout.process'));
    };

    return (
        <MarketplaceLayout>
            <Head title={`Checkout Pesanan - ${product.title}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                <nav className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                    <Link href={route('products.show', product.slug)} className="hover:text-emerald-700 flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Detail Produk
                    </Link>
                </nav>

                <div className="border-b pb-3">
                    <h1 className="text-2xl font-black text-neutral-950 dark:text-white">
                        Checkout & Pembayaran Resmi
                    </h1>
                    <p className="text-xs text-neutral-500">
                        Pastikan alamat penerima dan pilihan kurir sudah sesuai standar pengiriman halal Juleha.
                    </p>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left 7 Columns: Form Input Alamat, Kurir & Metode Bayar */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Alamat Pengiriman */}
                        <Card>
                            <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b py-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-700" />
                                    1. Alamat Penerima & Titik Antar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                            Nama Penerima
                                        </label>
                                        <input
                                            type="text"
                                            value={data.recipient_name}
                                            onChange={(e) => setData('recipient_name', e.target.value)}
                                            required
                                            className="w-full text-xs rounded border-neutral-300 focus:ring-emerald-700 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                            No. Telepon / WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            value={data.recipient_phone}
                                            onChange={(e) => setData('recipient_phone', e.target.value)}
                                            required
                                            className="w-full text-xs rounded border-neutral-300 focus:ring-emerald-700 font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                        Alamat Lengkap
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.shipping_address}
                                        onChange={(e) => setData('shipping_address', e.target.value)}
                                        required
                                        className="w-full text-xs rounded border-neutral-300 focus:ring-emerald-700"
                                    />
                                </div>

                                {/* Koordinat Pengiriman */}
                                <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-600">Lat (Tujuan)</label>
                                        <input
                                            type="text"
                                            value={data.destination_lat}
                                            onChange={(e) => setData('destination_lat', e.target.value)}
                                            className="w-full text-xs font-mono rounded border-neutral-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-600">Lng (Tujuan)</label>
                                        <input
                                            type="text"
                                            value={data.destination_lng}
                                            onChange={(e) => setData('destination_lng', e.target.value)}
                                            className="w-full text-xs font-mono rounded border-neutral-300"
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleDetectLocation}
                                            className="w-full text-xs border"
                                        >
                                            Cek Lokasi GPS
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Opsi Pengiriman: Dinamis sesuai seller.is_shipping_api_active */}
                        <Card>
                            <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-emerald-700" />
                                        2. Metode Pengiriman
                                    </CardTitle>
                                    <Badge variant={seller.is_shipping_api_active ? 'default' : 'secondary'} className="text-[10px]">
                                        {seller.is_shipping_api_active ? 'BITESHIP OTOMATIS' : 'KURIR MANDIRI / COD'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {seller.is_shipping_api_active ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                                Pilih Layanan Kurir (Biteship API)
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fetchShippingRates(data.destination_lat, data.destination_lng)}
                                                disabled={isLoadingRates}
                                                className="text-xs h-7"
                                            >
                                                {isLoadingRates ? 'Menghitung...' : 'Refresh Ongkir'}
                                            </Button>
                                        </div>

                                        {ratesError && (
                                            <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                {ratesError}
                                            </p>
                                        )}

                                        {courierOptions.length === 0 && !isLoadingRates && !ratesError && (
                                            <div className="text-xs text-neutral-500 py-3 text-center border rounded">
                                                Klik 'Refresh Ongkir' untuk memuat pilihan kurir berdasarkan titik koordinat.
                                            </div>
                                        )}

                                        <div className="space-y-2 max-h-56 overflow-y-auto">
                                            {courierOptions.map((opt, i) => {
                                                const isSelected =
                                                    data.courier_company === opt.courier_name &&
                                                    data.courier_service === opt.courier_service_name;
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleSelectCourier(opt)}
                                                        className={`p-3 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-none ${
                                                            isSelected
                                                                ? 'border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                                                                : 'border-neutral-200 hover:border-neutral-400'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="font-bold uppercase text-neutral-900 dark:text-neutral-100">
                                                                {opt.courier_name} - {opt.courier_service_name}
                                                            </div>
                                                            <span className="text-[11px] text-neutral-500">
                                                                Estimasi: {opt.duration || '1-3 hari'} &bull; Layanan: {opt.type}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-mono font-bold text-emerald-700">
                                                                {formatRupiah(opt.price)}
                                                            </div>
                                                            {isSelected && (
                                                                <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 justify-end">
                                                                    <CheckCircle2 className="h-3 w-3" /> Dipilih
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-300 space-y-2 text-xs">
                                        <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                                            Pengiriman via Kurir Mandiri Penjual / COD
                                        </div>
                                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                                            Penjual produk ini mengelola kurir secara mandiri. Ongkos kirim diatur Rp 0 pada platform ini. Pembayaran ongkos kirim disepakati langsung atau dibayar di tempat saat barang tiba.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. Metode Pembayaran: Dinamis sesuai seller.is_pg_active */}
                        <Card>
                            <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-emerald-700" />
                                        3. Metode Pembayaran Toko
                                    </CardTitle>
                                    <Badge variant={seller.is_pg_active ? 'default' : 'warning'} className="text-[10px]">
                                        {seller.is_pg_active ? 'DOKU SNAP (QRIS/VA)' : 'TRANSFER REKENING PRIBADI'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {seller.is_pg_active ? (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 rounded-lg text-xs space-y-2">
                                        <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                            <ShieldCheck className="h-4 w-4 text-emerald-700" />
                                            Pembayaran Resmi DOKU Master Juleha Jatim
                                        </div>
                                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal">
                                            Setelah menekan tombol Buat Pesanan, kode QRIS Instan dan Virtual Account resmi SNAP DOKU akan otomatis digenerate dan diverifikasi secara real-time.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 rounded-lg text-xs space-y-3">
                                        <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                            <Building2 className="h-4 w-4 text-amber-700" />
                                            Transfer Langsung ke Rekening Pribadi Penjual
                                        </div>
                                        <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                            Toko ini menerima transfer langsung ke rekening bank penjual:
                                        </p>
                                        <div className="p-3 bg-white dark:bg-neutral-900 border border-amber-200 rounded font-mono text-xs text-neutral-900 dark:text-neutral-100 whitespace-pre-line font-bold">
                                            {seller.seller_bank_details || 'Informasi rekening akan diberikan setelah pesanan dibuat.'}
                                        </div>
                                        <span className="text-[10px] text-neutral-500 block italic">
                                            *Catatan: Pembagian kas organisasi (Ekop & Juleha Jatim) tercatat otomatis di sistem untuk disetorkan oleh penjual.
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 5 Columns: Ringkasan Belanja (Data-dense & High-contrast) */}
                    <div className="lg:col-span-5 space-y-4 sticky top-24">
                        <Card className="border-2 border-emerald-700">
                            <CardHeader className="bg-emerald-800 text-white py-3">
                                <CardTitle className="text-sm">Ringkasan Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {/* Item Preview */}
                                <div className="flex gap-3 items-center border-b pb-4">
                                    <img
                                        src={product.image_url || '/logo-juleha.jpg'}
                                        alt={product.title}
                                        className="h-14 w-14 rounded object-cover border"
                                    />
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-2">
                                            {product.title}
                                        </h4>
                                        <span className="text-[10px] text-neutral-500 block">
                                            1 Unit &bull; {product.weight_gram} gram
                                        </span>
                                        <span className="font-mono font-bold text-xs text-emerald-700">
                                            {formatRupiah(product.price)}
                                        </span>
                                    </div>
                                </div>

                                {/* Financial Audit Breakdown (Buyer only sees Final Price + Ongkir) */}
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Harga Barang:</span>
                                        <strong className="font-mono">{formatRupiah(product.price)}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">
                                            Ongkos Kirim ({data.courier_company || 'Kurir'}):
                                        </span>
                                        <strong className="font-mono">
                                            {data.shipping_cost > 0 ? formatRupiah(data.shipping_cost) : 'Rp 0'}
                                        </strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Biaya Layanan & Asuransi:</span>
                                        <strong className="font-mono">Rp 0 (Gratis)</strong>
                                    </div>
                                </div>

                                <div className="border-t pt-3 flex justify-between items-baseline">
                                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                        Grand Total:
                                    </span>
                                    <span className="text-2xl font-black font-mono text-emerald-700">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>

                                <Button
                                    type="submit"
                                    variant="default"
                                    size="lg"
                                    disabled={processing}
                                    className="w-full font-bold text-sm bg-emerald-700 hover:bg-emerald-800 py-3 gap-2"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    {processing
                                        ? 'Membuat Pesanan...'
                                        : seller.is_pg_active
                                        ? 'Bayar via DOKU QRIS/VA'
                                        : 'Buat Pesanan & Bayar Manual'}
                                </Button>

                                <div className="text-[10px] text-neutral-500 text-center font-medium">
                                    Transaksi aman berstandar syariat Juleha Jawa Timur.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </MarketplaceLayout>
    );
}
