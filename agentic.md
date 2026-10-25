# SEO Advance & Agentic AI Optimization

Untuk memastikan platform muncul di Google No. 1 dan mudah dibaca oleh AI Agents (LLM, Google AI Overviews, dll):

## 1. Semantic HTML (Anti-Slop)
Gunakan tag yang jelas (header, article, section, nav). Hindari penggunaan `div` berlebihan (div-soup). AI Agent membaca hierarki `<h1>` ke `<h2>` untuk mengerti konteks.

## 2. Schema.org & JSON-LD
Tanamkan *Rich Snippets* JSON-LD di halaman detail produk agar Google dan AI paham detail barang secara *native*:
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Pisau Sembelih Herder Original",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "IDR",
    "price": "550000",
    "availability": "https://schema.org/InStock"
  }
}
```

## 3. Crawlability
- `robots.txt`: Izinkan *crawling* pada halaman produk publik, namun blokir path `/admin` dan `/checkout`.
- `sitemap.xml`: *Generate* otomatis setiap kali ada produk baru yang di-ACC oleh Super Admin.
