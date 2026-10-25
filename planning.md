# Task Breakdown & Project Planning

## Phase 1: Setup & Integrasi Database (Week 1)
- [ ] Setup repository Github.
- [ ] Setup Next.js/Laravel project dengan Tailwind & Shadcn UI.
- [ ] Buat koneksi `cross-database` ke DB Jagoan Hosting untuk validasi `ID Juleha`.

## Phase 2: Auth & Role Management (Week 1-2)
- [ ] Sistem Login/Register (Auto-fill dari DB Member).
- [ ] *Routing* otorisasi: User vs Admin Ekop vs Super Admin.
- [ ] Dashboard khusus masing-masing role.

## Phase 3: Product Management & Hierarki Harga (Week 2)
- [ ] CRUD Produk untuk Penjual (Otomatis status *Pending*).
- [ ] UI Approval Admin Ekop (Input Margin Daerah).
- [ ] UI Approval Super Admin (Input Margin Provinsi & Publish).

## Phase 4: Biteship & Maps Integration (Week 3)
- [ ] Integrasi Maps (Titik Koordinat Lat/Lng) di form pendaftaran/alamat.
- [ ] Cek ongkir dinamis di halaman Checkout.
- [ ] **TUGAS WAJIB API BITESHIP:** Lakukan simulasi *Test Order* (Create & Cancel) di mode *Sandbox* untuk mengisi Formulir Aktivasi Order API Biteship.

## Phase 5: DOKU Snap Integration (Week 3)
- [ ] Integrasi DOKU Snap QRIS & VA.
- [ ] Setup *Webhook/Callback* dari DOKU ke URL `jualbeli.julehajatim.com` untuk update status order otomatis.

## Phase 6: Testing & Deployment (Week 4)
- [ ] Uji keamanan (SQLi, XSS).
- [ ] Push ke *production* dan optimasi SEO.
