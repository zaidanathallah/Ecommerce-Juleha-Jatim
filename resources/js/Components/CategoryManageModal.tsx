import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, 
    Plus, 
    Edit2, 
    Trash2, 
    Check, 
    Tags, 
    Sparkles, 
    Sword, 
    Axe, 
    ShieldCheck, 
    Link as LinkIcon, 
    Heart, 
    Utensils, 
    Box, 
    Flame, 
    Tag, 
    Star, 
    Truck 
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import CategoryIcon from '@/Components/CategoryIcon';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    is_active?: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    categories: CategoryItem[];
}

const AVAILABLE_ICONS = [
    { key: 'Sword', label: 'Pisau Sembelih' },
    { key: 'Axe', label: 'Golok & Bendo' },
    { key: 'Sparkles', label: 'Batu Asah' },
    { key: 'ShieldCheck', label: 'Wearpack APD' },
    { key: 'Link', label: 'Tali Handling' },
    { key: 'Heart', label: 'Hewan Qurban' },
    { key: 'Utensils', label: 'Daging Halal' },
    { key: 'Box', label: 'Peralatan Dapur' },
    { key: 'Flame', label: 'Flash Sale' },
    { key: 'Tag', label: 'Kategori Khusus' },
    { key: 'Star', label: 'Produk Unggulan' },
    { key: 'Truck', label: 'Logistik & Ekspedisi' },
];

export default function CategoryManageModal({ isOpen, onClose, categories }: Props) {
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Sword');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleOpenCreate = () => {
        setEditingCategory(null);
        setName('');
        setDescription('');
        setSelectedIcon('Sword');
        setIsFormOpen(true);
    };

    const handleOpenEdit = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setName(cat.name);
        setDescription(cat.description || '');
        setSelectedIcon(cat.icon || 'Tag');
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        if (editingCategory) {
            router.put(
                route('seller.categories.update', editingCategory.id),
                {
                    name,
                    description,
                    icon: selectedIcon,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsSubmitting(false);
                        setIsFormOpen(false);
                        setEditingCategory(null);
                    },
                    onError: () => setIsSubmitting(false),
                }
            );
        } else {
            router.post(
                route('seller.categories.store'),
                {
                    name,
                    description,
                    icon: selectedIcon,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsSubmitting(false);
                        setIsFormOpen(false);
                        setName('');
                        setDescription('');
                    },
                    onError: () => setIsSubmitting(false),
                }
            );
        }
    };

    const handleDelete = (cat: CategoryItem) => {
        if (!confirm(`Hapus kategori "${cat.name}"? Jika terdapat produk terkait, statusnya akan dinonaktifkan secara aman.`)) {
            return;
        }

        router.delete(route('seller.categories.destroy', cat.id), {
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#ee4d2d]">
                                <Tags className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-base text-neutral-900 dark:text-white">
                                    Kelola Kategori Produk & Ikon
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    Akses manajemen kategori untuk Penjual, Admin Ekop, dan Super Admin
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!isFormOpen && (
                                <Button
                                    size="sm"
                                    onClick={handleOpenCreate}
                                    className="bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Tambah Kategori</span>
                                </Button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto space-y-6">
                        {isFormOpen ? (
                            <form onSubmit={handleSubmit} className="p-5 bg-orange-50/50 dark:bg-neutral-800/50 border border-orange-200 dark:border-neutral-700 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-[#ee4d2d]" />
                                        <span>{editingCategory ? 'Edit Kategori Produk' : 'Buat Kategori Baru'}</span>
                                    </h4>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsFormOpen(false)}
                                        className="text-xs text-neutral-500 hover:text-neutral-900"
                                    >
                                        Batal
                                    </Button>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Nama Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Contoh: Bumbu Rendang Halal, Tali Perebah..."
                                        required
                                        className="w-full text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-[#ee4d2d] font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                                        Deskripsi Kategori (Opsional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Keterangan singkat mengenai produk dalam kategori ini..."
                                        className="w-full text-xs rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-[#ee4d2d]"
                                    />
                                </div>

                                {/* Icon Picker */}
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                                        Pilih Ikon Visual Shopee-Style:
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {AVAILABLE_ICONS.map((iconItem) => {
                                            const isSelected = selectedIcon === iconItem.key;
                                            return (
                                                <button
                                                    key={iconItem.key}
                                                    type="button"
                                                    onClick={() => setSelectedIcon(iconItem.key)}
                                                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                                                        isSelected
                                                            ? 'border-[#ee4d2d] bg-orange-100/70 dark:bg-orange-950/60 ring-2 ring-[#ee4d2d]/30'
                                                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-400'
                                                    }`}
                                                >
                                                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                                                        <CategoryIcon iconName={iconItem.key} className="h-6 w-6" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 block truncate">
                                                            {iconItem.label}
                                                        </span>
                                                        <span className="text-[9px] text-neutral-400 font-mono">
                                                            {iconItem.key}
                                                        </span>
                                                    </div>
                                                    {isSelected && <Check className="h-3.5 w-3.5 text-[#ee4d2d] shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
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
                                        disabled={isSubmitting || !name.trim()}
                                        className="bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold rounded-xl shadow-sm"
                                    >
                                        {isSubmitting ? 'Menyimpan...' : editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {/* List Categories */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase text-neutral-500 tracking-wider">
                                Daftar Seluruh Kategori ({categories.length})
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="p-3.5 bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:border-neutral-300"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 flex items-center justify-center shrink-0">
                                                <CategoryIcon iconName={cat.icon} className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                                    {cat.name}
                                                </h5>
                                                <p className="text-[10px] text-neutral-400 truncate">
                                                    {cat.description || cat.slug}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(cat)}
                                                className="p-1.5 rounded-lg text-neutral-500 hover:text-[#ee4d2d] hover:bg-orange-50 dark:hover:bg-neutral-700 transition"
                                                title="Edit Kategori & Ikon"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(cat)}
                                                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-neutral-700 transition"
                                                title="Hapus Kategori"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
