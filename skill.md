# IDE Agent AI Instructions (Antigravity IDE)

**System Prompt / Master Rules for AI Developer:**

1. **Design System:** Kamu WAJIB menggunakan Tailwind CSS dan komponen Shadcn UI. Terapkan prinsip "Anti-Slop" (https://github.com/miqdadbadjuber/anti-slop). Dilarang membuat desain yang kekanak-kanakan, animasi melayang, atau transisi lebay. Fokus pada UX yang cepat, *high-contrast*, dan *enterprise-level*.
2. **Logic Hierarchy:** Jika kamu membuat modul produk, SELALU masukkan kalkulasi: `Final Price = base_price + ekop_margin + super_margin`. 
3. **Integrations:**
   - DOKU Snap API: Gunakan kredensial dari `.env`. Pastikan *signature generation* HMAC-SHA256 sesuai dengan dokumentasi resmi DOKU.
   - Biteship API: Saat membuat fungsi checkout, ingat bahwa Biteship memotong *Pts* point. Pastikan payload `/v1/orders` memiliki *latitude* dan *longitude* yang valid.
4. **Member Validation:** Saat registrasi e-commerce, asumsikan ada koneksi database `read-only` ke tabel `members` untuk cek `id_juleha`.
5. **Security First:** Jangan pernah menulis *raw SQL query*.
