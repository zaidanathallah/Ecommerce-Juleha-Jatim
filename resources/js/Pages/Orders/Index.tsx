import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { formatRupiah } from '@/lib/utils';
import {
    ShoppingBag,
    Store,
    Truck,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Search,
    ExternalLink,
    AlertCircle,
    Package
} from 'lucide-react';

interface OrderItem {
    id: number;
    product_title: string;
    final_price: number;
    quantity: number;
    product?: {
        id: number;
        slug: string;
        image_url: string;
    };
}

interface OrderData {
    id: number;
    order_number: string;
    grand_total: number;
    payment_status: string;
    shipping_status: string;
    shipping_courier: string;
    shipping_service: string;
    biteship_waybill_id?: string | null;
    created_at: string;
    seller: {
        id: number;
        name: string;
        shop_name?: string | null;
        region_name?: string | null;
    };
    items: OrderItem[];
}

interface Props {
    orders: {
        data: OrderData[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    activeTab: string;
    counts: {
        semua: number;
        belum_bayar: number;
        dikemas: number;
        dikirim: number;
        selesai: number;
        dibatalkan: number;
        pengembalian: number;
    };
}

const TABS = [
    { key: 'semua', label: 'Semua' },
    { key: 'belum_bayar', label: 'Belum Bayar' },
    { key: 'dikemas', label: 'Dikemas' },
    { key: 'dikirim', label: 'Dikirim' },
    { key: 'selesai', label: 'Selesai' },
    { key: 'dibatalkan', label: 'Dibatalkan' },
    { key: 'pengembalian', label: 'Pengembalian Dana' },
];

export default function OrdersIndex({ orders, activeTab, counts }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleTabChange = (key: string) => {
        router.visit(route('orders.my-orders', { tab: key }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const filteredOrders = orders.data.filter((order) => {
        if (!searchTerm) return true;
        const matchNumber = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchProduct = order.items.some((it) =>
            it.product_title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchNumber || matchProduct;
    });

    const getStatusDisplay = (order: OrderData) => {
        if (order.payment_status === 'pending') {
            return {
                text: 'MENUNGGU PEMBAYARAN',
                color: 'text-[#ee4d2d]',
                badge: 'bg-orange-50 text-[#ee4d2d] border-[#ee4d2d]',
                icon: Clock,
            };
        }
        if (order.shipping_status === 'delivered') {
            return {
                text: 'SELESAI',
                color: 'text-green-600',
                badge: 'bg-green-50 text-green-700 border-green-200',
                icon: CheckCircle2,
            };
        }
        if (order.shipping_status === 'in_transit') {
            return {
                text: 'SEDANG DIKIRIM',
                color: 'text-blue-600',
                badge: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: Truck,
            };
        }
        if (order.payment_status === 'paid' && order.shipping_status === 'pickup_requested') {
            return {
                text: 'KURIR SEDANG DIJEMPUT',
                color: 'text-amber-600',
                badge: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Package,
            };
        }
        if (order.payment_status === 'paid') {
            return {
                text: 'SEDANG DIKEMAS',
                color: 'text-amber-600',
                badge: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Package,
            };
        }
        return {
            text: 'DIBATALKAN',
            color: 'text-neutral-500',
            badge: 'bg-neutral-100 text-neutral-600 border-neutral-200',
            icon: XCircle,
        };
    };

    return (
        <MarketplaceLayout>
            <Head title="Pesanan Saya - Juleha Marketplace" />

            <div className="max-w-4xl mx-auto space-y-4">
                {/* 1. Header Bar */}
                <div className="flex items-center justify-between pb-2 border-b">
                    <div>
                        <h1 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-[#ee4d2d]" />
                            Pesanan Saya
                        </h1>
                        <p className="text-xs text-neutral-500">
                            Kelola dan pantau seluruh transaksi belanja perlengkapan sembelih halal Anda.
                        </p>
                    </div>

                    <div className="relative w-64 hidden sm:block">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari nomor pesanan / produk..."
                            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full border border-neutral-300 focus:border-[#ee4d2d] focus:ring-[#ee4d2d]"
                        />
                    </div>
                </div>

                {/* 2. Shopee-Style Tabs Header */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-x-auto">
                    <div className="flex items-center min-w-max">
                        {TABS.map((tab) => {
                            const count = (counts as any)[tab.key] ?? 0;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`px-4 py-3 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
                                        isActive
                                            ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d] bg-orange-50/40 dark:bg-orange-950/20'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:text-[#ee4d2d]'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    {count > 0 && (
                                        <span
                                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                                isActive
                                                    ? 'bg-[#ee4d2d] text-white'
                                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center space-y-3">
                            <div className="h-16 w-16 bg-orange-50 dark:bg-orange-950/40 text-[#ee4d2d] rounded-full flex items-center justify-center mx-auto">
                                <ShoppingBag className="h-8 w-8" />
                            </div>
                            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                                Belum ada pesanan
                            </h3>
                            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                                Anda belum memiliki pesanan pada status ini. Silakan jelajahi katalog produk untuk menemukan perlengkapan halal terstandarisasi.
                            </p>
                            <Link href={route('marketplace')}>
                                <Button
                                    size="sm"
                                    className="bg-[#ee4d2d] hover:bg-[#d03e1f] text-white font-bold text-xs rounded-full px-6 shadow-md mt-2"
                                >
                                    Belanja Sekarang
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const status = getStatusDisplay(order);
                            const StatusIcon = status.icon;
                            return (
                                <Card
                                    key={order.id}
                                    className="border border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md transition overflow-hidden rounded-2xl"
                                >
                                    {/* Order Card Header */}
                                    <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-950 border-b flex flex-wrap items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded bg-orange-100 dark:bg-orange-950 text-[#ee4d2d]">
                                                <Store className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="font-extrabold text-neutral-900 dark:text-white">
                                                {order.seller.shop_name || order.seller.name}
                                            </span>
                                            {order.seller.region_name && (
                                                <span className="text-[10px] text-neutral-500 font-medium">
                                                    ({order.seller.region_name})
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 font-bold text-xs">
                                            <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
                                            <span className={status.color}>{status.text}</span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <CardContent className="p-5 space-y-3">
                                        {order.items.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={route('orders.show', order.order_number)}
                                                className="flex gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 p-2 rounded-xl transition cursor-pointer"
                                            >
                                                <img
                                                    src={item.product?.image_url || '/logo-juleha.jpg'}
                                                    alt={item.product_title}
                                                    className="h-16 w-16 rounded-xl object-cover border shrink-0"
                                                />
                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                                            {item.product_title}
                                                        </h4>
                                                        <span className="text-[11px] text-neutral-500">
                                                            Jumlah: {item.quantity} Unit
                                                        </span>
                                                    </div>
                                                    <div className="text-right font-mono font-bold text-xs text-[#ee4d2d]">
                                                        {formatRupiah(item.final_price)}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}

                                        {/* Order Footer & Actions */}
                                        <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3">
                                            <div className="space-y-0.5">
                                                <div className="text-[10px] text-neutral-500">
                                                    No. Pesanan: <strong className="font-mono">{order.order_number}</strong>
                                                </div>
                                                {order.biteship_waybill_id && (
                                                    <div className="text-[10px] text-blue-600 font-mono font-bold flex items-center gap-1">
                                                        <Truck className="h-3 w-3" />
                                                        Resi {order.shipping_courier}: {order.biteship_waybill_id}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <span className="text-[11px] text-neutral-500 block">Total Pesanan:</span>
                                                    <span className="font-mono font-black text-sm text-[#ee4d2d]">
                                                        {formatRupiah(order.grand_total)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Link href={route('orders.show', order.order_number)}>
                                                        {order.payment_status === 'pending' ? (
                                                            <Button
                                                                size="sm"
                                                                className="bg-[#ee4d2d] hover:bg-[#d03e1f] text-white font-bold text-xs rounded-xl shadow-xs"
                                                            >
                                                                Bayar Sekarang
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-neutral-300 text-xs font-bold rounded-xl"
                                                            >
                                                                Rincian Pesanan
                                                            </Button>
                                                        )}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </MarketplaceLayout>
    );
}

