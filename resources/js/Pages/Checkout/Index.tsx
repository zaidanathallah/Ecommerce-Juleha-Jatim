import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { BuyerProduct } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
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
    QrCode,
    RefreshCw,
    Check,
    Ticket,
    X,
    Percent,
    Sparkles,
} from 'lucide-react';

interface VoucherOption {
    id: number;
    code: string;
    title: string;
    description?: string;
    type: 'free_shipping' | 'discount_percent' | 'discount_fixed';
    discount_amount: number;
    min_spend: number;
    max_discount?: number | null;
}

interface Props {
    product: BuyerProduct;
    availableVouchers?: VoucherOption[];
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

const DEFAULT_COURIER_OPTIONS = [
    {
        courier_name: 'J&T Express',
        courier_code: 'jnt',
        courier_service_name: 'EZ',
        courier_service_code: 'ez',
        duration: '1 - 2 Hari',
        price: 18000,
        type: 'Standard Delivery',
    },
    {
        courier_name: 'JNE',
        courier_code: 'jne',
        courier_service_name: 'REG',
        courier_service_code: 'reg',
        duration: '1 - 2 Hari',
        price: 19000,
        type: 'Standard Delivery',
    },
    {
        courier_name: 'SiCepat',
        courier_code: 'sicepat',
        courier_service_name: 'REG',
        courier_service_code: 'reg',
        duration: '1 - 3 Hari',
        price: 18500,
        type: 'Standard Delivery',
    },
    {
        courier_name: 'Anteraja',
        courier_code: 'anteraja',
        courier_service_name: 'Regular',
        courier_service_code: 'reg',
        duration: '1 - 3 Hari',
        price: 17500,
        type: 'Standard Delivery',
    },
];

export default function CheckoutIndex({ product, availableVouchers = [], seller, buyer }: Props) {
    const [courierOptions, setCourierOptions] = useState<any[]>(DEFAULT_COURIER_OPTIONS);
    const [isLoadingRates, setIsLoadingRates] = useState(false);
    const [ratesError, setRatesError] = useState<string | null>(null);

    // Voucher application state
    const [inputVoucherCode, setInputVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
    const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
    const [voucherError, setVoucherError] = useState<string | null>(null);
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        recipient_name: buyer.name || '',
        recipient_phone: buyer.phone || '',
        shipping_address: buyer.address || '',
        destination_lat: buyer.lat ? String(buyer.lat) : '-7.2575',
        destination_lng: buyer.lng ? String(buyer.lng) : '112.7521',
        courier_company: 'J&T Express',
        courier_service: 'EZ',
        shipping_cost: 18000,
        payment_channel: 'qris_dinamis',
        voucher_code: '',
        notes: '',
    });

    // Auto-fetch shipping rates via Biteship API
    const fetchShippingRates = async (lat: string, lng: string) => {
        setIsLoadingRates(true);
        setRatesError(null);

        try {
            const res = await axios.post(route('checkout.calculate-shipping'), {
                product_id: product.id,
                destination_lat: Number(lat),
                destination_lng: Number(lng),
            });

            if (res.data.success && Array.isArray(res.data.pricing) && res.data.pricing.length > 0) {
                setCourierOptions(res.data.pricing);
                const firstOption = res.data.pricing[0];
                setData((prev) => ({
                    ...prev,
                    courier_company: firstOption.courier_name,
                    courier_service: firstOption.courier_service_name,
                    shipping_cost: firstOption.price,
                }));
            } else {
                setCourierOptions(DEFAULT_COURIER_OPTIONS);
            }
        } catch (err: any) {
            setCourierOptions(DEFAULT_COURIER_OPTIONS);
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

    // Calculate voucher discount on subtotal and shipping cost
    const handleApplyVoucher = async (codeToApply?: string) => {
        const code = (codeToApply || inputVoucherCode).trim().toUpperCase();
        if (!code) return;

        setIsApplyingVoucher(true);
        setVoucherError(null);

        try {
            const res = await axios.post(route('vouchers.apply'), {
                code,
                subtotal: Number(product.price),
                shipping_fee: Number(data.shipping_cost),
            });

            if (res.data.success && res.data.voucher) {
                setAppliedVoucher(res.data.voucher);
                setVoucherDiscount(Number(res.data.voucher.discount || 0));
                setData('voucher_code', res.data.voucher.code);
                setInputVoucherCode(res.data.voucher.code);
                setShowVoucherModal(false);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Kode voucher tidak valid atau minimal belanja belum terpenuhi.';
            setVoucherError(msg);
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherDiscount(0);
        setData('voucher_code', '');
        setInputVoucherCode('');
        setVoucherError(null);
    };

    // Recalculate discount whenever shipping fee changes if a free_shipping voucher is active
    useEffect(() => {
        if (appliedVoucher) {
            handleApplyVoucher(appliedVoucher.code);
        }
    }, [data.shipping_cost]);

    const subtotal = Number(product.price);
    const shippingFee = Number(data.shipping_cost);
    const grandTotal = Math.max(0, subtotal + shippingFee - voucherDiscount);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('checkout.process'));
    };

    return (
        <MarketplaceLayout>
            <Head title={`Checkout Pesanan - ${product.title}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                <nav className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                    <Link href={route('products.show', product.slug)} className="hover:text-[#ee4d2d] flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Detail Produk
                    </Link>
                </nav>

                <div className="border-b pb-3">
                    <h1 className="text-2xl font-black text-neutral-950 dark:text-white">
                        Checkout & Pembayaran Pesanan
                    </h1>
                    <p className="text-xs text-neutral-500">
                        Pastikan alamat penerima, pilihan kurir, voucher belanja, dan metode pembayaran sudah sesuai.
                    </p>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left 7 Columns: Form Input Alamat, Kurir & Metode Bayar */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Alamat Pengiriman */}
                        <Card className="border-neutral-200 shadow-sm">
                            <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b py-3">
                                <CardTitle className="text-sm flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold">
                                    <MapPin className="h-4 w-4 text-[#ee4d2d]" />
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
                                            className="w-full text-xs rounded-xl border-neutral-300 focus:ring-[#ee4d2d] focus:border-[#ee4d2d] font-medium"
                                        />
                                        {errors.recipient_name && (
                                            <span className="text-[10px] text-red-500">{errors.recipient_name}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                            Nomor WhatsApp / HP
                                        </label>
                                        <input
                                            type="text"
                                            value={data.recipient_phone}
                                            onChange={(e) => setData('recipient_phone', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-xl border-neutral-300 focus:ring-[#ee4d2d] focus:border-[#ee4d2d] font-medium"
                                        />
                                        {errors.recipient_phone && (
                                            <span className="text-[10px] text-red-500">{errors.recipient_phone}</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                        Alamat Lengkap (Jalan, No Rumah, RT/RW, Kecamatan, Kota/Kab)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.shipping_address}
                                        onChange={(e) => setData('shipping_address', e.target.value)}
                                        required
                                        className="w-full text-xs rounded-xl border-neutral-300 focus:ring-[#ee4d2d] focus:border-[#ee4d2d] font-medium"
                                        placeholder="Contoh: Jl. Ahmad Yani No. 12, Kel. Wonokromo, Surabaya"
                                    />
                                    {errors.shipping_address && (
                                        <span className="text-[10px] text-red-500">{errors.shipping_address}</span>
                                    )}
                                </div>

                                {/* Koordinat GPS untuk Ongkir Real-time */}
                                <div className="p-3 bg-orange-50/50 dark:bg-neutral-800/60 border border-orange-200 dark:border-neutral-700 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                            Koordinat Titik Pengantaran Kurir
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDetectLocation}
                                            className="text-[11px] h-7 gap-1 border-orange-300 text-[#ee4d2d] hover:bg-orange-100"
                                        >
                                            <MapPin className="h-3 w-3" /> Deteksi GPS Saya
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                        <div>
                                            <label className="text-[10px] text-neutral-500 block">Latitude</label>
                                            <input
                                                type="text"
                                                value={data.destination_lat}
                                                onChange={(e) => setData('destination_lat', e.target.value)}
                                                className="w-full text-xs font-mono rounded-lg border-neutral-300 focus:ring-[#ee4d2d]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-neutral-500 block">Longitude</label>
                                            <input
                                                type="text"
                                                value={data.destination_lng}
                                                onChange={(e) => setData('destination_lng', e.target.value)}
                                                className="w-full text-xs font-mono rounded-lg border-neutral-300 focus:ring-[#ee4d2d]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                        Catatan untuk Penjual / Kurir (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Contoh: Titipkan di pos satpam bila rumah kosong"
                                        className="w-full text-xs rounded-xl border-neutral-300 focus:ring-[#ee4d2d]"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Metode Pengiriman (Kurir Biteship) */}
                        <Card className="border-neutral-200 shadow-sm">
                            <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold">
                                        <Truck className="h-4 w-4 text-[#ee4d2d]" />
                                        2. Opsi Pengiriman Kurir
                                    </CardTitle>
                                    <Badge className="text-[10px] bg-[#ee4d2d] text-white">
                                        LOGISTIK RESMI BITESHIP
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                            Pilih Layanan Kurir Pengiriman:
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchShippingRates(data.destination_lat, data.destination_lng)}
                                            disabled={isLoadingRates}
                                            className="text-xs h-7 border-orange-300 text-[#ee4d2d] hover:bg-orange-50 gap-1"
                                        >
                                            <RefreshCw className={`h-3 w-3 ${isLoadingRates ? 'animate-spin' : ''}`} />
                                            {isLoadingRates ? 'Menghitung...' : 'Cek Ulang Ongkir'}
                                        </Button>
                                    </div>

                                    {ratesError && (
                                        <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                                            {ratesError}
                                        </p>
                                    )}

                                    <div className="space-y-2.5">
                                        {courierOptions.map((opt, i) => {
                                            const isSelected =
                                                data.courier_company === opt.courier_name &&
                                                data.courier_service === opt.courier_service_name;
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => handleSelectCourier(opt)}
                                                    className={`p-3.5 rounded-xl border text-xs cursor-pointer flex justify-between items-center transition-all ${
                                                        isSelected
                                                            ? 'border-[#ee4d2d] bg-[#fff5f1] dark:bg-orange-950/20 shadow-xs'
                                                            : 'border-neutral-200 hover:border-neutral-300 bg-white dark:bg-neutral-900'
                                                    }`}
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-extrabold uppercase text-neutral-900 dark:text-neutral-100 text-xs">
                                                                {opt.courier_name}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                                                                {opt.courier_service_name}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-neutral-500">
                                                            Estimasi Sampai: <strong className="text-neutral-700 dark:text-neutral-300">{opt.duration || '1-3 hari'}</strong> &bull; {opt.type}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-mono font-black text-sm text-[#ee4d2d]">
                                                            {formatRupiah(opt.price)}
                                                        </div>
                                                        {isSelected && (
                                                            <span className="text-[11px] font-bold text-[#ee4d2d] flex items-center gap-1 justify-end mt-0.5">
                                                                <Check className="h-3.5 w-3.5 stroke-[3]" /> Dipilih
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Metode Pembayaran: QRIS Dinamis TemanQRIS */}
                        <Card className="border-neutral-200 shadow-sm">
                            <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold">
                                        <CreditCard className="h-4 w-4 text-[#ee4d2d]" />
                                        3. Metode Pembayaran Resmi
                                    </CardTitle>
                                    <Badge className="text-[10px] bg-[#ee4d2d] text-white">
                                        GATEWAY QRIS RESMI
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {seller.is_pg_active ? (
                                    <div className="space-y-3">
                                        {/* QRIS Dinamis Option */}
                                        <div
                                            onClick={() => setData('payment_channel', 'qris_dinamis')}
                                            className="p-4 rounded-xl border border-[#ee4d2d] bg-[#fff5f1] dark:bg-orange-950/20 shadow-xs ring-1 ring-[#ee4d2d] cursor-pointer flex items-start gap-3.5 transition-all"
                                        >
                                            <div className="p-2.5 rounded-xl bg-[#ee4d2d] text-white shrink-0 mt-0.5 shadow-sm">
                                                <QrCode className="h-5 w-5" />
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <span className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">
                                                        QRIS Dinamis Otomatis
                                                    </span>
                                                    <Badge className="text-[10px] bg-green-600 text-white font-bold">
                                                        Verifikasi Instan 24 Jam
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                                    Mendukung semua pembayaran e-wallet (<strong>ShopeePay, GoPay, OVO, DANA, LinkAja</strong>) dan mobile banking (<strong>BCA, Mandiri Livin, BRImo, BNI Mobile</strong>).
                                                </p>
                                                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-neutral-500">
                                                    <span>Kode QR unik dibuat otomatis sesuai nominal belanja</span>
                                                </div>
                                            </div>

                                            <div className="shrink-0 pt-1">
                                                <div className="h-4 w-4 rounded-full border border-[#ee4d2d] bg-[#ee4d2d] flex items-center justify-center">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center gap-2 text-[11px] text-neutral-500">
                                            <ShieldCheck className="h-4 w-4 text-[#ee4d2d] shrink-0" />
                                            <span>
                                                Pembayaran QRIS aman, terenkripsi, dan terintegrasi sistem verifikasi webhook otomatis.
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20">
                                            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                                                <Building2 className="w-4 h-4" />
                                                Transfer Manual ke Rekening Pribadi Penjual
                                            </div>
                                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                                Toko ini memilih pembayaran via rekening pribadi. Anda dapat mengunggah bukti transfer setelah membuat pesanan.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 5 Columns: Ringkasan Belanja & Voucher Promo */}
                    <div className="lg:col-span-5 space-y-4 sticky top-24">
                        {/* Shopee-Style Voucher Promo Card */}
                        <Card className="border border-neutral-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-orange-50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/40 py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                                        <Ticket className="w-4 h-4 text-[#ee4d2d]" />
                                        Voucher Belanja & Gratis Ongkir
                                    </CardTitle>
                                    <button
                                        type="button"
                                        onClick={() => setShowVoucherModal(true)}
                                        className="text-[11px] font-bold text-[#ee4d2d] hover:underline"
                                    >
                                        Pilih Voucher
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {appliedVoucher ? (
                                    <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs font-black bg-[#ee4d2d] text-white px-2 py-0.5 rounded">
                                                    {appliedVoucher.code}
                                                </span>
                                                <span className="text-[11px] font-bold text-green-700 dark:text-green-300">
                                                    Hemat {formatRupiah(voucherDiscount)}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-neutral-500 line-clamp-1">
                                                {appliedVoucher.title}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveVoucher}
                                            className="text-xs text-red-500 hover:text-red-700 p-1"
                                            title="Batalkan voucher"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={inputVoucherCode}
                                                onChange={(e) => setInputVoucherCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                                                placeholder="Ketik kode promo (misal: ONGKIRFREE)"
                                                className="flex-1 text-xs font-mono font-bold uppercase rounded-xl border-neutral-300 focus:ring-[#ee4d2d] focus:border-[#ee4d2d]"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={!inputVoucherCode.trim() || isApplyingVoucher}
                                                onClick={() => handleApplyVoucher()}
                                                className="bg-[#ee4d2d] hover:bg-[#d03e1f] text-white rounded-xl text-xs font-bold px-4"
                                            >
                                                {isApplyingVoucher ? 'Memeriksa...' : 'Terapkan'}
                                            </Button>
                                        </div>

                                        {voucherError && (
                                            <p className="text-[10px] text-red-600 font-medium">
                                                {voucherError}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ringkasan Pembayaran Shopee-Style */}
                        <Card className="border border-neutral-200 shadow-md overflow-hidden">
                            <CardHeader className="bg-[#ee4d2d] text-white py-3.5">
                                <CardTitle className="text-sm font-bold">Ringkasan Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {/* Item Preview */}
                                <div className="flex gap-3 items-center border-b pb-4">
                                    <img
                                        src={product.image_url || '/logo-juleha.jpg'}
                                        alt={product.title}
                                        className="h-16 w-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                                    />
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-2">
                                            {product.title}
                                        </h4>
                                        <span className="text-[10px] text-neutral-500 block">
                                            1 Unit &bull; {product.weight_gram} gram
                                        </span>
                                        <span className="font-mono font-extrabold text-sm text-[#ee4d2d]">
                                            {formatRupiah(product.price)}
                                        </span>
                                    </div>
                                </div>

                                {/* Seller Info */}
                                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs space-y-1">
                                    <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">
                                        Mitra Penjual:
                                    </span>
                                    <div className="font-bold text-neutral-900 dark:text-neutral-100">
                                        {seller.name}
                                    </div>
                                    <div className="text-[11px] text-neutral-500">
                                        Lokasi: {seller.region_name || 'Jawa Timur'}
                                    </div>
                                </div>

                                {/* Financial Details Breakdown */}
                                <div className="space-y-2 text-xs pt-1">
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>Subtotal Produk:</span>
                                        <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                                            {formatRupiah(subtotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>Ongkos Kirim:</span>
                                        <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                                            {shippingFee > 0 ? formatRupiah(shippingFee) : 'Rp 0'}
                                        </span>
                                    </div>

                                    {voucherDiscount > 0 && (
                                        <div className="flex justify-between text-green-600 font-bold">
                                            <span>Diskon Voucher ({appliedVoucher?.code}):</span>
                                            <span className="font-mono">
                                                -{formatRupiah(voucherDiscount)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>Biaya Layanan Gateway:</span>
                                        <span className="font-mono font-bold text-[#ee4d2d]">
                                            Gratis (Rp 0)
                                        </span>
                                    </div>

                                    <div className="border-t pt-3 flex justify-between items-baseline">
                                        <span className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">
                                            Total Pembayaran:
                                        </span>
                                        <span className="font-mono font-black text-xl text-[#ee4d2d]">
                                            {formatRupiah(grandTotal)}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-6 text-sm font-black bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl shadow-lg transition-transform active:scale-[0.99]"
                                >
                                    {processing ? 'Memproses Pesanan...' : 'Buat Pesanan Sekarang'}
                                </Button>

                                <p className="text-[10px] text-neutral-500 text-center leading-normal">
                                    Dengan membuat pesanan, Anda menyetujui standar transaksi halal Juleha Jawa Timur.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>

            {/* Voucher Selection Modal */}
            {showVoucherModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="bg-[#ee4d2d] p-4 text-white flex items-center justify-between">
                            <h3 className="text-sm font-black flex items-center gap-2">
                                <Ticket className="w-4 h-4" />
                                Pilih Voucher Promo Belanja
                            </h3>
                            <button
                                onClick={() => setShowVoucherModal(false)}
                                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-3 flex-1">
                            {availableVouchers.length === 0 ? (
                                <p className="text-center text-xs text-neutral-500 py-8">
                                    Tidak ada voucher promo yang tersedia saat ini.
                                </p>
                            ) : (
                                availableVouchers.map((v) => (
                                    <div
                                        key={v.id}
                                        className="p-3.5 rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/10 flex items-center justify-between gap-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-black bg-[#ee4d2d] text-white px-2 py-0.5 rounded">
                                                    {v.code}
                                                </span>
                                                <span className="text-[10px] font-bold text-neutral-500 capitalize">
                                                    {v.type === 'free_shipping' ? 'Gratis Ongkir' : 'Diskon Toko'}
                                                </span>
                                            </div>
                                            <h5 className="text-xs font-bold text-neutral-900 dark:text-white">
                                                {v.title}
                                            </h5>
                                            <p className="text-[11px] text-neutral-500">
                                                Min. Belanja: <strong>{formatRupiah(v.min_spend)}</strong>
                                                {' • '}Potongan:{' '}
                                                <strong className="text-[#ee4d2d]">
                                                    {v.type === 'discount_percent' ? `${v.discount_amount}%` : formatRupiah(v.discount_amount)}
                                                </strong>
                                            </p>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => handleApplyVoucher(v.code)}
                                            className="bg-[#ee4d2d] hover:bg-[#d03e1f] text-white text-xs font-bold rounded-xl shrink-0"
                                        >
                                            Pakai
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border-t flex justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowVoucherModal(false)}
                                className="rounded-xl text-xs"
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </MarketplaceLayout>
    );
}
