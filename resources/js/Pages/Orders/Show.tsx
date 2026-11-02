import React, { useState, useEffect, useRef } from 'react';
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
    AlertCircle,
    QrCode,
    Check,
    Sparkles,
    XCircle,
    AlertTriangle,
    Edit3,
    Navigation,
    ShieldCheck,
    Printer,
} from 'lucide-react';

interface Props {
    order: any;
}

const CANCEL_REASONS = [
    'Ingin mengubah alamat pengiriman',
    'Ingin mengubah rincian pesanan (produk/jumlah)',
    'Menemukan harga yang lebih murah di tempat lain',
    'Ingin mengganti metode pembayaran',
    'Lainnya / Tidak jadi membeli saat ini',
];

export default function OrderShow({ order }: Props) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;

    const isBuyer = currentUser?.id === order.buyer_id;
    const isSeller = currentUser?.id === order.seller_id;
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin_ekop';

    const isPaid = order.payment_status === 'paid';
    const isCancelled = order.payment_status === 'cancelled';
    const isExpired = order.payment_status === 'expired';
    const isAwaitingConfirmation = order.payment_status === 'awaiting_seller_confirmation';
    const isPending = order.payment_status === 'pending';
    const isManual = order.payment_method_type === 'manual_transfer';
    const isVa = order.payment_method_type === 'virtual_account' || !!order.pg_va_number;
    const isDelivered = order.shipping_status === 'delivered';

    // State for Copy Feedback
    const [copiedText, setCopiedText] = useState<string | null>(null);

    // Modal States
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [justPaidAlert, setJustPaidAlert] = useState(false);

    // Tracking Modal State (In-App Live Courier Tracking)
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingData, setTrackingData] = useState<any>(null);
    const [trackingError, setTrackingError] = useState<string | null>(null);

    const openTrackingModal = async () => {
        setIsTrackingModalOpen(true);
        if (!trackingData) {
            setTrackingLoading(true);
            setTrackingError(null);
            try {
                const res = await fetch(route('orders.track', order.order_number), {
                    headers: { Accept: 'application/json' },
                });
                const json = await res.json();
                if (json.success && json.data) {
                    setTrackingData(json.data);
                } else if (json.data) {
                    setTrackingData(json.data);
                } else {
                    setTrackingError(json.message || 'Status resi belum terdaftar di kurir logistik.');
                }
            } catch (err) {
                setTrackingError('Gagal memuat status pelacakan kurir.');
            } finally {
                setTrackingLoading(false);
            }
        }
    };

    // 1. Countdown Timer (24-Hour / 23:59:59 timer ticking live)
    const [timeLeftFormatted, setTimeLeftFormatted] = useState<string>('23:59:59');
    const [isTimerEnded, setIsTimerEnded] = useState(false);

    useEffect(() => {
        if (!isPending && !isAwaitingConfirmation) return;

        // Target expiration timestamp
        const expiryTime = order.payment_expires_at
            ? new Date(order.payment_expires_at).getTime()
            : new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = expiryTime - now;

            if (distance <= 0) {
                setTimeLeftFormatted('00:00:00');
                setIsTimerEnded(true);
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const pad = (n: number) => n.toString().padStart(2, '0');
            setTimeLeftFormatted(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [order.payment_expires_at, order.created_at, isPending, isAwaitingConfirmation]);

    // 2. Real-Time Auto-Callback Polling (Every 3 seconds while pending)
    const audioPlayedRef = useRef(false);

    const playCelebrationSound = () => {
        if (audioPlayedRef.current) return;
        audioPlayedRef.current = true;
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            // Melodic celebration arpeggio: C5 -> E5 -> G5 -> C6
            const chord = [523.25, 659.25, 783.99, 1046.5];
            chord.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                gain.gain.setValueAtTime(0.2, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.35);
            });
        } catch (err) {
            console.log('Audio autoplay blocked or unavailable', err);
        }
    };

    useEffect(() => {
        if (!isPending) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(route('orders.payment-status', order.order_number), {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.is_paid) {
                        clearInterval(pollInterval);
                        playCelebrationSound();
                        setJustPaidAlert(true);
                        router.reload();
                    } else if (data.status === 'cancelled' || data.status === 'expired') {
                        clearInterval(pollInterval);
                        router.reload();
                    }
                }
            } catch (err) {
                // Ignore transient network hiccups
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [isPending, order.order_number]);

    // 3. Form for Upload Transfer Receipt
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

    // 4. Form for Cancel Order
    const cancelForm = useForm({
        reason: CANCEL_REASONS[0],
        custom_reason: '',
    });

    const submitCancelOrder = (e: React.FormEvent) => {
        e.preventDefault();
        const finalReason =
            cancelForm.data.reason === 'Lainnya / Tidak jadi membeli saat ini' && cancelForm.data.custom_reason.trim()
                ? cancelForm.data.custom_reason.trim()
                : cancelForm.data.reason;

        cancelForm.transform(() => ({ reason: finalReason }));
        cancelForm.post(route('orders.cancel', order.order_number), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCancelModalOpen(false);
            },
        });
    };

    // 5. Form for Change Address
    const currentAddr = order.shipping_address || {};
    const addressForm = useForm({
        recipient_name: currentAddr.recipient_name || '',
        recipient_phone: currentAddr.recipient_phone || currentAddr.phone || '',
        address: currentAddr.address || currentAddr.address_line || '',
        notes: currentAddr.notes || '',
        lat: currentAddr.lat || -7.2825,
        lng: currentAddr.lng || 112.7638,
    });

    const [isDetectingGps, setIsDetectingGps] = useState(false);
    const handleDetectGps = () => {
        if (!navigator.geolocation) {
            alert('Geolocation tidak didukung oleh browser Anda.');
            return;
        }
        setIsDetectingGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                addressForm.setData((prev) => ({
                    ...prev,
                    lat: parseFloat(pos.coords.latitude.toFixed(6)),
                    lng: parseFloat(pos.coords.longitude.toFixed(6)),
                }));
                setIsDetectingGps(false);
            },
            () => {
                alert('Gagal mendeteksi koordinat GPS otomatis. Izin lokasi mungkin ditolak.');
                setIsDetectingGps(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const submitUpdateAddress = (e: React.FormEvent) => {
        e.preventDefault();
        addressForm.post(route('orders.update-address', order.order_number), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddressModalOpen(false);
            },
        });
    };

    // 6. Form for Confirm Delivery Modal
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

    // Confirm Payment for Seller
    const paymentConfirmForm = useForm({});
    const submitConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Konfirmasi bahwa dana pembayaran telah diterima dan verifikasi status LUNAS?')) {
            paymentConfirmForm.post(route('orders.confirm-payment', order.order_number), {
                preserveScroll: true,
            });
        }
    };

    // Sandbox Simulation Form
    const submitSimulateQris = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            confirm(
                'Simulasikan pembayaran QRIS berhasil lunas? Status pesanan akan otomatis terverifikasi LUNAS dan penjemputan kurir pengiriman akan diproses.'
            )
        ) {
            paymentConfirmForm.post(route('orders.simulate-qris-paid', order.order_number), {
                preserveScroll: true,
            });
        }
    };

    const [requestPickupProcessing, setRequestPickupProcessing] = useState(false);
    const submitRequestPickup = (e: React.FormEvent) => {
        e.preventDefault();
        setRequestPickupProcessing(true);
        router.post(route('orders.request-pickup', order.order_number), {}, {
            preserveScroll: true,
            onFinish: () => setRequestPickupProcessing(false),
        });
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
                    <Link
                        href={route('orders.my-orders')}
                        className="hover:text-[#ee4d2d] flex items-center gap-1 font-semibold"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Pesanan Saya
                    </Link>
                </nav>

                {/* SHOPEE PAYMENT SUCCESS BANNER */}
                {isPaid && (
                    <div className="bg-gradient-to-r from-[#ee4d2d] to-orange-500 text-white rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-4 animate-in fade-in duration-500">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto border-2 border-white/40">
                            <CheckCircle2 className="h-9 w-9 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                                Hore, Pesananmu berhasil!
                            </h2>
                            <p className="text-xs sm:text-sm text-orange-100 max-w-md mx-auto font-medium">
                                Pembayaran telah terverifikasi lunas. Penjual dan kurir sedang mempersiapkan pesananmu.
                            </p>
                        </div>
                        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                            <Link href={route('home')}>
                                <Button
                                    variant="outline"
                                    className="border-white/60 text-white hover:bg-white/20 rounded-xl px-6 text-xs font-bold"
                                >
                                    Beranda
                                </Button>
                            </Link>
                            <Link href={route('orders.my-orders')}>
                                <Button className="bg-white text-[#ee4d2d] hover:bg-orange-50 rounded-xl px-6 text-xs font-extrabold shadow-md">
                                    Pesanan Saya
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* CANCELLED BANNER */}
                {isCancelled && (
                    <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-3xl p-6 text-neutral-800 dark:text-neutral-200 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600">
                                <XCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-black text-base text-neutral-900 dark:text-white">
                                    Pesanan Ini Telah Dibatalkan
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    Alasan: <strong>{order.cancellation_reason || 'Dibatalkan oleh pembeli'}</strong>
                                </p>
                            </div>
                        </div>
                        {order.cancelled_at && (
                            <p className="text-[11px] text-neutral-500">
                                Waktu Pembatalan: {new Date(order.cancelled_at).toLocaleString('id-ID')} &bull; Stok produk telah dikembalikan otomatis.
                            </p>
                        )}
                    </div>
                )}

                {/* EXPIRED BANNER */}
                {isExpired && (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-900 shadow-sm space-y-2">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                            <div>
                                <h3 className="font-black text-base">Batas Waktu Pembayaran Habis (Kedaluwarsa)</h3>
                                <p className="text-xs text-amber-700">
                                    Pesanan ini telah kedaluwarsa karena tidak diselesaikan dalam 24 jam. Stok produk telah dirilis kembali.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* SHOPEE NOTICE COUNTDOWN BAR (When Pending Payment) */}
                {(isPending || isAwaitingConfirmation) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#ee4d2d]/10 flex items-center justify-center text-[#ee4d2d] shrink-0">
                                <Clock className="h-5 w-5 animate-pulse" />
                            </div>
                            <div>
                                <div className="text-xs sm:text-sm font-black text-neutral-900">
                                    Bayar dalam {timeLeftFormatted} dengan {isManual ? 'Transfer Manual' : 'QRIS Dinamis Otomatis'}
                                </div>
                                <div className="text-[11px] text-neutral-600">
                                    Pesanan akan otomatis dibatalkan jika tidak diselesaikan sebelum batas waktu 24 jam.
                                </div>
                            </div>
                        </div>

                        {/* Shopee Action Buttons: Ubah Alamat & Batalkan Pesanan */}
                        {isBuyer && (
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="text-xs font-bold rounded-xl border-orange-200 text-[#ee4d2d] hover:bg-orange-100/50 h-8 gap-1"
                                >
                                    <Edit3 className="h-3 w-3" />
                                    Ubah Alamat
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCancelModalOpen(true)}
                                    className="text-xs font-bold rounded-xl border-neutral-300 text-neutral-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 h-8 gap-1"
                                >
                                    <XCircle className="h-3 w-3" />
                                    Batalkan Pesanan
                                </Button>
                            </div>
                        )}
                    </div>
                )}

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
                        ) : isCancelled ? (
                            <Badge variant="destructive" className="text-xs gap-1 py-1 px-3 font-bold">
                                <XCircle className="h-3.5 w-3.5" />
                                DIBATALKAN
                            </Badge>
                        ) : isExpired ? (
                            <Badge className="text-xs gap-1 py-1 px-3 bg-neutral-600 text-white font-bold">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                KEDALUWARSA
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
                                                                {paymentConfirmForm.processing
                                                                    ? 'Memproses...'
                                                                    : 'Konfirmasi Dana Masuk (Set Status LUNAS)'}
                                                            </Button>
                                                        </form>
                                                    </div>
                                                )}
                                            </div>
                                        ) : isBuyer ? (
                                            <form
                                                onSubmit={submitTransferReceipt}
                                                className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 border rounded-xl"
                                            >
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
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : isVa ? (
                            /* VIRTUAL ACCOUNT PAYMENT CARD */
                            <Card className="border border-neutral-200 shadow-md rounded-2xl overflow-hidden">
                                <CardHeader className="bg-[#2b3990] text-white py-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            <CardTitle className="text-sm font-bold">
                                                Pembayaran Virtual Account Resmi
                                            </CardTitle>
                                        </div>
                                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/20 font-bold flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            VA OTOMATIS
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4 text-xs">
                                    {/* Tagihan Box */}
                                    <div className="text-center p-4 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 rounded-xl space-y-1.5">
                                        <span className="text-[11px] text-[#2b3990] font-extrabold uppercase tracking-wider block">
                                            Total Tagihan Pembayaran:
                                        </span>
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-3xl font-black font-mono text-[#2b3990]">
                                                {formatRupiah(order.grand_total)}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(String(order.grand_total), 'nominal')}
                                                className="text-xs h-7 border-indigo-200 text-[#2b3990] hover:bg-indigo-50 font-bold rounded-lg px-2.5 gap-1"
                                            >
                                                {copiedText === 'nominal' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                {copiedText === 'nominal' ? 'Tersalin' : 'Salin'}
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-neutral-500">
                                            Transfer tepat sesuai nominal di atas tanpa pembulatan agar terverifikasi otomatis.
                                        </p>
                                    </div>

                                    {/* Virtual Account Number Box */}
                                    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 rounded-2xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                                <CreditCard className="h-4 w-4 text-[#2b3990]" />
                                                {order.pg_payment_name || 'Nomor Rekening Virtual Account:'}
                                            </span>
                                            <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[10px]">
                                                {order.pg_channel_code || 'VA'}
                                            </Badge>
                                        </div>

                                        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 flex items-center justify-between gap-3">
                                            <span className="text-xl md:text-2xl font-black font-mono tracking-wider text-neutral-900 dark:text-neutral-100">
                                                {order.pg_va_number || '88019' + order.order_number.replace(/\D/g, '')}
                                            </span>
                                            <Button
                                                type="button"
                                                onClick={() => copyToClipboard(order.pg_va_number || '88019' + order.order_number.replace(/\D/g, ''), 'va')}
                                                className="bg-[#2b3990] hover:bg-[#202b6d] text-white text-xs font-bold gap-1.5 h-8 px-3 rounded-lg shadow-xs shrink-0"
                                            >
                                                {copiedText === 'va' ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5" /> Tersalin!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3.5 w-3.5" /> Salin No. VA
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Panduan Pembayaran VA */}
                                        <div className="border-t pt-3 space-y-2">
                                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                                                Petunjuk Pembayaran:
                                            </span>
                                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl font-sans text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300 whitespace-pre-line border border-neutral-200">
                                                {order.pg_payment_instructions ||
                                                    "1. Buka Mobile Banking atau ATM bank Anda.\n2. Pilih menu Transfer > Virtual Account.\n3. Masukkan nomor Virtual Account di atas.\n4. Periksa nama penerima dan nominal tagihan.\n5. Masukkan PIN Anda untuk menyelesaikan pembayaran."}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Auto verification / Realtime notification indicator */}
                                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 text-center space-y-2">
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2b3990] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2b3990]"></span>
                                            </span>
                                            <span>
                                                Pengecekan Otomatis Realtime Aktif: Sistem akan otomatis memverifikasi pesanan menjadi LUNAS seketika setelah pembayaran VA diterima.
                                            </span>
                                        </div>

                                        {!isPaid && !isCancelled && !isExpired && (
                                            <form onSubmit={submitSimulateQris} className="pt-1">
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    disabled={paymentConfirmForm.processing}
                                                    className="w-full text-xs font-bold border-indigo-200 text-[#2b3990] hover:bg-indigo-50 h-8 gap-1"
                                                >
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    <span>Simulasi Bayar Selesai (Verifikasi Instan LUNAS & Pickup Kurir)</span>
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            /* QRIS DINAMIS PAYMENT CARD */
                            <Card className="border border-neutral-200 shadow-md rounded-2xl overflow-hidden">
                                <CardHeader className="bg-[#ee4d2d] text-white py-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <QrCode className="h-5 w-5" />
                                            <CardTitle className="text-sm font-bold">
                                                Pembayaran Resmi QRIS Dinamis
                                            </CardTitle>
                                        </div>
                                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/20 font-bold flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" />
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
                                                    alt="QRIS Dinamis Otomatis"
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
                                            {qrData && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(qrData, 'qris')}
                                                    className="text-xs h-8 border-orange-200 text-[#ee4d2d] hover:bg-orange-50 font-bold rounded-lg px-3 gap-1.5"
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

                                    {/* Auto verification / Realtime notification indicator */}
                                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 text-center space-y-2">
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ee4d2d] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ee4d2d]"></span>
                                            </span>
                                            <span>
                                                Pengecekan Otomatis Realtime Aktif: Sistem akan otomatis memverifikasi pesanan menjadi LUNAS seketika setelah pembayaran berhasil.
                                            </span>
                                        </div>

                                        {!isPaid && !isCancelled && !isExpired && (
                                            <form onSubmit={submitSimulateQris} className="pt-1">
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    disabled={paymentConfirmForm.processing}
                                                    className="w-full text-xs font-bold border-orange-200 text-[#ee4d2d] hover:bg-orange-50 h-8 gap-1"
                                                >
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    <span>Simulasi Bayar Selesai (Verifikasi Instan LUNAS & Pickup Kurir)</span>
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

                                        {isBuyer && isPaid ? (
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
                                                {isPaid
                                                    ? 'Menunggu pembeli melakukan konfirmasi dan mengunggah foto bukti penerimaan fisik.'
                                                    : 'Konfirmasi penerimaan dibuka setelah pesanan selesai dibayar dan barang dikirimkan.'}
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
                                    <div className="space-y-2">
                                        {/* CETAK LABEL RESMI: KHUSUS PENJUAL DAN ADMIN (PEMBELI DILARANG/TIDAK DITAMPILKAN) */}
                                        {(isSeller || isAdmin) && (
                                            <>
                                                <a
                                                    href={route('orders.shipping-label', order.order_number)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block"
                                                >
                                                    <Button
                                                        type="button"
                                                        className="w-full text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white gap-1.5 h-9 rounded-xl shadow-xs"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span>Cetak Label Pengiriman Resmi (A6)</span>
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                </a>

                                                {order.biteship_label_url && (
                                                    <a
                                                        href={order.biteship_label_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block"
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="w-full text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1.5 h-8 rounded-xl"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            <span>Download Dokumen Resi Pengiriman</span>
                                                        </Button>
                                                    </a>
                                                )}
                                            </>
                                        )}

                                        {/* LACAK PERGERAKAN KURIR (IN-APP MODAL: TANPA LINK KELUAR, DAPAT DIAKSES PEMBELI, PENJUAL & ADMIN) */}
                                        <Button
                                            type="button"
                                            onClick={openTrackingModal}
                                            variant="outline"
                                            className="w-full text-xs font-bold border-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 gap-1.5 h-9 rounded-xl text-neutral-700 dark:text-neutral-200"
                                        >
                                            <Truck className="h-4 w-4 text-[#ee4d2d]" />
                                            <span>Lacak Pergerakan Kurir</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        <p className="text-[10px] text-neutral-500 leading-normal">
                                            Resi akan otomatis terbit saat penjual melakukan request pickup atau konfirmasi pengiriman kurir.
                                        </p>
                                        {isPaid && (
                                            <div className="space-y-2 pt-1">
                                                {(isSeller || isAdmin) && (
                                                    <>
                                                        <form onSubmit={submitRequestPickup}>
                                                            <Button
                                                                type="submit"
                                                                disabled={requestPickupProcessing}
                                                                className="w-full text-xs font-bold bg-[#2b3990] hover:bg-[#202b6d] text-white gap-1.5 h-9 rounded-xl shadow-xs"
                                                            >
                                                                <Truck className="h-3.5 w-3.5" />
                                                                <span>
                                                                    {requestPickupProcessing
                                                                        ? 'Meminta Pickup...'
                                                                        : 'Request Pickup Kurir Pengiriman'}
                                                                </span>
                                                            </Button>
                                                        </form>

                                                        <a
                                                            href={route('orders.shipping-label', order.order_number)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="block"
                                                        >
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="w-full text-xs font-bold border-orange-200 text-[#ee4d2d] hover:bg-orange-50 gap-1.5 h-8 rounded-xl"
                                                            >
                                                                <Printer className="h-3.5 w-3.5" />
                                                                <span>Preview & Cetak Label Thermal (A6)</span>
                                                            </Button>
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
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
                                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 text-[11px] space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 font-bold text-neutral-800 dark:text-neutral-200">
                                            <MapPin className="h-3.5 w-3.5 text-[#ee4d2d]" />
                                            Alamat Pengiriman
                                        </div>
                                        {isBuyer && (isPending || isAwaitingConfirmation) && (
                                            <button
                                                type="button"
                                                onClick={() => setIsAddressModalOpen(true)}
                                                className="text-[10px] text-[#ee4d2d] font-bold hover:underline flex items-center gap-0.5"
                                            >
                                                <Edit3 className="h-3 w-3" />
                                                Ubah
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-neutral-700 dark:text-neutral-300">
                                        <strong>{order.shipping_address?.recipient_name}</strong> ({order.shipping_address?.recipient_phone})
                                    </p>
                                    <p className="text-neutral-500">
                                        {order.shipping_address?.address}
                                    </p>
                                    {order.shipping_address?.notes && (
                                        <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                                            Catatan: {order.shipping_address.notes}
                                        </p>
                                    )}
                                    <span className="text-[10px] font-mono text-neutral-400 block">
                                        Koordinat: {order.shipping_address?.lat}, {order.shipping_address?.lng}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* MODAL 1: BATALKAN PESANAN (Shopee Cancel Flow) */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent onClose={() => setIsCancelModalOpen(false)}>
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-neutral-900 flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            Batalkan Pesanan
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Pilih alasan pembatalan Anda. Setelah dibatalkan, tagihan akan ditutup dan stok produk akan dikembalikan ke toko.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCancelOrder} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-800 block">
                                Alasan Pembatalan:
                            </label>
                            <div className="space-y-2">
                                {CANCEL_REASONS.map((reason) => (
                                    <label
                                        key={reason}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                                            cancelForm.data.reason === reason
                                                ? 'border-[#ee4d2d] bg-orange-50/50 font-bold text-[#ee4d2d]'
                                                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="cancellation_reason"
                                            value={reason}
                                            checked={cancelForm.data.reason === reason}
                                            onChange={(e) => cancelForm.setData('reason', e.target.value)}
                                            className="text-[#ee4d2d] focus:ring-[#ee4d2d]"
                                        />
                                        <span>{reason}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {cancelForm.data.reason === 'Lainnya / Tidak jadi membeli saat ini' && (
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 mb-1">
                                    Tuliskan Alasan Anda (Opsional):
                                </label>
                                <textarea
                                    rows={2}
                                    value={cancelForm.data.custom_reason}
                                    onChange={(e) => cancelForm.setData('custom_reason', e.target.value)}
                                    placeholder="Contoh: Ingin mengubah variasi atau memesan kembali nanti..."
                                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:border-[#ee4d2d] focus:ring-[#ee4d2d]"
                                />
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCancelModalOpen(false)}
                                className="text-xs rounded-xl"
                            >
                                Kembali
                            </Button>
                            <Button
                                type="submit"
                                disabled={cancelForm.processing}
                                className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl"
                            >
                                {cancelForm.processing ? 'Membatalkan...' : 'Konfirmasi Batalkan Pesanan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 2: UBAH ALAMAT PENGIRIMAN (Shopee Change Address Flow) */}
            <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                <DialogContent onClose={() => setIsAddressModalOpen(false)}>
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-neutral-900 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-[#ee4d2d]" />
                            Ubah Alamat Pengiriman
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Perbarui detail penerima dan alamat pengiriman sebelum pembayaran dilakukan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitUpdateAddress} className="space-y-3.5 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 mb-1">
                                    Nama Penerima:
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={addressForm.data.recipient_name}
                                    onChange={(e) => addressForm.setData('recipient_name', e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:border-[#ee4d2d] focus:ring-[#ee4d2d]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 mb-1">
                                    Nomor Telepon / WhatsApp:
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={addressForm.data.recipient_phone}
                                    onChange={(e) => addressForm.setData('recipient_phone', e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:border-[#ee4d2d] focus:ring-[#ee4d2d]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 mb-1">
                                Alamat Lengkap (Jalan, No Rumah, RT/RW, Kecamatan, Kota/Kab):
                            </label>
                            <textarea
                                rows={2}
                                required
                                value={addressForm.data.address}
                                onChange={(e) => addressForm.setData('address', e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:border-[#ee4d2d] focus:ring-[#ee4d2d]"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-neutral-800">
                                    Titik Koordinat Pengiriman (Lat / Lng):
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isDetectingGps}
                                    onClick={handleDetectGps}
                                    className="h-6 text-[10px] px-2 border-orange-200 text-[#ee4d2d] hover:bg-orange-50 gap-1 rounded-lg"
                                >
                                    <Navigation className="h-2.5 w-2.5" />
                                    {isDetectingGps ? 'Mendeteksi...' : 'Deteksi GPS Saya'}
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    step="any"
                                    value={addressForm.data.lat}
                                    onChange={(e) => addressForm.setData('lat', parseFloat(e.target.value) || 0)}
                                    placeholder="Latitude"
                                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 font-mono"
                                />
                                <input
                                    type="number"
                                    step="any"
                                    value={addressForm.data.lng}
                                    onChange={(e) => addressForm.setData('lng', parseFloat(e.target.value) || 0)}
                                    placeholder="Longitude"
                                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 mb-1">
                                Catatan Pengiriman (Opsional):
                            </label>
                            <input
                                type="text"
                                value={addressForm.data.notes}
                                onChange={(e) => addressForm.setData('notes', e.target.value)}
                                placeholder="Contoh: Rumah pagar hitam samping masjid"
                                className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:border-[#ee4d2d] focus:ring-[#ee4d2d]"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddressModalOpen(false)}
                                className="text-xs rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={addressForm.processing}
                                className="text-xs font-bold bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl"
                            >
                                {addressForm.processing ? 'Menyimpan...' : 'Simpan Alamat Baru'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 3: KONFIRMASI TERIMA BARANG */}
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

            {/* MODAL 4: LACAK PERGERAKAN KURIR (IN-APP DIALOG) */}
            <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
                <DialogContent onClose={() => setIsTrackingModalOpen(false)}>
                    <DialogHeader className="bg-[#ee4d2d] -m-6 mb-4 p-5 text-white rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-white" />
                                <DialogTitle className="text-white text-base font-bold">
                                    Lacak Pergerakan Kurir
                                </DialogTitle>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-bold uppercase">
                                {order.shipping_courier || 'Kurir'}
                            </span>
                        </div>
                        <DialogDescription className="text-white/80 text-xs mt-1">
                            Nomor Resi: <strong className="font-mono text-white font-bold">{order.biteship_waybill_id}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        {trackingLoading ? (
                            <div className="py-12 text-center space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ee4d2d] mx-auto" />
                                <p className="text-xs text-neutral-500 font-medium">Menghubungkan ke sistem lacak kurir...</p>
                            </div>
                        ) : trackingError ? (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center space-y-2">
                                <AlertTriangle className="h-6 w-6 text-[#ee4d2d] mx-auto" />
                                <p className="text-xs font-bold text-neutral-800">{trackingError}</p>
                                <p className="text-[11px] text-neutral-500">
                                    Resi telah aktif. Kurir sedang dalam proses penjemputan barang di lokasi pengirim.
                                </p>
                            </div>
                        ) : trackingData ? (
                            <div className="space-y-4">
                                {/* Status Card */}
                                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-neutral-500 uppercase font-bold block">Status Terkini:</span>
                                        <span className="text-xs font-extrabold text-[#ee4d2d]">
                                            {trackingData.status_label || trackingData.status || 'Sedang Diproses'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-neutral-500 uppercase font-bold block">Layanan:</span>
                                        <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                            {trackingData.service_type || order.shipping_service || 'REGULER'}
                                        </span>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-[#ee4d2d]" />
                                        Riwayat Perjalanan Paket:
                                    </h4>

                                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-700">
                                        {trackingData.history && trackingData.history.length > 0 ? (
                                            trackingData.history.map((event: any, idx: number) => {
                                                const isLatest = idx === 0;
                                                return (
                                                    <div key={idx} className="relative">
                                                        <div
                                                            className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 ${
                                                                isLatest
                                                                    ? 'bg-[#ee4d2d] border-white ring-2 ring-orange-200'
                                                                    : 'bg-neutral-400 border-white'
                                                            }`}
                                                        />
                                                        <div className="space-y-0.5">
                                                            <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                                {event.note}
                                                            </div>
                                                            <div className="text-[10px] font-mono text-neutral-500">
                                                                {event.updated_at ? new Date(event.updated_at).toLocaleString('id-ID') : '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-xs text-neutral-500 italic">
                                                Resi terdaftar. Paket sedang menunggu kurir melakukan penjemputan awal di alamat pengirim.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsTrackingModalOpen(false)}
                            className="text-xs font-bold rounded-xl"
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MarketplaceLayout>
    );
}
