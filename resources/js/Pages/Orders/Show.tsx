import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/Components/ui/dialog';
import { formatRupiah } from '@/lib/utils';
import { PageProps } from '@/types';
import {
    CreditCard,
    CheckCircle2,
    Clock,
    Truck,
    MapPin,
    ArrowLeft,
    Building2,
    Copy,
    UploadCloud,
    PackageCheck,
    ExternalLink,
    Image as ImageIcon,
    AlertCircle,
    QrCode,
    Check,
    Sparkles,
} from 'lucide-react';

interface Props {
    order: any;
}

export default function OrderShow({ order }: Props) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;

    const isBuyer = currentUser?.id === order.buyer_id;
    const isSeller = currentUser?.id === order.seller_id;
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin_ekop';

    const isPaid = order.payment_status === 'paid';
    const isAwaitingConfirmation = order.payment_status === 'awaiting_seller_confirmation';
    const isManual = order.payment_method_type === 'manual_transfer';
    const isDelivered = order.shipping_status === 'delivered';

    // State for Copy Feedback
    const [copiedText, setCopiedText] = useState<string | null>(null);

    // State for Delivery Confirmation Modal
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

    // Form for Upload Transfer Receipt
    const transferForm = useForm<{ receipt: File | null }>({
        receipt: null,
    });
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        transferForm.setData('receipt', file);
        if (file) {
            setReceiptPreview(URL.createObjectURL(file));
        } else {
            setReceiptPreview(null);
        }
    };

    const submitTransferReceipt = (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferForm.data.receipt) {
            alert('Pilih file gambar bukti transfer terlebih dahulu.');
            return;
        }

        transferForm.post(route('orders.upload-transfer-receipt', order.order_number), {
            preserveScroll: true,
            onSuccess: () => {
                setReceiptPreview(null);
                transferForm.reset();
            },
        });
    };

    // Form for Confirm Delivery Modal
    const deliveryForm = useForm<{
        received_quantity: number;
        delivery_proof: File | null;
    }>({
        received_quantity: order.items?.[0]?.quantity || 1,
        delivery_proof: null,
    });
    const [deliveryPreview, setDeliveryPreview] = useState<string | null>(null);

    const handleDeliveryProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        deliveryForm.setData('delivery_proof', file);
        if (file) {
            setDeliveryPreview(URL.createObjectURL(file));
        } else {
            setDeliveryPreview(null);
        }
    };

    const submitConfirmDelivery = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deliveryForm.data.delivery_proof) {
            alert('Unggah foto barang / paket yang diterima terlebih dahulu.');
            return;
        }

        deliveryForm.post(route('orders.confirm-delivery', order.order_number), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeliveryModalOpen(false);
                setDeliveryPreview(null);
                deliveryForm.reset();
            },
        });
    };

    // Confirm Payment
    const paymentConfirmForm = useForm({});
    const submitConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Konfirmasi bahwa dana pembayaran telah diterima dan verifikasi status LUNAS?')) {
            paymentConfirmForm.post(route('orders.confirm-payment', order.order_number), {
                preserveScroll: true,
            });
        }
    };

    const copyToClipboard = (text: string, label: string = 'teks') => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(null), 2500);
    };

    const qrData = order.qris_content || '';

    return (
        <MarketplaceLayout>
            <Head title={`Pesanan ${order.order_number} - Juleha Jatim`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <nav className="flex items-center gap-2 text-xs text-neutral-500">
                    <Link href={route('dashboard')} className="hover:text-[#ee4d2d] flex items-center gap-1 font-semibold">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Dashboard
                    </Link>
                </nav>

                {/* Header Card */}
                <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-xs text-neutral-500">
                                NOMOR PESANAN:
                            </span>
                            <span className="font-mono font-black text-sm text-[#ee4d2d]">
                                {order.order_number}
                            </span>
                        </div>
                        <h1 className="text-xl font-black text-neutral-950 dark:text-white">
                            Detail & Status Pesanan
                        </h1>
                        <span className="text-xs text-neutral-500">
                            Dibuat pada: {new Date(order.created_at).toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        {isPaid ? (
                            <Badge className="text-xs gap-1 py-1 px-3 bg-neutral-900 text-white font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                LUNAS (PAID)
                            </Badge>
                        ) : isAwaitingConfirmation ? (
                            <Badge variant="warning" className="text-xs gap-1 py-1 px-3">
                                <Clock className="h-3.5 w-3.5" />
                                MENUNGGU KONFIRMASI PENJUAL
                            </Badge>
                        ) : (
                            <Badge className="text-xs gap-1 py-1 px-3 bg-orange-500 text-white font-bold">
                                <Clock className="h-3.5 w-3.5" />
                                MENUNGGU PEMBAYARAN
                            </Badge>
                        )}

                        <Badge variant="outline" className="text-xs py-1 px-3 font-mono border-neutral-300">
                            {order.shipping_courier} - {order.shipping_service}
                        </Badge>

                        {isDelivered && (
                            <Badge className="text-xs gap-1 py-1 px-3 bg-blue-600 text-white font-bold">
                                <PackageCheck className="h-3.5 w-3.5" />
                                PAKET DITERIMA
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left 7 Columns: Payment & Delivery Status */}
                    <div className="md:col-span-7 space-y-6">
                        {/* 1. Payment Method Card */}
                        {isManual ? (
                            <Card className="border-2 border-amber-300 dark:border-amber-900 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-amber-50/70 dark:bg-amber-950/20 border-b py-3.5">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-amber-700" />
                                        <CardTitle className="text-sm font-bold text-amber-900 dark:text-amber-300">
                                            Pembayaran Rekening Pribadi Penjual
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Toko ini menggunakan rekening mandiri. Silakan transfer tepat sesuai nominal lalu unggah bukti transfer.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4 text-xs">
                                    <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 space-y-1">
                                        <span className="text-[10px] text-neutral-500 font-bold uppercase block">
                                            Nominal yang Harus Ditransfer:
                                        </span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black font-mono text-[#ee4d2d]">
                                                {formatRupiah(order.grand_total)}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(String(order.grand_total), 'nominal')}
                                                className="text-xs gap-1 h-7 border-orange-200 text-[#ee4d2d] hover:bg-orange-50"
                                            >
                                                {copiedText === 'nominal' ? (
                                                    <>
                                                        <Check className="h-3 w-3" /> Tersalin!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3 w-3" /> Salin Nominal
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                                            Rekening Tujuan Penjual:
                                        </span>
                                        <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 rounded-xl font-mono text-xs whitespace-pre-line font-bold text-neutral-900 dark:text-neutral-100">
                                            {order.seller_bank_info_snapshot || 'Silakan hubungi penjual untuk info rekening.'}
                                        </div>
                                    </div>

                                    {/* Transfer Receipt Status / Upload Area */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-1.5">
                                            <UploadCloud className="h-4 w-4 text-[#ee4d2d]" />
                                            Bukti Transfer Pembayaran:
                                        </h4>

                                        {order.transfer_receipt_path ? (
                                            <div className="p-4 bg-orange-50/60 dark:bg-neutral-800/60 border border-orange-200 rounded-xl space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Bukti transfer telah diunggah
                                                    </span>
                                                    <a
                                                        href={order.transfer_receipt_path}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs font-bold text-[#ee4d2d] underline flex items-center gap-0.5"
                                                    >
                                                        Lihat Bukti HD <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>

                                                <div className="w-40 h-28 border border-neutral-300 rounded-xl overflow-hidden bg-white">
                                                    <img
                                                        src={order.transfer_receipt_path}
                                                        alt="Bukti Transfer"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Action for seller / admin to confirm payment */}
                                                {(isSeller || isAdmin) && !isPaid && (
                                                    <div className="pt-2">
                                                        <form onSubmit={submitConfirmPayment}>
                                                            <Button
                                                                type="submit"
                                                                disabled={paymentConfirmForm.processing}
                                                                className="w-full text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl py-5"
                                                            >
                                                                {paymentConfirmForm.processing ? 'Memproses...' : 'Konfirmasi Dana Masuk (Set Status LUNAS)'}
                                                            </Button>
                                                        </form>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Upload Form for Buyer */
                                            isBuyer ? (
                                                <form onSubmit={submitTransferReceipt} className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 border rounded-xl">
                                                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                                        Unggah foto bukti transfer bank Anda. Gambar akan otomatis dioptimasi HD untuk arsip pesanan.
                                                    </p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleReceiptChange}
                                                        className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-200 file:text-neutral-800 hover:file:bg-neutral-300 cursor-pointer"
                                                    />
                                                    {receiptPreview && (
                                                        <div className="mt-2 w-32 h-24 border rounded-xl overflow-hidden">
                                                            <img src={receiptPreview} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <Button
                                                        type="submit"
                                                        disabled={transferForm.processing}
                                                        className="w-full text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl py-5"
                                                    >
                                                        {transferForm.processing ? 'Mengunggah...' : 'Unggah Bukti Transfer'}
                                                    </Button>
                                                </form>
                                            ) : (
                                                <p className="text-[11px] text-neutral-500 italic">
                                                    Pembeli belum mengunggah bukti transfer.
                                                </p>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            /* QRIS DINAMIS PAYMENT CARD (TEMANQRIS) */
                            <Card className="border border-neutral-200 shadow-md rounded-2xl overflow-hidden">
                                <CardHeader className="bg-[#ee4d2d] text-white py-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <QrCode className="h-5 w-5" />
                                            <CardTitle className="text-sm font-bold">
                                                Pembayaran Resmi QRIS Dinamis
                                            </CardTitle>
                                        </div>
                                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/20 font-bold">
                                            QRIS OTOMATIS
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4 text-xs">
                                    {/* Tagihan Box */}
                                    <div className="text-center p-4 bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 rounded-xl space-y-1.5">
                                        <span className="text-[11px] text-[#ee4d2d] font-extrabold uppercase tracking-wider block">
                                            Total Tagihan Pembayaran:
                                        </span>
                                        <span className="text-3xl font-black font-mono text-[#ee4d2d]">
                                            {formatRupiah(order.grand_total)}
                                        </span>
                                        <p className="text-[10px] text-neutral-500">
                                            Invoice Gateway: <strong className="font-mono text-neutral-700 dark:text-neutral-300">{order.qris_invoice_number || order.order_number}</strong>
                                        </p>
                                    </div>

                                    {/* QRIS Content Box */}
                                    <div className="text-center p-4 bg-white dark:bg-neutral-900 border border-neutral-200 rounded-2xl space-y-3">
                                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                            <QrCode className="h-4 w-4 text-[#ee4d2d]" />
                                            <span>Scan Kode QRIS Dinamis dengan Semua E-Wallet & Mobile Banking:</span>
                                        </div>

                                        <div className="max-w-[240px] mx-auto p-3 bg-white rounded-2xl border-2 border-neutral-200 shadow-xs">
                                            {order.qris_image_url ? (
                                                <img
                                                    src={order.qris_image_url}
                                                    alt="QRIS Dinamis TemanQRIS"
                                                    className="w-full h-auto rounded"
                                                />
                                            ) : qrData ? (
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`}
                                                    alt="QRIS Dinamis"
                                                    className="w-full h-auto rounded"
                                                />
                                            ) : (
                                                <div className="py-8 text-neutral-400">Kode QRIS sedang dimuat...</div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
                                                Mendukung Semua Aplikasi Pembayaran:
                                            </span>
                                            <p className="text-[10px] text-neutral-500 font-medium">
                                                ShopeePay &bull; BCA Mobile &bull; GoPay &bull; Livin' Mandiri &bull; BRImo &bull; BNI Mobile &bull; OVO &bull; DANA &bull; LinkAja
                                            </p>
                                        </div>

                                        <div className="pt-2 flex flex-wrap justify-center gap-2">
                                            {order.qris_payment_url && (
                                                <a
                                                    href={order.qris_payment_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-block"
                                                >
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="text-xs h-8 bg-[#ee4d2d] hover:bg-[#d03e1f] text-white font-bold rounded-lg px-3 gap-1"
                                                    >
                                                        <span>Buka Link Pembayaran</span>
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                </a>
                                            )}
                                            {qrData && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(qrData, 'qris')}
                                                    className="text-xs h-8 border-orange-200 text-[#ee4d2d] hover:bg-orange-50"
                                                >
                                                    {copiedText === 'qris' ? (
                                                        <>
                                                            <Check className="h-3 w-3" /> Kode QRIS Tersalin
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3 w-3" /> Salin String QRIS
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Auto verification / Testing simulator */}
                                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 text-center space-y-2">
                                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                            Status verifikasi: <strong>Menunggu respons pembayaran gateway</strong>. Webhook TemanQRIS akan otomatis mengupdate pesanan menjadi LUNAS begitu pembayaran diselesaikan.
                                        </p>

                                        {!isPaid && (
                                            <form onSubmit={submitConfirmPayment} className="pt-1">
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    disabled={paymentConfirmForm.processing}
                                                    className="w-full text-xs font-bold border-orange-200 text-[#ee4d2d] hover:bg-orange-50 h-8 gap-1"
                                                >
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    <span>Simulasi Bayar Selesai (Verifikasi Instan LUNAS)</span>
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 2. Delivery Proof & Reception Card */}
                        <Card className="border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="py-3 bg-neutral-50 dark:bg-neutral-900 border-b">
                                <div className="flex items-center gap-2">
                                    <PackageCheck className="h-4 w-4 text-[#ee4d2d]" />
                                    <CardTitle className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                        Konfirmasi Penerimaan Barang (Delivery Proof)
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4 text-xs">
                                {order.delivery_receipt_path ? (
                                    <div className="p-4 bg-orange-50/60 dark:bg-neutral-800/60 border border-orange-200 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-orange-950 dark:text-orange-200 block">
                                                    Barang Berhasil Diterima Pembeli
                                                </span>
                                                <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                                    Jumlah Fisik Diterima: <strong>{order.received_quantity} Unit</strong>
                                                </span>
                                            </div>
                                            <a
                                                href={order.delivery_receipt_path}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-bold text-[#ee4d2d] underline flex items-center gap-0.5"
                                            >
                                                Lihat Bukti Foto <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>

                                        <div className="w-48 h-32 border border-neutral-200 rounded-xl overflow-hidden bg-white">
                                            <img
                                                src={order.delivery_receipt_path}
                                                alt="Bukti Terima Barang"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="text-[10px] text-neutral-500">
                                            Dikonfirmasi pada: {order.delivered_at ? new Date(order.delivered_at).toLocaleString('id-ID') : '-'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                            Saat pesanan sampai, pembeli wajib mengonfirmasi penerimaan dengan menginput jumlah unit yang diterima serta mengunggah foto barang/paket sebagai bukti transparansi syariat.
                                        </p>

                                        {isBuyer ? (
                                            <Button
                                                type="button"
                                                onClick={() => setIsDeliveryModalOpen(true)}
                                                className="w-full text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white gap-2 py-5 rounded-xl shadow-sm"
                                            >
                                                <PackageCheck className="h-4 w-4" />
                                                Konfirmasi Terima Barang Sekarang
                                            </Button>
                                        ) : (
                                            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-500 italic text-[11px]">
                                                Menunggu pembeli melakukan konfirmasi dan mengunggah foto bukti penerimaan fisik.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 5 Columns: Rincian Produk, Tracking, & Pengiriman */}
                    <div className="md:col-span-5 space-y-4">
                        {/* Waybill Tracking Card */}
                        <Card className="border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="py-3 bg-neutral-50 dark:bg-neutral-900 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Truck className="h-4 w-4 text-[#ee4d2d]" />
                                        <CardTitle className="text-xs font-bold">Pelacakan Resi Kurir</CardTitle>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                                        {order.shipping_courier}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-xs">
                                <div>
                                    <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">
                                        Nomor Resi Pengiriman:
                                    </span>
                                    <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                                        <span>{order.biteship_waybill_id || 'RESI_BELUM_TERBIT'}</span>
                                        {order.biteship_waybill_id && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(order.biteship_waybill_id, 'resi')}
                                                className="h-6 text-[10px] px-2 border-orange-200 text-[#ee4d2d]"
                                            >
                                                {copiedText === 'resi' ? 'Tersalin' : 'Salin'}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {order.biteship_waybill_id ? (
                                    <a
                                        href={`https://track.biteship.com/track/${encodeURIComponent(order.biteship_waybill_id)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block"
                                    >
                                        <Button
                                            type="button"
                                            className="w-full text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white gap-1.5 h-9 rounded-xl"
                                        >
                                            <Truck className="h-3.5 w-3.5" />
                                            <span>Lacak Pergerakan Kurir</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </a>
                                ) : (
                                    <p className="text-[10px] text-neutral-500">
                                        Resi akan otomatis terbit saat penjual melakukan request pickup atau konfirmasi pengiriman kurir.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Items & Total Summary */}
                        <Card className="border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="py-3 bg-neutral-50 dark:bg-neutral-900 border-b">
                                <CardTitle className="text-xs font-bold">Rincian Barang & Pengiriman</CardTitle>
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
                                        <span>Ongkos Kirim ({order.shipping_courier}):</span>
                                        <strong className="font-mono text-neutral-900 dark:text-neutral-100">
                                            {formatRupiah(order.shipping_cost)}
                                        </strong>
                                    </div>
                                    {Number(order.discount_amount) > 0 && (
                                        <div className="flex justify-between text-green-600 font-bold">
                                            <span>Diskon Voucher ({order.voucher_code || 'PROMO'}):</span>
                                            <span className="font-mono">
                                                -{formatRupiah(order.discount_amount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2 font-bold text-neutral-900 dark:text-neutral-100">
                                        <span>Total Pembayaran (Resi Resmi):</span>
                                        <span className="font-mono text-[#ee4d2d] text-base font-black">
                                            {formatRupiah(order.grand_total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Shipping Address Box */}
                                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 text-[11px] space-y-1">
                                    <div className="flex items-center gap-1 font-bold text-neutral-800 dark:text-neutral-200">
                                        <MapPin className="h-3.5 w-3.5 text-[#ee4d2d]" />
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

            {/* Modal Konfirmasi Terima Barang (Shadcn Dialog) */}
            <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
                <DialogContent onClose={() => setIsDeliveryModalOpen(false)}>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Terima Barang</DialogTitle>
                        <DialogDescription>
                            Pastikan Anda telah membuka dan memeriksa fisik pesanan sesuai dengan barang yang dipesan sebelum melakukan konfirmasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitConfirmDelivery} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Jumlah Barang yang Diterima (Unit):
                            </label>
                            <input
                                type="number"
                                min={1}
                                required
                                value={deliveryForm.data.received_quantity}
                                onChange={(e) => deliveryForm.setData('received_quantity', parseInt(e.target.value) || 1)}
                                className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold focus:ring-1 focus:ring-[#ee4d2d]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                Foto Bukti Barang / Paket yang Diterima:
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                required
                                onChange={handleDeliveryProofChange}
                                className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-200 file:text-neutral-800 hover:file:bg-neutral-300 cursor-pointer"
                            />
                            <p className="text-[10px] text-neutral-500 mt-1">
                                Foto akan dikompresi otomatis ke format WebP HD untuk arsip transparansi sistem.
                            </p>

                            {deliveryPreview && (
                                <div className="mt-3 w-40 h-28 border border-neutral-300 rounded-xl overflow-hidden">
                                    <img src={deliveryPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeliveryModalOpen(false)}
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={deliveryForm.processing}
                                className="text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl"
                            >
                                {deliveryForm.processing ? 'Menyimpan...' : 'Konfirmasi Penerimaan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MarketplaceLayout>
    );
}
