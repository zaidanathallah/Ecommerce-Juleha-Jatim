# Ecommerce-Juleha-Jatim
Platform E-commerce dan Marketplace resmi untuk anggota Juru Sembelih Halal (Juleha) Jawa Timur (`jualbeli.julehajatim.com`).

Sistem ini terintegrasi langsung dengan database keanggotaan pusat untuk memastikan hanya anggota tervalidasi yang dapat bertransaksi. Dilengkapi dengan infrastruktur margin berjenjang untuk pemasukan kas daerah/provinsi, pembayaran instan via DOKU SNAP, logistik otomatis via Biteship, pemutar murottal audio global, jadwal sholat & adzan otomatis, serta Al-Qur'an digital 30 Juz.

---

## 📖 Panduan Menjalankan di Lokal (Localhost)
Untuk panduan instalasi, migrasi database, seeding akun pengujian, dan troubleshooting lengkap di localhost, silakan baca:
👉 **[PANDUAN_MENJALANKAN_LOKAL.md](file:///d:/Ecommerce%20Juleha%20Jatim/PANDUAN_MENJALANKAN_LOKAL.md)**

---

## 🚀 Quick Start (Ringkasan Cepat)
```bash
# 1. Salin Environment & Konfigurasi DB
cp .env.example .env

# 2. Install Dependensi
composer install
npm install

# 3. Setup Aplikasi & Database
php artisan key:generate
php artisan storage:link
php artisan migrate --seed

# 4. Jalankan Aplikasi
php artisan serve
npm run dev
```

Buka browser di **`http://localhost:8000`**.
