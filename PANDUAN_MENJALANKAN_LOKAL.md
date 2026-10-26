# PANDUAN MENJALANKAN E-COMMERCE JULEHA JATIM DI LOCALHOST

Panduan lengkap instalasi, konfigurasi, dan pengoperasian lokal untuk platform e-commerce resmi **DPW Juru Sembelih Halal (Juleha) Jawa Timur** (`jualbeli.julehajatim.com`).

---

## DAFTAR ISI
1. [Prasyarat Sistem (Prerequisites)](#1-prasyarat-sistem-prerequisites)
2. [Langkah Instalasi Awal](#2-langkah-instalasi-awal)
3. [Konfigurasi Database](#3-konfigurasi-database)
4. [Konfigurasi Environment (.env)](#4-konfigurasi-environment-env)
5. [Migrasi dan Seeding Data](#5-migrasi-dan-seeding-data)
6. [Kompilasi Frontend (Vite & React)](#6-kompilasi-frontend-vite--react)
7. [Menjalankan Aplikasi (Local Server)](#7-menjalankan-aplikasi-local-server)
8. [Daftar Akun Pengujian Bawaan (Test Credentials)](#8-daftar-akun-pengujian-bawaan-test-credentials)
9. [Perintah Artisan Khusus & Testing](#9-perintah-artisan-khusus--testing)
10. [Troubleshooting & Solusi Kendala Umum](#10-troubleshooting--solusi-kendala-umum)

---

## 1. Prasyarat Sistem (Prerequisites)

Pastikan lingkungan lokal Anda (Laragon, XAMPP, atau Native) telah memenuhi spesifikasi berikut:

- **PHP**: Versi **8.2** atau **8.3+**
  - Ekstensi PHP wajib aktif: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `fileinfo`, `curl`, `gd` atau `exif`.
- **Composer**: Versi **2.x+**
- **Node.js**: Versi **18.x** atau **20.x+** (LTS) & **NPM**
- **Database Server**: **MySQL 8.0+** atau **MariaDB 10.4+**
- **Web Browser**: Chrome, Edge, Firefox, atau Safari versi terbaru (mendukung AudioContext, Geolocation, dan Service Worker/PWA).

---

## 2. Langkah Instalasi Awal

Buka terminal (PowerShell, Command Prompt, atau Terminal Linux/macOS) di direktori proyek:

```bash
# 1. Pastikan Anda berada di direktori root project
cd "d:\Ecommerce Juleha Jatim"

# 2. Salin template environment .env.example menjadi .env
cp .env.example .env
# Jika di Windows PowerShell (jika cp tidak tersedia):
Copy-Item .env.example .env

# 3. Install seluruh dependensi backend (PHP Composer)
composer install

# 4. Generate Application Key baru untuk enkripsi sesi
php artisan key:generate

# 5. Buat symbolic link untuk folder storage (wajib untuk upload foto & bukti bayar)
php artisan storage:link
```

---

## 3. Konfigurasi Database

Sistem E-Commerce Juleha Jatim menggunakan arsitektur dual-database:
1. **`juleha_marketplace`** (*Database Utama*): Menyimpan data produk, pesanan, pembayaran, pengiriman, site settings, dan user transaksi.
2. **`julehaaja_members`** (*Database Pusat Keanggotaan - Read-Only Bridge*): Menyimpan database resmi anggota Juleha untuk validasi realtime nomor ID Juleha saat pendaftaran/login.

### Pembuatan Database di MySQL:
Buka MySQL Client (phpMyAdmin, HeidiSQL, DBeaver, atau Terminal MySQL) lalu jalankan query:

```sql
CREATE DATABASE IF NOT EXISTS juleha_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS julehaaja_members CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 4. Konfigurasi Environment (`.env`)

Pastikan baris konfigurasi berikut di file `.env` telah disesuaikan dengan kredensial database lokal Anda:

```env
APP_NAME="Juleha Marketplace Jatim"
APP_ENV=local
APP_DEBUG=true
APP_TIMEZONE="Asia/Jakarta"
APP_URL=http://localhost:8000

# Database Utama E-Commerce
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=juleha_marketplace
DB_USERNAME=root
DB_PASSWORD=

# Database Keanggotaan Pusat Juleha (Bridge)
DB_MEMBERS_HOST=127.0.0.1
DB_MEMBERS_PORT=3306
DB_MEMBERS_DATABASE=julehaaja_members
DB_MEMBERS_USERNAME=root
DB_MEMBERS_PASSWORD=

# Driver Penyimpanan & Sesi
FILESYSTEM_DISK=public
SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

# Biteship Logistics Testing Gateway
BITESHIP_BASE_URL=https://api.biteship.com
BITESHIP_API_KEY=biteship_test.eyJhbGciOi... (isi dengan API testing token Anda)

# DOKU SNAP Payment Gateway
DOKU_BASE_URL=https://api-sandbox.doku.com
DOKU_CLIENT_ID=your_doku_client_id
DOKU_SECRET_KEY=your_doku_secret_key
```

---

## 5. Migrasi dan Seeding Data

Jalankan perintah Artisan berikut untuk membuat seluruh struktur tabel beserta data awal (*seeder*):

```bash
# Jalankan migrasi dan isi seeder sampel (Kategori, Pengaturan Islami, Akun Dummy, Produk Sampel)
php artisan migrate --seed
```

> **Catatan:** Perintah `--seed` otomatis menginisialisasi:
> - Kategori resmi (Pisau Sembelih, Golok Halal, Batu Asah, Wearpack, APD Juleha, Alat Ukur Suhu Daging, dll.).
> - Akun Super Admin Provinsi, Admin Ekop Sidoarjo, Anggota Penjual, dan Anggota Pembeli.
> - Pengaturan default Islami di tabel `site_settings` (Murottal aktif, Adzan otomatis aktif, volume 50%).

---

## 6. Kompilasi Frontend (Vite & React)

Install dependensi Node.js dan lakukan build aset frontend:

```bash
# Install paket npm
npm install

# Opsi A: Mode Pengembangan (Hot-Reload / HMR aktif)
npm run dev

# Opsi B: Mode Produksi (Bundle teroptimasi WebP & JS minified)
npm run build
```

---

## 7. Menjalankan Aplikasi (Local Server)

Untuk menjalankan platform secara penuh di lokal, buka **2 terminal**:

### Terminal 1: Backend Laravel Server
```bash
php artisan serve
```
*Aplikasi backend akan aktif di:* **`http://localhost:8000`** atau **`http://127.0.0.1:8000`**.

### Terminal 2: Frontend Vite Development Server (Opsional jika menggunakan `npm run dev`)
```bash
npm run dev
```

### Terminal 3: Queue Worker (Opsional untuk background processing email/notifikasi)
```bash
php artisan queue:work
```

---

## 8. Daftar Akun Pengujian Bawaan (Test Credentials)

Gunakan akun-akun bawaan berikut yang telah terdaftar dari hasil seeder untuk menguji setiap hak akses dan alur kerja (*role*):

| Role | Email Login | Password | Nomor ID Juleha | Wilayah | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@julehajatim.com` | `superadmin123` | `JTM-SUPER-01` | DPW Jawa Timur | Approval Akhir Produk Nasional, Atur Toggle Global Islami & Murottal, Simulator Biteship |
| **Admin Ekop** | `ekop.sidoarjo@julehajatim.com` | `ekop123` | `SDA-EKOP-01` | DPD Kab. Sidoarjo | Verifikasi Produk Daerah, Monitor Margin Kas Ekop Daerah, Pelunasan Kasbon |
| **Anggota Penjual** | `slamet@julehajatim.com` | `anggota123` | `SDA220001` | DPD Kab. Sidoarjo | Jual Produk Baru, Atur Toko (Toggle DOKU / Rekening Pribadi & Kurir Mandiri), Konfirmasi Terima Pembayaran Transfer |
| **Anggota Pembeli** | `puji@julehajatim.com` | `puji123` | `SDA220002` | DPD Kab. Sidoarjo | Beli Produk, Checkout Ongkir Otomatis/Manual, Upload Bukti Transfer, Konfirmasi Penerimaan Paket |

---

## 9. Perintah Artisan Khusus & Testing

Platform ini dilengkapi dengan alat uji dan otomasi mandiri:

### A. Menjalankan Seluruh Automated Feature Tests (100% Pass)
```bash
php artisan test
```
*Menguji 53 skenario fitur:* verifikasi keanggotaan ID Juleha, margin berjenjang, kompresi otomatis gambar WebP <300KB, simulasi DOKU webhook, simulasi Biteship, API Qur'an, audio Murottal, dan jadwal sholat.

### B. Menembak Simulasi Rates API Biteship (Checklist Dashboard)
```bash
php artisan biteship:simulate-rates
```
*Endpoint web alternatif:* `GET http://localhost:8000/api/biteship-simulate-rates`

### C. Mengakses Fitur Al-Qur'an Digital 30 Juz
- **URL Indeks Surat**: `http://localhost:8000/quran`
- **URL Baca Surat Detail**: `http://localhost:8000/quran/1` (Al-Fatihah), `http://localhost:8000/quran/36` (Yasin), dll.

---

## 10. Troubleshooting & Solusi Kendala Umum

### 1. Masalah Perintah `php` atau `composer` Tidak Dikenali di Windows
Jika muncul pesan `'php' is not recognized as an internal or external command`:
Tambahkan path binary PHP Anda sementara di PowerShell (contoh Laragon):
```powershell
$env:PATH = "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64;" + $env:PATH
```
Atau tambahkan folder instalasi PHP ke **System Environment Variables (PATH)** Windows.

### 2. Error Gambar / Upload Tidak Muncul (404 Not Found)
Pastikan symbolic link storage telah dibuat:
```bash
php artisan storage:link
```
Folder tujuan upload berada di `storage/app/public/` dan dapat diakses publik via `/storage/`.

### 3. Audio Murottal Tidak Langsung Berbunyi Saat Buka Web
Ini adalah kebijakan resmi keamanan browser (*Autoplay Policy*). Audio dirancang untuk otomatis berbunyi **segera setelah user melakukan 1 kali interaksi** (klik di halaman, scroll mouse, atau tap layar).

### 4. Membersihkan Seluruh Cache Laravel
Jika Anda mengubah file `.env` atau routes dan perubahannya belum terdeteksi:
```bash
php artisan optimize:clear
```

### 5. Masalah Izin Notifikasi Sholat / PWA
Untuk mencoba fitur notifikasi sholat di latar belakang:
- Buka browser di `http://localhost:8000` (atau `http://127.0.0.1:8000`).
- Klik icon lonceng pada **Sticky Mini Player** di pojok kanan bawah layar untuk memberikan izin notifikasi (*Allow Notifications*).
- Service worker didaftarkan otomatis dari file [public/sw.js](file:///d:/Ecommerce%20Juleha%20Jatim/public/sw.js).

---

**DPW Juru Sembelih Halal (Juleha) Jawa Timur**  
*Membangun Ekosistem Halal yang Kuat, Amanah, dan Berdaya Saing Tinggi.*
