import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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

    // Seller manual payment confirmation
    const paymentConfirmForm = useForm({});
    const submitConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Konfirmasi bahwa dana telah masuk ke rekening Anda?')) {
            paymentConfirmForm.post(route('orders.confirm-payment', order.order_number), {
                preserveScroll: true,
            });
        }
    };

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
                            Detail & Status Pesanan
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
                        ) : isAwaitingConfirmation ? (
                            <Badge variant="warning" className="text-xs gap-1 py-1 px-3">
                                <Clock className="h-3.5 w-3.5" />
                                MENUNGGU KONFIRMASI PENJUAL
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-xs gap-1 py-1 px-3">
                                <Clock className="h-3.5 w-3.5" />
                                MENUNGGU PEMBAYARAN
                            </Badge>
                        )}

                        <Badge variant="outline" className="text-xs py-1 px-3 font-mono">
                            {order.shipping_courier} - {order.shipping_service}
                        </Badge>

                        {isDelivered && (
                            <Badge variant="success" className="text-xs gap-1 py-1 px-3">
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
                            <Card className="border-2 border-amber-300 dark:border-amber-900">
                                <CardHeader className="bg-amber-50/60 dark:bg-amber-950/20 border-b">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-amber-700" />
                                        <CardTitle className="text-base text-amber-900 dark:text-amber-300">
                                            Pembayaran Rekening Pribadi Penjual
                                        </CardTitle>
                                    </div>
                                    <CardDescription>
                                        Toko ini menggunakan rekening mandiri. Silakan transfer tepat sesuai nominal lalu unggah bukti transfer.
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

                                    {/* Transfer Receipt Status / Upload Area */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-1.5">
                                            <UploadCloud className="h-4 w-4 text-emerald-700" />
                                            Bukti Transfer Pembayaran:
                                        </h4>

                                        {order.transfer_receipt_path ? (
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 rounded-lg space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Bukti transfer telah diunggah
                                                    </span>
                                                    <a
                                                        href={order.transfer_receipt_path}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs font-bold text-emerald-700 underline flex items-center gap-0.5"
                                                    >
                                                        Lihat Full HD <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>

                                                <div className="w-40 h-28 border border-neutral-300 rounded overflow-hidden bg-white">
                                                    <img
                                                        src={order.transfer_receipt_path}
                                                        alt="Bukti Transfer"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Action for seller to confirm payment */}
                                                {(isSeller || isAdmin) && !isPaid && (
                                                    <div className="pt-2">
                                                        <form onSubmit={submitConfirmPayment}>
                                                            <Button
                                                                type="submit"
                                                                disabled={paymentConfirmForm.processing}
                                                                className="w-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
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
                                                <form onSubmit={submitTransferReceipt} className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 border rounded-lg">
                                                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                                        Unggah foto bukti transfer bank Anda. Gambar akan otomatis dioptimasi HD (di bawah 300KB WebP) untuk server.
                                                    </p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleReceiptChange}
                                                        className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-200 file:text-neutral-800 hover:file:bg-neutral-300 cursor-pointer"
                                                    />
                                                    {receiptPreview && (
                                                        <div className="mt-2 w-32 h-24 border rounded overflow-hidden">
                                                            <img src={receiptPreview} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <Button
                                                        type="submit"
                                                        disabled={transferForm.processing}
                                                        className="w-full text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white"
                                                    >
                                                        {transferForm.processing ? 'Mengompres & Mengunggah...' : 'Unggah Bukti Transfer'}
                                                    </Button>
                                                </form>
                                            ) : (
                                                <p className="text-[11px] text-neutral-500 italic">
                                                    Pembeli belum mengunggah bukti transfer.
                                                </p>
                                            )
                                        )}
                                    </div>

                                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border rounded text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
                                        <strong>Pemberitahuan Kas Organisasi:</strong>
                                        <p>
                                            Bagian kas daerah (Ekop) dan kas provinsi (DPW) tercatat berstatus{' '}
                                            <span className="font-bold text-amber-700 uppercase">Hutang Penjual ke Kas</span>{' '}
                                            dan akan ditagih oleh pengurus wilayah setelah barang sampai.
                                        </p>
                                    </div>
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
                                            <div className="font-bold text-xs text-neutral-800 dark:text-neutral-200">
                                                Scan QRIS Menggunakan Aplikasi Bank atau E-Wallet:
                                            </div>
                                            <div className="max-w-[200px] mx-auto p-2 bg-white rounded border border-neutral-300">
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
                                        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded text-center space-y-2">
                                            <p className="font-bold text-neutral-700 dark:text-neutral-300">
                                                Gateway DOKU SNAP Aktif
                                            </p>
                                            <p className="text-[11px] text-neutral-500">
                                                Invoice nomor: <strong>{order.order_number}</strong> telah siap di gateway DOKU. Webhook DOKU akan otomatis mengubah status menjadi LUNAS begitu pembayaran diselesaikan.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* 2. Delivery Proof & Reception Card */}
                        <Card className="border border-neutral-300 dark:border-neutral-800">
                            <CardHeader className="py-3 bg-neutral-50 dark:bg-neutral-900 border-b">
                                <div className="flex items-center gap-2">
                                    <PackageCheck className="h-4 w-4 text-emerald-700" />
                                    <CardTitle className="text-sm">Konfirmasi Penerimaan Barang (Delivery Proof)</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4 text-xs">
                                {order.delivery_receipt_path ? (
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
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
                                                className="text-xs font-bold text-emerald-700 underline flex items-center gap-0.5"
                                            >
                                                Lihat Bukti Foto <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>

                                        <div className="w-48 h-32 border border-neutral-300 rounded overflow-hidden bg-white">
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
                                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                            Saat pesanan sampai, pembeli wajib mengonfirmasi penerimaan dengan menginput jumlah unit yang diterima serta mengunggah foto barang/paket sebagai bukti transparansi.
                                        </p>

                                        {isBuyer ? (
                                            <Button
                                                type="button"
                                                onClick={() => setIsDeliveryModalOpen(true)}
                                                className="w-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
                                            >
                                                <PackageCheck className="h-4 w-4" />
                                                Konfirmasi Terima Barang Sekarang
                                            </Button>
                                        ) : (
                                            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500 italic text-[11px]">
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
                        <Card className="border border-neutral-300 dark:border-neutral-800">
                            <CardHeader className="py-3 bg-neutral-50 dark:bg-neutral-900 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Truck className="h-4 w-4 text-emerald-700" />
                                        <CardTitle className="text-xs">Pelacakan Resi (Biteship)</CardTitle>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
                                        {order.shipping_courier}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-xs">
                                <div>
                                    <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">
                                        Nomor Resi Pengiriman:
                                    </span>
                                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                                        <span>{order.biteship_waybill_id || 'RESI_BELUM_TERBIT'}</span>
                                        {order.biteship_waybill_id && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(order.biteship_waybill_id)}
                                                className="h-6 text-[10px] px-2"
                                            >
                                                Salin
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
                                            className="w-full text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5 h-8"
                                        >
                                            <Truck className="h-3.5 w-3.5 text-emerald-400" />
                                            <span>Lacak Pergerakan di Biteship</span>
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
                                        <span>Ongkos Kirim ({order.shipping_courier}):</span>
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
                                className="w-full text-xs p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold focus:ring-1 focus:ring-emerald-700"
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
                                className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-200 file:text-neutral-800 hover:file:bg-neutral-300 cursor-pointer"
                            />
                            <p className="text-[10px] text-neutral-500 mt-1">
                                Foto akan dikompresi otomatis ke format WebP HD (di bawah 300KB) untuk arsip sistem dan dasar transparansi kas pengurus.
                            </p>

                            {deliveryPreview && (
                                <div className="mt-3 w-40 h-28 border border-neutral-300 rounded overflow-hidden">
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
                                className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                            >
                                {deliveryForm.processing ? 'Menyimpan & Mengompres...' : 'Konfirmasi Penerimaan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MarketplaceLayout>
    );
}
