# System Design Document (SDD) & UI/UX Flow

## 3. SDD (System Design)

### A. Arsitektur
- **Environment:** Subdomain `jualbeli.julehajatim.com` di Jagoan Hosting.
- **Stack:** Next.js (React) / Laravel Inertia, Tailwind CSS, Shadcn UI.
- **Mobile First:** Responsif sempurna dari layar HP terkecil hingga Desktop.

### B. Database Schema (MySQL)
- `users`: id, juleha_id, role, name, ktp_url, lat, lng, is_verified.
- `products`: id, user_id, region_id, base_price, ekop_margin, super_margin, status (pending/live).
- `orders`: id, buyer_id, total_amount, shipping_cost, doku_invoice, biteship_resi, status.

### C. API Integrations
1. **DOKU Snap API:** Endpoint untuk *Generate* QRIS & VA. (Keys: Client ID, Secret Key, Public Key).
2. **Biteship API:** 
   - `POST /v1/rates/couriers` (Cek Ongkir).
   - `POST /v1/orders` (Request Pickup).
3. **Member DB Bridge:** Akses langsung (`read-only`) ke tabel DB `members.julehajatim.com` di server yang sama.

### D. Struktur Backend
- Pemisahan ketat antara *Controllers* (menangani request HTTP) dan *Services* (menghitung logika harga/margin dan *call* API DOKU/Biteship).

---

## 4. UI/UX Flow (Anti-Slop Design)
Mengadopsi prinsip `https://github.com/miqdadbadjuber/anti-slop`:
- **No AI Slop:** Jangan gunakan efek glassmorphism, gradient berlebihan, atau animasi lambat.
- **High Contrast:** Gunakan border tegas, font sans-serif tebal (Inter/Roboto), dan *spacing* padat ala *dashboard enterprise*.
- **Data-Dense:** Tabel produk untuk Admin dan Super Admin harus padat informasi (Harga Dasar | M. Ekop | M. Super | Total | Aksi) tanpa perlu *scroll* berlebihan.
