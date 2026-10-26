import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MarketplaceLayout from '@/Layouts/MarketplaceLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import {
    Store,
    CreditCard,
    Truck,
    ArrowLeft,
    AlertCircle,
    Info,
    CheckCircle2,
    Building,
} from 'lucide-react';

interface Props {
    settings: {
        is_pg_active: boolean;
        is_shipping_api_active: boolean;
        seller_bank_details: string;
    };
}

export default function ShopSettings({ settings }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        is_pg_active: settings.is_pg_active,
        is_shipping_api_active: settings.is_shipping_api_active,
        seller_bank_details: settings.seller_bank_details,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('seller.shop.update'));
    };

    return (
        <MarketplaceLayout>
            <Head title="Pengaturan Toko & Metode Transaksi - Juleha Jatim" />

            <div className="max-w-2xl mx-auto space-y-4">
                <nav className="flex items-center gap-2 text-xs text-neutral-500">
                    <Link href={route('dashboard')} className="hover:text-emerald-700 flex items-center gap-1 font-semibold">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Dashboard
                    </Link>
                </nav>

                <Card className="border border-neutral-300 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b">
                        <div className="flex items-center gap-2 mb-1">
                            <Store className="h-5 w-5 text-emerald-700" />
                            <Badge variant="default" className="text-[10px]">
                                SELLER PREFERENCES & TOGGLES
                            </Badge>
                        </div>
                        <CardTitle className="text-xl font-black">
                            Pengaturan Toko & Metode Transaksi
                        </CardTitle>
                        <CardDescription>
                            Atur apakah toko Anda menggunakan sistem gateway resmi (DOKU & Biteship) atau menggunakan kurir mandiri dan rekening pribadi.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Toggle 1: Payment Gateway DOKU SNAP */}
                            <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded ${data.is_pg_active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'}`}>
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                                Gunakan Payment Gateway DOKU SNAP
                                            </h4>
                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                {data.is_pg_active ? 'Aktif: QRIS Instan & Virtual Account Otomatis' : 'Non-Aktif: Menggunakan Rekening Bank Pribadi'}
                                            </p>
                                        </div>
                                    </div>

                                    <Switch
                                        checked={data.is_pg_active}
                                        onCheckedChange={(val) => setData('is_pg_active', val)}
                                    />
                                </div>

                                {data.is_pg_active ? (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 rounded text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                                        <div className="leading-relaxed">
                                            <strong>Mode Rekomendasi:</strong> Pembayaran pembeli langsung diverifikasi otomatis oleh webhook DOKU. Uang masuk ke akun Master DOKU Juleha dan margin kas organisasi langsung terbagi secara transparan.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pt-2">
                                        <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-800 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <div className="leading-relaxed">
                                                <strong>Ketentuan Rekening Pribadi:</strong> Pembeli akan mentransfer uang langsung ke rekening Anda. Karena uang tidak melalui DOKU Master, margin kas daerah (Ekop) dan kas provinsi (SuperAdmin) akan dicatat sebagai <strong>Hutang Penjual ke Kas Organisasi</strong> dan wajib disetorkan ke kas DPD/DPW secara berkala.
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
                                                <Building className="h-3.5 w-3.5 text-neutral-500" />
                                                Informasi Rekening Bank Pribadi Penjual (Wajib Diisi)
                                            </label>
                                            <textarea
                                                rows={3}
                                                placeholder="Contoh:&#10;Bank BCA: 1234567890 a.n. Muhammad Slamet&#10;Bank Mandiri: 987654321 a.n. Muhammad Slamet"
                                                value={data.seller_bank_details}
                                                onChange={(e) => setData('seller_bank_details', e.target.value)}
                                                className="w-full text-xs font-mono rounded border-neutral-300 focus:ring-emerald-700 leading-relaxed"
                                            />
                                            {errors.seller_bank_details && (
                                                <p className="text-xs text-red-600 font-bold mt-1">{errors.seller_bank_details}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Toggle 2: Shipping API Biteship */}
                            <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded ${data.is_shipping_api_active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'}`}>
                                            <Truck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                                Gunakan Otomasi Pengiriman Biteship API
                                            </h4>
                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                {data.is_shipping_api_active ? 'Aktif: Cek Ongkir Otomatis & Request Pickup Kurir' : 'Non-Aktif: Kurir Mandiri / COD Penjual'}
                                            </p>
                                        </div>
                                    </div>

                                    <Switch
                                        checked={data.is_shipping_api_active}
                                        onCheckedChange={(val) => setData('is_shipping_api_active', val)}
                                    />
                                </div>

                                {data.is_shipping_api_active ? (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 rounded text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                                        <div className="leading-relaxed">
                                            <strong>Logistik Otomatis:</strong> Pembeli dapat memilih kurir (JNE, J&T, SiCepat, GoSend, Grab). Tarif dihitung otomatis berdasarkan titik koordinat Maps Anda, dan kurir akan langsung datang menjemput barang (request pickup).
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-neutral-500" />
                                        <div className="leading-relaxed">
                                            <strong>Kurir Mandiri / COD:</strong> Biaya ongkos kirim di checkout akan diatur Rp 0. Pembeli dan penjual menyepakati pengiriman langsung atau pembayaran ongkir di tempat (COD) kepada kurir Anda.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={processing}
                                    className="w-full py-2.5 text-sm font-bold bg-emerald-700 hover:bg-emerald-800"
                                >
                                    {processing ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Toko'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MarketplaceLayout>
    );
}
