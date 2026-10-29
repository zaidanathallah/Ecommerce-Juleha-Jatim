import React from 'react';
import { Link } from '@inertiajs/react';
import { ShieldCheck, Truck, CreditCard, Award } from 'lucide-react';
import TrackingWidget from '@/Components/TrackingWidget';

export default function Footer() {
    return (
        <footer className="border-t border-neutral-200 bg-[#fbfbfb] text-neutral-600 text-xs">
            {/* Value Propositions Banner */}
            <div className="border-b border-neutral-200 py-6 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <Award className="h-5 w-5 text-[#ee4d2d]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-neutral-800 text-xs">Keanggotaan Terverifikasi</h4>
                            <p className="text-[11px] text-neutral-500">Sinkronisasi langsung database ID Juleha</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-5 w-5 text-[#ee4d2d]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-neutral-800 text-xs">Standar Syar'i Halal</h4>
                            <p className="text-[11px] text-neutral-500">Verifikasi bilah & sertifikasi halal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <CreditCard className="h-5 w-5 text-[#ee4d2d]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-neutral-800 text-xs">Pembayaran QRIS Dinamis</h4>
                            <p className="text-[11px] text-neutral-500">QRIS instan semua e-wallet & mobile banking</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <Truck className="h-5 w-5 text-[#ee4d2d]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-neutral-800 text-xs">Logistik Otomatis Biteship</h4>
                            <p className="text-[11px] text-neutral-500">Cek ongkir real-time & pickup kurir</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Widget Banner */}
            <div className="border-b border-neutral-200 py-6 bg-[#f7f7f7]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <TrackingWidget />
                </div>
            </div>

            {/* Main Shopee 5-Column Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Col 1: Customer Care */}
                <div>
                    <h5 className="font-bold text-neutral-800 uppercase text-xs tracking-wider mb-3">Layanan Pelanggan</h5>
                    <ul className="space-y-2 text-[11px] text-neutral-500">
                        <li><a href="https://wa.me/6281262227663" target="_blank" rel="noreferrer" className="hover:text-[#ee4d2d] transition-colors">Bantuan & Customer Service</a></li>
                        <li><span className="hover:text-[#ee4d2d] cursor-pointer">Cara Membeli & Checkout</span></li>
                        <li><span className="hover:text-[#ee4d2d] cursor-pointer">Lacak Pesanan (Biteship)</span></li>
                        <li><span className="hover:text-[#ee4d2d] cursor-pointer">Metode Pembayaran (QRIS Dinamis)</span></li>
                        <li><span className="hover:text-[#ee4d2d] cursor-pointer">Garansi Bilah Sembelih Sesuai Syariat</span></li>
                    </ul>
                </div>

                {/* Col 2: About Juleha */}
                <div>
                    <h5 className="font-bold text-neutral-800 uppercase text-xs tracking-wider mb-3">Jelajahi Juleha Jatim</h5>
                    <ul className="space-y-2 text-[11px] text-neutral-500">
                        <li><a href="https://julehajatim.com" target="_blank" rel="noreferrer" className="hover:text-[#ee4d2d] transition-colors">Tentang Juleha Jawa Timur</a></li>
                        <li><span className="hover:text-[#ee4d2d] cursor-pointer">Kebijakan Privasi</span></li>
                        <li><span className="hover:text-[#ee4d2d] cursor-pointer">Standar Mutu Bilah Halal</span></li>
                        <li><span className="hover:text-[#ee4d2d] cursor-pointer">Transparansi Margin Kas (Ekop)</span></li>
                        <li><a href="https://members.julehajatim.com" target="_blank" rel="noreferrer" className="hover:text-[#ee4d2d] transition-colors">Database Anggota Pusat &rarr;</a></li>
                    </ul>
                </div>

                {/* Col 3: Payment Partners */}
                <div>
                    <h5 className="font-bold text-neutral-800 uppercase text-xs tracking-wider mb-3">Pembayaran</h5>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-orange-600 shadow-2xs">TemanQRIS</div>
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-red-600 shadow-2xs">QRIS</div>
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-blue-700 shadow-2xs">BCA</div>
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-blue-900 shadow-2xs">Mandiri</div>
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-orange-600 shadow-2xs">BNI</div>
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-blue-800 shadow-2xs">BRI</div>
                    </div>
                </div>

                {/* Col 4: Shipping Logistics */}
                <div>
                    <h5 className="font-bold text-neutral-800 uppercase text-xs tracking-wider mb-3">Pengiriman</h5>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-red-600 shadow-2xs">J&T Express</div>
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-blue-600 shadow-2xs">JNE</div>
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-red-700 shadow-2xs">SiCepat</div>
                        <div className="p-2 bg-white rounded border border-neutral-200 text-center font-bold text-[10px] text-amber-700 shadow-2xs">Anteraja</div>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-2 font-mono">Terintegrasi otomatis via Biteship API</p>
                </div>

                {/* Col 5: Secretariat */}
                <div>
                    <h5 className="font-bold text-neutral-800 uppercase text-xs tracking-wider mb-3">Sekretariat Juleha Jatim</h5>
                    <address className="not-italic text-[11px] text-neutral-500 space-y-1.5 leading-relaxed">
                        <p className="font-semibold text-neutral-700">Kantor Sekretariat:</p>
                        <p>Jl. Simo Gunung Kramat Barat 1/28 Surabaya, Jawa Timur</p>
                        <p>WhatsApp: <a href="https://wa.me/6281262227663" target="_blank" rel="noreferrer" className="text-[#ee4d2d] hover:underline font-bold">+62 812-6222-7663</a></p>
                        <p>Email: <a href="mailto:admin@julehajatim.com" className="hover:underline">admin@julehajatim.com</a></p>
                        <p>Website: <a href="https://julehajatim.com" target="_blank" rel="noreferrer" className="text-[#ee4d2d] hover:underline">https://julehajatim.com</a></p>
                    </address>
                </div>
            </div>

            {/* Bottom Shopee Copyright Bar */}
            <div className="border-t border-neutral-200 py-6 text-center text-[11px] text-neutral-400 bg-[#f5f5f5]">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>&copy; {new Date().getFullYear()} Marketplace Juru Sembelih Halal (Juleha) Jawa Timur. Hak Cipta Dilindungi.</p>
                    <p className="text-neutral-500">Negara: <span className="text-neutral-700 font-bold">Indonesia (Jawa Timur)</span></p>
                </div>
            </div>
        </footer>
    );
}
