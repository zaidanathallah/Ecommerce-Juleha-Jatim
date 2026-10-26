import React from 'react';
import { Link } from '@inertiajs/react';
import { ShieldCheck, Truck, CreditCard, Award } from 'lucide-react';
import TrackingWidget from '@/Components/TrackingWidget';

export default function Footer() {
    return (
        <footer className="border-t border-neutral-300 dark:border-neutral-800 bg-neutral-900 text-neutral-300 text-xs">
            {/* Value Proportions Banner */}
            <div className="border-b border-neutral-800 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <Award className="h-7 w-7 text-emerald-400 shrink-0" />
                        <div>
                            <h4 className="font-bold text-white text-xs">Keanggotaan Terverifikasi</h4>
                            <p className="text-[11px] text-neutral-400">Sinkronisasi langsung ID Juleha</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-7 w-7 text-emerald-400 shrink-0" />
                        <div>
                            <h4 className="font-bold text-white text-xs">Standar Syar'i Halal</h4>
                            <p className="text-[11px] text-neutral-400">Verifikasi bilah sembelih halal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-7 w-7 text-emerald-400 shrink-0" />
                        <div>
                            <h4 className="font-bold text-white text-xs">Pembayaran DOKU SNAP</h4>
                            <p className="text-[11px] text-neutral-400">QRIS instan & Virtual Account</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Truck className="h-7 w-7 text-emerald-400 shrink-0" />
                        <div>
                            <h4 className="font-bold text-white text-xs">Logistik Otomatis Biteship</h4>
                            <p className="text-[11px] text-neutral-400">Cek ongkir real-time & pickup kurir</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Widget Banner */}
            <div className="border-b border-neutral-800 py-6 bg-neutral-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <TrackingWidget />
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <img src="/logo-juleha.jpg" alt="Logo Juleha Jatim" className="h-8 w-8 rounded object-contain" />
                        <span className="font-black text-white text-sm tracking-tight">JULEHA JAWA TIMUR</span>
                    </div>
                    <p className="text-neutral-400 leading-relaxed text-[11px]">
                        Marketplace dan wadah ekonomi terpusat Dewan Pengurus Wilayah (DPW) Juru Sembelih Halal Jawa Timur. Menghubungkan sesama juru sembelih untuk peralatan dan sarana sembelih berstandar tinggi.
                    </p>
                </div>

                <div>
                    <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Hierarki & Kas Organisasi</h5>
                    <ul className="space-y-2 text-[11px] text-neutral-400">
                        <li>Transparansi Margin Kas Daerah (Ekop)</li>
                        <li>Transparansi Margin Kas Provinsi (DPW)</li>
                        <li>Verifikasi Mutu Bilah Penjual</li>
                        <li>Panduan Regulasi Sembelih Halal</li>
                    </ul>
                </div>

                <div>
                    <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Akses & Keanggotaan</h5>
                    <ul className="space-y-2 text-[11px]">
                        <li>
                            <a href="https://members.julehajatim.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-none">
                                Portal Database Anggota Pusat &rarr;
                            </a>
                        </li>
                        <li>
                            <Link href={route('register')} className="hover:text-emerald-400 transition-none">
                                Pendaftaran Penjual & Pembeli
                            </Link>
                        </li>
                        <li>
                            <Link href={route('login')} className="hover:text-emerald-400 transition-none">
                                Login Pengurus & Anggota
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Sekretariat DPW Jatim</h5>
                    <address className="not-italic text-[11px] text-neutral-400 space-y-1">
                        <p>Gedung Islamic Centre Jawa Timur</p>
                        <p>Jl. Dukuh Kupang No. 122-124, Surabaya</p>
                        <p>Email: admin@julehajatim.com</p>
                        <p>Website: https://julehajatim.com</p>
                    </address>
                </div>
            </div>

            <div className="border-t border-neutral-800 py-4 text-center text-[10px] text-neutral-500">
                &copy; {new Date().getFullYear()} Marketplace Juru Sembelih Halal (Juleha) Jawa Timur. Hak Cipta Dilindungi Undang-Undang.
            </div>
        </footer>
    );
}
