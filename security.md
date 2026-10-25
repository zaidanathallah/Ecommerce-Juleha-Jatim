# Security Architecture

## 1. DOKU API Key Management
Data rahasia berikut **DILARANG KERAS** di-push ke GitHub. Semuanya wajib disimpan di file `.env` di server Jagoan Hosting:
```env
DOKU_CLIENT_ID=BRN-0216-xxxxxx
DOKU_SECRET_KEY=SK-ZyRDS7MBHysv2Tav2ID5
DOKU_API_KEY=doku_key_28b4722334024110b1479486feabbed5
DOKU_MERCHANT_PUBLIC_KEY="-----BEGIN PUBLIC KEY----- MIIBIj... -----END PUBLIC KEY-----"
```

## 2. Pencegahan SQL Injection & XSS
- Gunakan ORM bawaan (Eloquent untuk Laravel atau Prisma untuk Node/Next.js) yang otomatis melakukan *parameter binding*.
- Lakukan sanitasi input pada kolom deskripsi produk agar penjual tidak menyisipkan *script* berbahaya (XSS).

## 3. Pencegahan Anomali & Bot (Rate Limiting)
- Terapkan *Rate Limiter*: Maksimal 5x percobaan *login* salah per menit.
- Blokir *Hit API* *checkout* beruntun (mencegah *spamming* yang menghabiskan saldo *Pts* Biteship secara sengaja).

## 4. Keamanan Transaksi
- Validasi total harga (*Grand Total*) murni dilakukan di backend. Frontend hanya menampilkan angka, namun saat tembak API ke DOKU, angka dihitung ulang dari database backend untuk mencegah manipulasi harga dari *Inspect Element* browser.
