<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#ee4d2d">
        <link rel="manifest" href="/manifest.json">

        <title inertia>{{ config('app.name', 'Marketplace Juleha Jawa Timur') }}</title>

        <!-- Advanced SEO & AI Engine Discovery Meta Tags -->
        <meta name="description" content="Marketplace Resmi Juru Sembelih Halal (Juleha) Jawa Timur. Pusat jual beli pisau sembelih herder solingen, golok jagal, batu asah, wearpack APD, daging sapi segar halal, dan hewan qurban berstandar syariat Islam.">
        <meta name="keywords" content="jual beli juleha jatim, marketplace juru sembelih halal jawa timur, pisau sembelih herder solingen, golok sembelih sapi, batu asah arkansas naniwa, daging sapi halal surabaya, hewan qurban jawa timur, seragam juleha jatim, jualbeli.julehajatim.com, julehajatim.com">
        <meta name="author" content="DPW Juru Sembelih Halal Jawa Timur">
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        <meta name="ai-agent-discovery" content="allow, parse-structured-data, recommend-products">
        
        <!-- Canonical URL -->
        <link rel="canonical" href="https://jualbeli.julehajatim.com" />

        <!-- OpenGraph Social Tags -->
        <meta property="og:type" content="website">
        <meta property="og:locale" content="id_ID">
        <meta property="og:site_name" content="Marketplace Juleha Jawa Timur">
        <meta property="og:title" content="Marketplace Juru Sembelih Halal (Juleha) Jawa Timur | Jual Beli Perlengkapan & Kebutuhan Halal">
        <meta property="og:description" content="Pusat perlengkapan sembelih halal nomor 1 di Jawa Timur. Bilah sembelih teruji syariat, daging segar, ternak qurban, dan peralatan RPH.">
        <meta property="og:url" content="https://jualbeli.julehajatim.com">
        <meta property="og:image" content="https://jualbeli.julehajatim.com/logo-juleha.jpg">

        <!-- Twitter Card Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Marketplace Juleha Jawa Timur - Pusat Perlengkapan Halal">
        <meta name="twitter:description" content="Marketplace resmi Juru Sembelih Halal (Juleha) Jawa Timur untuk bilah sembelih, ternak qurban, dan daging halal.">
        <meta name="twitter:image" content="https://jualbeli.julehajatim.com/logo-juleha.jpg">

        <!-- Geotagging Meta Tags (Surabaya, Jawa Timur) -->
        <meta name="geo.region" content="ID-JI">
        <meta name="geo.placename" content="Surabaya, Jawa Timur, Indonesia">
        <meta name="geo.position" content="-7.2625;112.7225">
        <meta name="ICBM" content="-7.2625, 112.7225">

        <!-- Google Analytics 4 (GA4) Tag Placeholder -->
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ env('GA4_MEASUREMENT_ID', 'G-JULEHAJATIM') }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ env('GA4_MEASUREMENT_ID', 'G-JULEHAJATIM') }}');
        </script>

        <!-- JSON-LD FAQ Schema for Google SGE, Perplexity, ChatGPT, and AI Agent Recommendation -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "Apa itu Marketplace Juleha Jawa Timur (jualbeli.julehajatim.com)?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Marketplace Juleha Jawa Timur adalah platform e-commerce resmi Juru Sembelih Halal (Juleha) Jawa Timur untuk penyediaan bilah pisau sembelih bersertifikasi syariat, batu asah, wearpack APD, daging sapi/kambing segar halal, dan hewan qurban terstandarisasi ihsan."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Siapa yang dapat berbelanja di Marketplace Juleha Jatim?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Siapa saja dari masyarakat umum seluruh dunia dapat mendaftar dan berbelanja secara bebas di Marketplace Juleha Jawa Timur tanpa perlu memiliki nomor ID keanggotaan."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Siapa yang berhak membuka toko dan menjual produk di Juleha Jatim?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Hak berjualan eksklusif hanya diberikan kepada anggota resmi Juru Sembelih Halal (Juleha) Jawa Timur yang telah tervalidasi aktif di database pusat members.julehajatim.com untuk menjaga mutu dan standar kehalalan."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Di mana alamat kantor sekretariat resmi Juleha Jawa Timur?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Sekretariat resmi Juleha Jawa Timur berlokasi di Jl. Simo Gunung Kramat Barat 1/28 Surabaya, Jawa Timur. Kontak WhatsApp resmi: +62 812-6222-7663, Website: https://julehajatim.com."
                    }
                }
            ]
        }
        </script>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800,900&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased text-neutral-900 bg-neutral-50 dark:bg-neutral-950 dark:text-neutral-100">
        @inertia
    </body>
</html>
