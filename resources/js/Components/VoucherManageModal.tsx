import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    X,
    Plus,
    Edit2,
    Trash2,
    Check,
    Ticket,
    Truck,
    Percent,
    DollarSign,
    Calendar,
    AlertCircle,
    Copy,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { formatRupiah } from '@/lib/utils';
import axios from 'axios';

export interface VoucherItem {
    id: number;
    code: string;
    title: string;
    description?: string | null;
    type: 'free_shipping' | 'discount_percent' | 'discount_fixed';
    discount_amount: number;
    min_spend: number;
    max_discount?: number | null;
    scope: 'global' | 'regional' | 'seller';
    created_by?: number;
    expires_at?: string | null;
    is_active: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialVouchers?: VoucherItem[];
}

export default function VoucherManageModal({ isOpen, onClose, initialVouchers = [] }: Props) {
    const [vouchers, setVouchers] = useState<VoucherItem[]>(initialVouchers);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<VoucherItem | null>(null);

    // Form fields
    const [code, setCode] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'free_shipping' | 'discount_percent' | 'discount_fixed'>('free_shipping');
    const [discountAmount, setDiscountAmount] = useState('20000');
    const [minSpend, setMinSpend] = useState('50000');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Fetch live vouchers
    const fetchVouchers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(route('vouchers.index'));
            if (res.data.success) {
                setVouchers(res.data.vouchers);
            }
        } catch (err) {
            console.error('Failed to load vouchers', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchVouchers();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOpenCreate = () => {
        setEditingVoucher(null);
        setCode('VCH' + Math.floor(1000 + Math.random() * 9000));
        setTitle('');
        setDescription('');
        setType('free_shipping');
        setDiscountAmount('20000');
        setMinSpend('50000');
        setMaxDiscount('');
        setExpiresAt('');
        setIsActive(true);
        setErrorMessage(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (v: VoucherItem) => {
        setEditingVoucher(v);
        setCode(v.code);
        setTitle(v.title);
        setDescription(v.description || '');
        setType(v.type);
        setDiscountAmount(String(v.discount_amount));
        setMinSpend(String(v.min_spend));
        setMaxDiscount(v.max_discount ? String(v.max_discount) : '');
        setExpiresAt(v.expires_at ? v.expires_at.substring(0, 10) : '');
        setIsActive(v.is_active);
        setErrorMessage(null);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!code.trim() || !title.trim() || Number(discountAmount) <= 0) {
            setErrorMessage('Kode voucher, judul, dan nominal diskon wajib diisi dengan benar.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingVoucher) {
                await axios.put(route('vouchers.update', editingVoucher.id), {
                    title: title.trim(),
                    description: description.trim(),
                    type,
                    discount_amount: Number(discountAmount),
                    min_spend: Number(minSpend) || 0,
                    max_discount: maxDiscount ? Number(maxDiscount) : null,
                    expires_at: expiresAt || null,
                    is_active: isActive,
                });
            } else {
                await axios.post(route('vouchers.store'), {
                    code: code.trim().toUpperCase(),
                    title: title.trim(),
                    description: description.trim(),
                    type,
                    discount_amount: Number(discountAmount),
                    min_spend: Number(minSpend) || 0,
                    max_discount: maxDiscount ? Number(maxDiscount) : null,
                    expires_at: expiresAt || null,
                });
            }

            await fetchVouchers();
            setIsFormOpen(false);
            setEditingVoucher(null);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Gagal menyimpan voucher. Pastikan kode belum pernah dipakai.';
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (v: VoucherItem) => {
        if (!confirm(`Hapus voucher promo '${v.code}'?`)) return;

        try {
            await axios.delete(route('vouchers.destroy', v.id));
            await fetchVouchers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus voucher.');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header Shopee-style */}
                <div className="bg-gradient-to-r from-[#ee4d2d] to-[#ff5722] p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight">Kelola Voucher Promo & Gratis Ongkir</h2>
                            <p className="text-xs text-white/90">Daftar kode promo belanja untuk memikat pembeli halal</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                    {/* Top Action Bar */}
                    {!isFormOpen && (
                        <div className="flex items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                                Total: <strong className="text-neutral-900 dark:text-white font-bold">{vouchers.length}</strong> Voucher Promo
                            </span>
                            <Button
                                size="sm"
                                onClick={handleOpenCreate}
                                className="bg-[#ee4d2d] hover:bg-[#d03e1f] text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Voucher Baru
                            </Button>
                        </div>
                    )}

                    {/* Voucher Create / Edit Form */}
                    {isFormOpen ? (
                        <form onSubmit={handleSubmit} className="bg-neutral-50 dark:bg-neutral-800/60 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
                                <h3 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Ticket className="w-4 h-4 text-[#ee4d2d]" />
                                    {editingVoucher ? `Edit Voucher '${editingVoucher.code}'` : 'Terbitkan Voucher Baru'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                                >
                                    Batal
                                </button>
                            </div>

                            {errorMessage && (
                                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                                        Kode Voucher (Tanpa Spasi)
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                                        disabled={!!editingVoucher}
                                        placeholder="Contoh: ONGKIRFREE, HEMAT10"
                                        className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                                        Tipe Voucher
                                    </label>
                                    <select
                                        value={type}
                                        onChange={(e: any) => setType(e.target.value)}
                                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]"
                                    >
                                        <option value="free_shipping">Gratis Ongkir (Subsidi Ongkos Kirim)</option>
                                        <option value="discount_fixed">Potongan Nominal Rupiah (Fixed)</option>
                                        <option value="discount_percent">Diskon Persen (%)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                                    Judul Promosi
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Contoh: Gratis Ongkir s.d Rp 20.000 Khusus Produk Halal"
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                                        {type === 'discount_percent' ? 'Persen Diskon (%)' : 'Nominal Potongan (Rp)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                                        Minimal Belanja (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        value={minSpend}
                                        onChange={(e) => setMinSpend(e.target.value)}
                                        min="0"
                                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                                        Maks. Diskon (Opsional)
                                    </label>
                                    <input
                                        type="number"
                                        value={maxDiscount}
                                        onChange={(e) => setMaxDiscount(e.target.value)}
                                        placeholder="Tanpa batas"
                                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                                        Masa Berlaku / Expired (Opsional)
                                    </label>
                                    <input
                                        type="date"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]"
                                    />
                                </div>

                                {editingVoucher && (
                                    <div className="flex items-center gap-2 pt-6">
                                        <input
                                            type="checkbox"
                                            id="voucher_status"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="w-4 h-4 text-[#ee4d2d] rounded focus:ring-[#ee4d2d]"
                                        />
                                        <label htmlFor="voucher_status" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                                            Status Voucher Aktif
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsFormOpen(false)}
                                    className="rounded-xl text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSubmitting}
                                    className="bg-[#ee4d2d] hover:bg-[#d03e1f] text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Voucher'}
                                </Button>
                            </div>
                        </form>
                    ) : null}

                    {/* Vouchers List */}
                    {isLoading ? (
                        <div className="py-12 text-center text-xs text-neutral-500">Memuat data voucher...</div>
                    ) : vouchers.length === 0 ? (
                        <div className="py-12 text-center text-neutral-500 space-y-2">
                            <Ticket className="w-8 h-8 mx-auto text-neutral-400 stroke-1" />
                            <p className="text-xs">Belum ada voucher promo. Klik &quot;Tambah Voucher Baru&quot; untuk membuat.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {vouchers.map((v) => (
                                <div
                                    key={v.id}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                        v.is_active
                                            ? 'bg-orange-50/50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/40'
                                            : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-[#ee4d2d] flex items-center justify-center shrink-0 mt-0.5">
                                            {v.type === 'free_shipping' ? (
                                                <Truck className="w-5 h-5" />
                                            ) : v.type === 'discount_percent' ? (
                                                <Percent className="w-5 h-5" />
                                            ) : (
                                                <DollarSign className="w-5 h-5" />
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-black bg-[#ee4d2d] text-white px-2 py-0.5 rounded-md tracking-wider">
                                                    {v.code}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(v.code)}
                                                    className="text-[10px] text-neutral-500 hover:text-[#ee4d2d] flex items-center gap-0.5 transition-colors"
                                                >
                                                    {copiedCode === v.code ? (
                                                        <span className="text-green-600 flex items-center gap-0.5">
                                                            <Check className="w-3 h-3" /> Disalin
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-0.5">
                                                            <Copy className="w-3 h-3" /> Salin
                                                        </span>
                                                    )}
                                                </button>
                                                <Badge
                                                    variant={v.is_active ? 'default' : 'secondary'}
                                                    className={`text-[9px] font-bold ${
                                                        v.is_active ? 'bg-green-600 text-white' : 'bg-neutral-300 dark:bg-neutral-700'
                                                    }`}
                                                >
                                                    {v.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                </Badge>
                                                <span className="text-[10px] text-neutral-400 capitalize">
                                                    Scope: {v.scope}
                                                </span>
                                            </div>

                                            <h4 className="text-xs font-black text-neutral-900 dark:text-white">
                                                {v.title}
                                            </h4>

                                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                                Potongan:{' '}
                                                <strong className="text-[#ee4d2d]">
                                                    {v.type === 'discount_percent'
                                                        ? `${v.discount_amount}%`
                                                        : formatRupiah(v.discount_amount)}
                                                </strong>
                                                {' • '}Min. Belanja: <strong>{formatRupiah(v.min_spend)}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleOpenEdit(v)}
                                            className="h-8 w-8 p-0 rounded-lg text-neutral-600 hover:text-neutral-900"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(v)}
                                            className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex justify-end">
                    <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
                        Tutup
                    </Button>
                </div>
            </div>
        </div>
    );
}

