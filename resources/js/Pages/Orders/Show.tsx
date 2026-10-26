import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { formatRupiah } from '@/lib/utils';
import {
    CreditCard,
    CheckCircle2,
    Clock,
    Truck,
    MapPin,
    ArrowLeft,
    Building2,
    Copy,
    AlertCircle,
    Package,
} from 'lucide-react';

interface Props {
    order: any;
}

export default function OrderShow({ order }: Props) {
    const isPaid = order.payment_status === 'paid';
    const isManual = order.payment_method_type === 'manual_transfer';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Tersalin ke clipboard: ' + text);
    };

    return (
        <MarketplaceLayout>
            <Head title={`Pesanan ${order.order_number} - Juleha Jatim`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <nav className="flex items-center gap-2 text-xs text-neutral-500">
                    <Link href={route('dashboard')} className="hover:text-emerald-700 flex items-center gap-1 font-semibold">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Dashboard
                    </Link>
                </nav>

                {/* Header Card */}
                <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-xs text-neutral-500">
                                NOMOR PESANAN:
                            </span>
                            <span className="font-mono font-black text-sm text-neutral-900 dark:text-neutral-100">
                                {order.order_number}
                            </span>
                        </div>
                        <h1 className="text-xl font-black text-neutral-950 dark:text-white">
                            Detail & Status Pembayaran
                        </h1>
                        <span className="text-xs text-neutral-500">
                            Dibuat pada: {new Date(order.created_at).toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        {isPaid ? (
                            <Badge variant="success" className="text-xs gap-1 py-1 px-3">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                LUNAS (PAID)
                            </Badge>
                        ) : (
                            <Badge variant="warning" className="text-xs gap-1 py-1 px-3">
                                <Clock className="h-3.5 w-3.5" />
                                MENUNGGU PEMBAYARAN
                            </Badge>
                        )}

                        <Badge variant="secondary" className="text-xs py-1 px-3">
                            {order.shipping_courier} - {order.shipping_service}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left 7 Columns: Payment Instruction */}
                    <div className="md:col-span-7 space-y-4">
                        {isManual ? (
                            /* Manual Transfer Instructions */
                            <Card className="border-2 border-amber-300 dark:border-amber-900">
                                <CardHeader className="bg-amber-50/60 dark:bg-amber-950/20 border-b">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-amber-700" />
                                        <CardTitle className="text-base text-amber-900 dark:text-amber-300">
                                            Instruksi Transfer Rekening Pribadi Penjual
                                        </CardTitle>
                                    </div>
                                    <CardDescription>
                                        Toko ini menggunakan rekening mandiri. Silakan transfer tepat sesuai nominal grand total.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4 text-xs">
                                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 space-y-1">
                                        <span className="text-[10px] text-neutral-500 font-bold uppercase block">
                                            Nominal yang Harus Ditransfer:
                                        </span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black font-mono text-emerald-700">
                                                {formatRupiah(order.grand_total)}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(String(order.grand_total))}
                                                className="text-xs gap-1 h-7"
                                            >
                                                <Copy className="h-3 w-3" /> Salin Nominal
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                                            Rekening Tujuan Penjual:
                                        </span>
                                        <div className="p-3 bg-white dark:bg-neutral-900 border rounded font-mono text-xs whitespace-pre-line font-bold text-neutral-900 dark:text-neutral-100">
                                            {order.seller_bank_info_snapshot || 'Silakan hubungi penjual untuk info rekening.'}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-neutral-50 border rounded text-[11px] text-neutral-600 space-y-1">
                                        <strong>Pemberitahuan Kas:</strong>
                                        <p>
                                            Bagian kas daerah (Ekop) dan kas provinsi (DPW) tercatat berstatus{' '}
                                            <span className="font-bold text-amber-700 uppercase">Hutang Penjual ke Kas</span>{' '}
                                            dan akan ditagih oleh pengurus wilayah.
                                        </p>
                                    </div>

                                    <a
                                        href={`https://wa.me/?text=Halo%2C%20saya%20sudah%20membuat%20pesanan%20${order.order_number}%20sebesar%20${formatRupiah(order.grand_total)}.%20Berikut%20bukti%20transfernya.`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block"
                                    >
                                        <Button variant="default" className="w-full text-xs font-bold bg-emerald-700">
                                            Konfirmasi Pembayaran ke Penjual via WhatsApp &rarr;
                                        </Button>
                                    </a>
                                </CardContent>
                            </Card>
                        ) : (
                            /* DOKU SNAP QRIS / VA Instructions */
                            <Card className="border-2 border-emerald-700">
                                <CardHeader className="bg-emerald-800 text-white border-b py-3">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        <CardTitle className="text-base">
                                            Pembayaran Resmi DOKU SNAP
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4 text-xs">
                                    <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 rounded-lg space-y-2">
                                        <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider block">
                                            Total Tagihan DOKU Master Juleha:
                                        </span>
                                        <span className="text-3xl font-black font-mono text-emerald-800 dark:text-emerald-200">
                                            {formatRupiah(order.grand_total)}
                                        </span>
                                        <p className="text-[10px] text-neutral-500">
                                            Invoice DOKU: {order.doku_invoice_number || order.order_number}
                                        </p>
                                    </div>

                                    {order.doku_qris_content ? (
                                        <div className="text-center p-4 bg-white dark:bg-neutral-900 border rounded-lg space-y-3">
                                            <div className="font-bold text-xs text-neutral-800">
                                                Scan QRIS Menggunakan Aplikasi Bank atau E-Wallet:
                                            </div>
                                            <div className="max-w-[200px] mx-auto p-2 bg-white rounded border border-neutral-300">
                                                {/* QR Generator Placeholder URL */}
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.doku_qris_content)}`}
                                                    alt="QRIS DOKU"
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                            <span className="text-[10px] text-neutral-500 block font-mono">
                                                BCA Mobile, Mandiri Livin, BRImo, GoPay, OVO, ShopeePay
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-neutral-100 rounded text-center space-y-2">
                                            <p className="font-bold text-neutral-700">
                                                Simulasi Gateway DOKU SNAP Sandbox
                                            </p>
                                            <p className="text-[11px] text-neutral-500">
                                                Invoice nomor: <strong>{order.order_number}</strong> telah disiapkan di gateway DOKU. Notifikasi webhook DOKU akan otomatis mengubah status menjadi LUNAS.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right 5 Columns: Rincian Produk & Pengiriman */}
                    <div className="md:col-span-5 space-y-4">
                        <Card>
                            <CardHeader className="py-3 bg-neutral-50 dark:bg-neutral-900 border-b">
                                <CardTitle className="text-xs">Rincian Barang & Pengiriman</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-xs">
                                {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-start border-b pb-2">
                                        <div>
                                            <strong className="block text-neutral-900 dark:text-neutral-100">
                                                {item.product_title}
                                            </strong>
                                            <span className="text-[10px] text-neutral-500">
                                                {item.quantity} Unit &bull; Harga: {formatRupiah(item.final_price)}
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatRupiah(item.subtotal)}
                                        </span>
                                    </div>
                                ))}

                                <div className="space-y-1.5 pt-1 text-neutral-600 dark:text-neutral-400">
                                    <div className="flex justify-between">
                                        <span>Ongkos Kirim:</span>
                                        <strong className="font-mono text-neutral-900 dark:text-neutral-100">
                                            {formatRupiah(order.shipping_cost)}
                                        </strong>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 font-bold text-neutral-900 dark:text-neutral-100">
                                        <span>Grand Total:</span>
                                        <span className="font-mono text-emerald-700 text-sm">
                                            {formatRupiah(order.grand_total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Shipping Address Box */}
                                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded border text-[11px] space-y-1">
                                    <div className="flex items-center gap-1 font-bold text-neutral-800 dark:text-neutral-200">
                                        <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                                        Alamat Pengiriman
                                    </div>
                                    <p className="text-neutral-700 dark:text-neutral-300">
                                        <strong>{order.shipping_address?.recipient_name}</strong> ({order.shipping_address?.recipient_phone})
                                    </p>
                                    <p className="text-neutral-500">
                                        {order.shipping_address?.address}
                                    </p>
                                    <span className="text-[10px] font-mono text-neutral-400 block">
                                        Koordinat: {order.shipping_address?.lat}, {order.shipping_address?.lng}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
