<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Super Admin (Provinsi Jawa Timur)
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@julehajatim.com'],
            [
                'juleha_id' => 'JTM-SUPER-01',
                'name' => 'Super Admin DPW Juleha Jatim',
                'phone' => '081133334444',
                'password' => Hash::make('superadmin123'),
                'role' => User::ROLE_SUPER_ADMIN,
                'region_code' => 'JTM',
                'region_name' => 'JAWA TIMUR (DPW PUSAT)',
                'address' => 'Gedung Islamic Centre Jawa Timur, Jl. Dukuh Kupang, Surabaya',
                'lat' => -7.2882,
                'lng' => 112.7214,
                'is_verified' => true,
            ]
        );

        // 2. Admin Ekop (Kabupaten Sidoarjo)
        $adminEkop = User::firstOrCreate(
            ['email' => 'ekop.sidoarjo@julehajatim.com'],
            [
                'juleha_id' => 'SDA-EKOP-01',
                'name' => 'Admin Ekop DPD Sidoarjo',
                'phone' => '081234567800',
                'password' => Hash::make('ekop123'),
                'role' => User::ROLE_ADMIN_EKOP,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'address' => 'Sekretariat DPD Juleha Sidoarjo, Jl. Pahlawan, Sidoarjo',
                'lat' => -7.4478,
                'lng' => 112.7183,
                'is_verified' => true,
            ]
        );

        // 3. User Anggota Penjual (Terhubung dengan data ID Juleha riil SDA220001)
        $memberSeller = User::firstOrCreate(
            ['email' => 'slamet@julehajatim.com'],
            [
                'juleha_id' => 'SDA220001',
                'name' => 'Muhammad Slamet',
                'phone' => '081234567891',
                'password' => Hash::make('anggota123'),
                'role' => User::ROLE_USER,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'address' => 'Sentra Pandai Besi & Bilah Sidoarjo, Jl. Raya Candi No. 45',
                'lat' => -7.4726,
                'lng' => 112.7058,
                'is_verified' => true,
            ]
        );

        // 4. User Anggota Pembeli
        $memberBuyer = User::firstOrCreate(
            ['email' => 'puji@julehajatim.com'],
            [
                'juleha_id' => 'SDA220004',
                'name' => 'Puji Prayitno',
                'phone' => '081298765432',
                'password' => Hash::make('anggota123'),
                'role' => User::ROLE_USER,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'address' => 'RPH Krian, Sidoarjo',
                'lat' => -7.4069,
                'lng' => 112.5833,
                'is_verified' => true,
            ]
        );

        // 5. Kategori Produk
        $categoriesData = [
            [
                'name' => 'Pisau Sembelih Standar Halal',
                'slug' => 'pisau-sembelih',
                'description' => 'Bilah sembelih bersertifikasi tajam cukur bulu, memenuhi standar syariat sembelih sekali tarik tanpa henti.',
                'icon' => 'Sword',
            ],
            [
                'name' => 'Golok & Bendo RPH',
                'slug' => 'golok-dan-bendo',
                'description' => 'Golok sembelih sapi jumbo, kerbau, dan bendo cacah tulang berkualitas baja per/baja tempa unggulan.',
                'icon' => 'Axe',
            ],
            [
                'name' => 'Batu & Alat Asah (Sharpening)',
                'slug' => 'batu-dan-alat-asah',
                'description' => 'Whetstone grit 1000 hingga 8000, leather strop, dan honing rod pembantu ketajaman maksimal bilah sembelih.',
                'icon' => 'Sparkles',
            ],
            [
                'name' => 'Wearpack & APD Juleha',
                'slug' => 'wearpack-dan-apd',
                'description' => 'Celemek kulit tahan tusuk (leather apron), sarung tangan rantai pelindung sayat, dan sepatu boot safety.',
                'icon' => 'ShieldCheck',
            ],
            [
                'name' => 'Tali & Perlengkapan Handling',
                'slug' => 'tali-dan-handling',
                'description' => 'Tali simpul burley, tambang katun empuk, dan alat perebah sapi aman tanpa menyakiti hewan.',
                'icon' => 'Link',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['slug']] = Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 6. Produk Sampel dengan Hierarki Harga & Multi Status
        // Produk 1: LIVE (Sudah di-ACC Ekop dan Super Admin)
        Product::firstOrCreate(
            ['slug' => 'pisau-sembelih-herder-solingen-original-30cm'],
            [
                'user_id' => $memberSeller->id,
                'category_id' => $categories['pisau-sembelih']->id,
                'title' => 'Pisau Sembelih Herder Solingen Cap Garpu Original 30cm',
                'slug' => 'pisau-sembelih-herder-solingen-original-30cm',
                'description' => "Pisau sembelih sapi legendaris Friedrich Herder Abr. Sohn Solingen Germany ukuran 30cm (12 inch). Terbuat dari Carbon Steel bermutu tinggi dengan ketajaman razor sharp sekali tarik untuk leher sapi/kambing sesuai standar syar'i Juleha. Bilah sudah di-treatment khusus oleh pandai bilah tersertifikasi.",
                'image_url' => 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80',
                ],
                'weight_gram' => 450,
                'length_cm' => 45,
                'width_cm' => 8,
                'height_cm' => 4,
                'base_price' => 750000.00,
                'ekop_margin' => 25000.00, // Kas Daerah Kab/Kota
                'super_margin' => 15000.00, // Kas Provinsi Jatim
                'final_price' => 790000.00, // 750k + 25k + 15k
                'stock' => 12,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'status' => Product::STATUS_LIVE,
                'reviewed_by_ekop_id' => $adminEkop->id,
                'reviewed_by_super_id' => $superAdmin->id,
            ]
        );

        // Produk 2: APPROVED_EKOP (Menunggu Super Admin ACC)
        Product::firstOrCreate(
            ['slug' => 'batu-asah-naniwa-professional-grit-3000-original'],
            [
                'user_id' => $memberSeller->id,
                'category_id' => $categories['batu-dan-alat-asah']->id,
                'title' => 'Batu Asah Naniwa Chosera Professional Grit 3000 Original Japan',
                'slug' => 'batu-asah-naniwa-professional-grit-3000-original',
                'description' => 'Batu asah sintetis magnesia bonded asli Jepang untuk finishing bilah sembelih agar mencapai tingkat ketajaman mirror finish cukur bulu.',
                'image_url' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                'weight_gram' => 900,
                'length_cm' => 22,
                'width_cm' => 9,
                'height_cm' => 5,
                'base_price' => 950000.00,
                'ekop_margin' => 30000.00,
                'super_margin' => 0.00,
                'final_price' => 980000.00,
                'stock' => 5,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'status' => Product::STATUS_APPROVED_EKOP,
                'reviewed_by_ekop_id' => $adminEkop->id,
            ]
        );

        // Produk 3: PENDING (Baru diupload Penjual, butuh ACC Admin Ekop)
        Product::firstOrCreate(
            ['slug' => 'apron-celemek-kulit-sapi-asli-juleha-anti-sayat'],
            [
                'user_id' => $memberSeller->id,
                'category_id' => $categories['wearpack-dan-apd']->id,
                'title' => 'Apron Celemek Kulit Sapi Asli Juleha Full Protection Anti Sayat',
                'slug' => 'apron-celemek-kulit-sapi-asli-juleha-anti-sayat',
                'description' => 'Celemek khusus juru sembelih dari kulit sapi tebal tahan darah, cipratan air, dan goresan bilah tajam.',
                'image_url' => 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
                'weight_gram' => 800,
                'length_cm' => 30,
                'width_cm' => 20,
                'height_cm' => 6,
                'base_price' => 280000.00,
                'ekop_margin' => 0.00,
                'super_margin' => 0.00,
                'final_price' => 280000.00,
                'stock' => 20,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'status' => Product::STATUS_PENDING,
            ]
        );
    }
}
