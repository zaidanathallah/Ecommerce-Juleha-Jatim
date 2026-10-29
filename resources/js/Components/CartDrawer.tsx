import React from 'react';
import { useCart } from '@/Contexts/CartContext';
import { Link } from '@inertiajs/react';
import { formatRupiah } from '@/lib/utils';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Flame } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function CartDrawer() {
    const { items, removeFromCart, updateQuantity, totalPrice, totalItems, isCartOpen, closeCart } = useCart();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={closeCart}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white dark:bg-neutral-900 shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#ee4d2d]">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                                    Keranjang Belanja
                                </h2>
                                <span className="text-[11px] text-neutral-500 font-medium">
                                    {totalItems} item dipilih
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={closeCart}
                            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                                <div className="h-16 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                                    <ShoppingBag className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                                    Keranjang Masih Kosong
                                </h3>
                                <p className="text-xs text-neutral-500 max-w-xs">
                                    Pilih bilah sembelih atau perlengkapan halal terstandarisasi untuk dimasukkan ke keranjang Anda.
                                </p>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={closeCart}
                                    className="bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-full px-5 text-xs font-bold mt-2 shadow-sm"
                                >
                                    Mulai Belanja
                                </Button>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl flex gap-3 shadow-xs hover:border-[#ee4d2d] transition"
                                >
                                    <img
                                        src={item.image_url || '/logo-juleha.jpg'}
                                        alt={item.title}
                                        className="h-20 w-20 rounded-xl object-cover shrink-0 border border-neutral-100"
                                    />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-1">
                                                <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                                    {item.title}
                                                </h4>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-neutral-400 hover:text-red-600 p-0.5 transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] text-neutral-500 font-medium">
                                                    {item.seller_name} ({item.region_name})
                                                </span>
                                                {item.is_flash_sale && (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-red-100 text-red-600 text-[9px] font-black rounded-md">
                                                        <Flame className="h-2.5 w-2.5" /> FLASH SALE
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="space-y-0.5">
                                                <div className="font-extrabold text-xs text-[#ee4d2d]">
                                                    {formatRupiah(item.price)}
                                                </div>
                                                {item.original_price && item.original_price > item.price && (
                                                    <div className="text-[10px] text-neutral-400 line-through">
                                                        {formatRupiah(item.original_price)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 rounded bg-white dark:bg-neutral-600 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-xs font-mono font-bold px-1.5 text-neutral-900 dark:text-white">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 rounded bg-white dark:bg-neutral-600 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Checkout Button */}
                    {items.length > 0 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-500 font-medium">Total Harga Produk</span>
                                <span className="font-black text-base text-[#ee4d2d]">
                                    {formatRupiah(totalPrice)}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Link
                                    href={route('checkout.index', { slug: items[0].slug, flash_sale: items[0].is_flash_sale ? 1 : 0 })}
                                    onClick={closeCart}
                                    className="block w-full"
                                >
                                    <Button
                                        variant="default"
                                        size="lg"
                                        className="w-full bg-[#ee4d2d] hover:bg-[#d73211] rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 py-3 shadow-md text-white"
                                    >
                                        <span>Lanjut ke Pembayaran</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>

                                <button
                                    onClick={closeCart}
                                    className="w-full text-center text-xs text-neutral-500 hover:text-neutral-800 font-semibold py-1"
                                >
                                    Lanjut Pilih Produk Lain
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
