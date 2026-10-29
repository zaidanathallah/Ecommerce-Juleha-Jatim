import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Copy, Check, Truck, XCircle, CheckCircle2, ArrowRight, Play, ExternalLink } from 'lucide-react';

interface SimulationData {
    success: boolean;
    timestamp: string;
    delivered_test_order: {
        order_id: string;
        waybill_id?: string;
        tracking_link?: string;
        status: string;
        instruction: string;
    };
    cancelled_test_order: {
        order_id: string;
        waybill_id?: string;
        status: string;
        cancel_status_response: string;
        instruction: string;
    };
}

interface Props {
    simulationData: SimulationData | null;
}

export default function BiteshipSimulation({ simulationData }: Props) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const handleCopy = (key: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
    };

    const runSimulation = () => {
        setIsRunning(true);
        router.get('/biteship/simulation', { run: '1' }, {
            onFinish: () => setIsRunning(false),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout header="Simulasi Sandbox Biteship (Formulir Aktivasi)">
            <Head title="Biteship Sandbox Simulator - Juleha Marketplace" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="border border-border bg-card p-6 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20 rounded mb-2">
                                <Truck className="h-3.5 w-3.5" /> Biteship Sandbox Environment
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Generator ID Pesanan Aktivasi API Biteship
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                                Alat ini menembak endpoint Biteship Sandbox untuk membuat 2 pesanan dummy secara otomatis: 
                                satu untuk target Terkirim (Delivered) dan satu yang langsung dibatalkan (Cancelled) melalui API.
                            </p>
                        </div>

                        <Button 
                            onClick={runSimulation}
                            disabled={isRunning}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 font-medium h-11 px-5"
                        >
                            <Play className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                            {isRunning ? 'Menjalankan Simulasi...' : 'Jalankan Simulasi Baru'}
                        </Button>
                    </div>
                </div>

                {simulationData ? (
                    <div className="space-y-6">
                        {/* Summary Alert */}
                        <div className="border-2 border-orange-500/40 bg-orange-500/10 p-4 rounded-lg flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-[#ee4d2d] shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-foreground">Simulasi Sandbox Berhasil!</p>
                                <p className="text-muted-foreground mt-0.5">
                                    Kedua pesanan telah dibuat di sistem Sandbox Biteship. Salin kedua ID di bawah ini ke formulir aktivasi Biteship Anda.
                                </p>
                            </div>
                        </div>

                        {/* Two Result Cards */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Card 1: Delivered */}
                            <Card className="border-border">
                                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-orange-500/10 text-[#ee4d2d] rounded">
                                                <Truck className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-semibold">
                                                    1. ID Pesanan Test Terkirim
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Untuk kolom: "ID Pesanan Test Terkirim (Delivered)"
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-orange-500/10 text-[#ee4d2d] border border-orange-500/20">
                                            DELIVERED
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                                            Biteship Order ID:
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 p-2.5 bg-muted text-foreground text-xs font-mono rounded border border-border break-all select-all font-semibold">
                                                {simulationData.delivered_test_order.order_id}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopy('delivered', simulationData.delivered_test_order.order_id)}
                                                className="shrink-0 h-9"
                                            >
                                                {copiedKey === 'delivered' ? (
                                                    <Check className="h-4 w-4 text-[#ee4d2d]" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                                <span className="ml-1.5 text-xs">
                                                    {copiedKey === 'delivered' ? 'Tersalin' : 'Salin'}
                                                </span>
                                            </Button>
                                        </div>
                                    </div>

                                    {simulationData.delivered_test_order.waybill_id && (
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <p><span className="font-medium text-foreground">Nomor Resi / Waybill:</span> {simulationData.delivered_test_order.waybill_id}</p>
                                        </div>
                                    )}

                                    <div className="p-3 bg-muted/40 rounded border border-border/60 text-xs text-muted-foreground space-y-1.5">
                                        <p className="font-medium text-foreground">Petunjuk Tim QA Biteship:</p>
                                        <p>{simulationData.delivered_test_order.instruction}</p>
                                        {simulationData.delivered_test_order.tracking_link && (
                                            <a 
                                                href={simulationData.delivered_test_order.tracking_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-primary hover:underline text-xs mt-1"
                                            >
                                                Buka Tautan Tracking Biteship <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 2: Cancelled */}
                            <Card className="border-border">
                                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-destructive/10 text-destructive rounded">
                                                <XCircle className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-semibold">
                                                    2. ID Pesanan Test Dibatalkan
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Untuk kolom: "ID Pesanan Test Dibatalkan (Cancelled)"
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-destructive/10 text-destructive border border-destructive/20">
                                            CANCELLED
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                                            Biteship Order ID:
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 p-2.5 bg-muted text-foreground text-xs font-mono rounded border border-border break-all select-all font-semibold">
                                                {simulationData.cancelled_test_order.order_id}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopy('cancelled', simulationData.cancelled_test_order.order_id)}
                                                className="shrink-0 h-9"
                                            >
                                                {copiedKey === 'cancelled' ? (
                                                    <Check className="h-4 w-4 text-[#ee4d2d]" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                                <span className="ml-1.5 text-xs">
                                                    {copiedKey === 'cancelled' ? 'Tersalin' : 'Salin'}
                                                </span>
                                            </Button>
                                        </div>
                                    </div>

                                    {simulationData.cancelled_test_order.waybill_id && (
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <p><span className="font-medium text-foreground">Nomor Resi / Waybill:</span> {simulationData.cancelled_test_order.waybill_id}</p>
                                        </div>
                                    )}

                                    <div className="p-3 bg-muted/40 rounded border border-border/60 text-xs text-muted-foreground space-y-1.5">
                                        <p className="font-medium text-foreground">Status Pembatalan API:</p>
                                        <p>{simulationData.cancelled_test_order.instruction}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    /* Initial Empty State */
                    <Card className="border-border text-center py-12">
                        <CardContent className="space-y-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div className="max-w-md mx-auto">
                                <h3 className="text-lg font-bold text-foreground">Siap Mengambil ID Pesanan Sandbox</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Klik tombol di bawah untuk membuat 2 pesanan uji coba secara langsung ke server Sandbox Biteship.
                                </p>
                            </div>
                            <Button 
                                onClick={runSimulation}
                                disabled={isRunning}
                                className="bg-primary text-primary-foreground font-semibold px-6"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                {isRunning ? 'Memproses...' : 'Eksekusi Simulasi Sekarang'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* API JSON Endpoint Info */}
                <div className="p-4 border border-border bg-card rounded-lg text-xs space-y-2">
                    <p className="font-semibold text-foreground">Informasi Endpoint API / Command CLI Alternatif:</p>
                    <p className="text-muted-foreground">
                        Selain melalui UI ini, simulasi ini dapat dijalankan kapan saja melalui:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 font-mono text-xs">
                        <div className="p-2 bg-muted rounded border border-border flex-1">
                            php artisan biteship:simulate-orders
                        </div>
                        <div className="p-2 bg-muted rounded border border-border flex-1">
                            POST /api/biteship-simulate
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
