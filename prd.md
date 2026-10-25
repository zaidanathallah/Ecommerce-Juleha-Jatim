# Product Requirements Document (PRD) & Software Requirements Specification (SRS)
## 1. PRD (Product Requirements Document)

### A. Project Goal
Membangun platform E-Commerce khusus (Marketplace) untuk UMKM dan anggota Juru Sembelih Halal (Juleha) Jawa Timur. Platform ini bertujuan untuk memfasilitasi transaksi jual-beli peralatan sembelih dan produk halal antar anggota secara terpusat, sekaligus menjadi sumber pemasukan kas organisasi melalui sistem margin berjenjang.

### B. Target User
1. **User Penjual/Pembeli (Anggota Juleha):** Membeli dan menjual produk (membutuhkan validasi ID Juleha).
2. **Admin Ekop (Kabupaten/Kota):** Menyetujui produk dari penjual di wilayahnya dan menetapkan margin daerah.
3. **Super Admin (Jatim):** Menyetujui produk tahap akhir, menetapkan margin provinsi (biaya layanan), dan memantau seluruh transaksi.

### C. Main Features
- **Validasi Keanggotaan Otomatis:** Sinkronisasi dengan database `members.julehajatim.com`.
- **Sistem Harga Berjenjang (Markup):** `Harga Final = Harga Dasar Penjual + Margin Admin Kab/Kota + Margin Super Admin`.
- **Integrasi Pembayaran DOKU:** Menerima pembayaran VA, QRIS (SNAP API).
- **Integrasi Logistik Biteship:** Otomasi *pickup* kurir (Pay-as-you-go / Pts), cek ongkir, dan resi.
- **Anti-Slop Dashboard:** UI/UX super cepat, fungsional, tanpa animasi berlebihan.

### D. User Flow
1. **Registrasi:** User input ID Juleha -> Sistem cek database Jagoan Hosting -> Auto-fill data (Nama, Region) -> Upload KTP.
2. **Jualan:** Penjual upload produk & harga dasar -> Status *Pending*.
3. **Approval:** Admin Ekop ACC & tambah margin -> Super Admin ACC & tambah margin -> Produk *Live*.
4. **Checkout:** Pembeli checkout -> Pilih Kurir (Biteship API) -> Bayar via DOKU QRIS/VA -> Notifikasi Webhook DOKU.
5. **Pengiriman:** Biteship panggil kurir *pickup* ke lokasi (Latitude/Longitude) penjual.

---

## 2. SRS (Software Requirements Specification)

### A. Validasi
- ID Juleha yang dimasukkan harus memiliki status "Aktif" di database pusat.
- Alamat penjual dan pembeli WAJIB memiliki titik koordinat (Google Maps API / Leaflet) untuk syarat kurir instan Biteship.

### B. Behavior
- Margin harga disembunyikan dari pembeli (Front-end hanya melihat harga total).
- Jika penjual mengedit harga/foto produk yang sudah *Live*, status otomatis kembali ke *Pending* (butuh re-ACC admin).

### C. Aturan Aplikasi
- Uang pembayaran masuk ke akun DOKU Master Juleha.
- Pemotongan saldo Pts Biteship terjadi saat *request pickup*.
