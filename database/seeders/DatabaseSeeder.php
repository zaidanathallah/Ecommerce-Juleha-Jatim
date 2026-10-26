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
                'name' => 'Super Admin Juleha Jatim',
                'phone' => '081133334444',
                'password' => Hash::make('superadmin123'),
                'role' => User::ROLE_SUPER_ADMIN,
                'user_type' => 'seller',
                'is_member' => true,
                'region_code' => 'JTM',
                'region_name' => 'JAWA TIMUR (PUSAT)',
                'address' => 'Jl. Simo Gunung Kramat Barat 1/28 Surabaya',
                'lat' => -7.2655,
                'lng' => 112.7230,
                'is_verified' => true,
            ]
        );

        // 2. Admin Ekop (Kabupaten Sidoarjo)
        $adminEkop = User::firstOrCreate(
            ['email' => 'ekop.sidoarjo@julehajatim.com'],
            [
                'juleha_id' => 'SDA-EKOP-01',
                'name' => 'Admin Ekop Sidoarjo',
                'phone' => '081234567800',
                'password' => Hash::make('ekop123'),
                'role' => User::ROLE_ADMIN_EKOP,
                'user_type' => 'seller',
                'is_member' => true,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'address' => 'Sekretariat Juleha Sidoarjo, Jl. Pahlawan, Sidoarjo',
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
                'shop_name' => 'Sentra Bilah & Perlengkapan Sidoarjo',
                'phone' => '081234567891',
                'password' => Hash::make('anggota123'),
                'role' => User::ROLE_USER,
                'user_type' => 'seller',
                'is_member' => true,
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
                'user_type' => 'buyer',
                'is_member' => true,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'address' => 'RPH Krian, Sidoarjo',
                'lat' => -7.4069,
                'lng' => 112.5833,
                'is_verified' => true,
            ]
        );

        // 5. User Pembeli Umum (Masyarakat Luas / Non-Anggota)
        $generalBuyer = User::firstOrCreate(
            ['email' => 'buyer.umum@gmail.com'],
            [
                'name' => 'Ahmad Rabbani',
                'phone' => '085711223344',
                'password' => Hash::make('pembeli123'),
                'role' => User::ROLE_USER,
                'user_type' => 'buyer',
                'is_member' => false,
                'region_code' => 'UMUM',
                'region_name' => 'Pembeli Umum',
                'address' => 'Jl. Manyar Kertoarjo No. 15, Surabaya',
                'lat' => -7.2825,
                'lng' => 112.7638,
                'is_verified' => true,
            ]
        );

        // 6. Kategori Produk Luas (Bisa Jual Apa Saja)
        $categoriesData = [
            [
                'name' => 'Pisau Sembelih Standar Halal',
                'slug' => 'pisau-sembelih',
                'description' => 'Bilah sembelih bersertifikasi tajam cukur bulu, memenuhi standar syariat sembelih sekali tarik.',
                'icon' => 'Sword',
            ],
            [
                'name' => 'Golok & Bendo RPH',
                'slug' => 'golok-dan-bendo',
                'description' => 'Golok sembelih sapi jumbo, kerbau, dan bendo cacah tulang berkualitas baja per/tempa.',
                'icon' => 'Axe',
            ],
            [
                'name' => 'Batu & Alat Asah (Sharpening)',
                'slug' => 'batu-dan-alat-asah',
                'description' => 'Whetstone grit 1000 hingga 8000, leather strop, dan honing rod pembantu ketajaman maksimal.',
                'icon' => 'Sparkles',
            ],
            [
                'name' => 'Wearpack & APD Juleha',
                'slug' => 'wearpack-dan-apd',
                'description' => 'Celemek kulit tahan tusuk, sarung tangan pelindung sayat, dan sepatu boot safety.',
                'icon' => 'ShieldCheck',
            ],
            [
                'name' => 'Tali & Perlengkapan Handling',
                'slug' => 'tali-dan-handling',
                'description' => 'Tali simpul burley, tambang katun empuk, dan alat perebah sapi aman tanpa menyakiti hewan.',
                'icon' => 'Link',
            ],
            [
                'name' => 'Hewan Qurban & Ternak Halal',
                'slug' => 'hewan-qurban-ternak',
                'description' => 'Sapi, kambing, dan domba qurban sehat, bertanduk, cukup umur, dan lolos uji veteriner.',
                'icon' => 'Heart',
            ],
            [
                'name' => 'Daging Segar & Frozen Halal',
                'slug' => 'daging-halal',
                'description' => 'Daging sapi, kambing, dan ayam sembelihan halal segar higienis dan terstandarisasi.',
                'icon' => 'Utensils',
            ],
            [
                'name' => 'Bumbu, Rempah & Pangan',
                'slug' => 'bumbu-dan-pangan',
                'description' => 'Bumbu racik olahan daging, rempah dapur alami, dan bahan pangan bersertifikat halal.',
                'icon' => 'Coffee',
            ],
            [
                'name' => 'Peralatan Dapur & Resto',
                'slug' => 'peralatan-dapur-resto',
                'description' => 'Talenan kayu jati/kayu asem higienis, pengait karkas daging, timbangan, dan wadah stainless steel.',
                'icon' => 'Box',
            ],
            [
                'name' => 'Buku & Edukasi Juleha',
                'slug' => 'buku-dan-edukasi',
                'description' => 'Buku fiqih sembelih halal, panduan sertifikasi juru sembelih BNSP, dan modul pelatihan.',
                'icon' => 'BookOpen',
            ],
            [
                'name' => 'Aneka Produk Lainnya',
                'slug' => 'aneka-produk-lainnya',
                'description' => 'Berbagai produk penunjang usaha juru sembelih dan kebutuhan masyarakat umum.',
                'icon' => 'Tag',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['slug']] = Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 7. Produk Sampel dengan Hierarki Harga & Rating/Review
        // Produk 1: LIVE
        $product1 = Product::updateOrCreate(
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
                'ekop_margin' => 25000.00,
                'super_margin' => 15000.00,
                'final_price' => 790000.00,
                'stock' => 12,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'status' => Product::STATUS_LIVE,
                'reviewed_by_ekop_id' => $adminEkop->id,
                'reviewed_by_super_id' => $superAdmin->id,
                'rating_avg' => 4.9,
                'reviews_count' => 3,
                'sold_count' => 38,
            ]
        );

        // Tambah Ulasan Sampel untuk Produk 1
        \App\Models\Review::firstOrCreate(
            ['user_id' => $memberBuyer->id, 'product_id' => $product1->id],
            [
                'rating' => 5,
                'comment' => "Alhamdulillah pisaunya luar biasa tajam! Sudah dicoba sembelih 5 ekor sapi limousin sekali tarik leher langsung putus sempurna. Standar syariat mantap!",
                'is_verified_buyer' => true,
            ]
        );

        \App\Models\Review::firstOrCreate(
            ['user_id' => $generalBuyer->id, 'product_id' => $product1->id],
            [
                'rating' => 5,
                'comment' => "Packing sangat aman dengan paralon tebal. Pengiriman Biteship cepat sampai ke Surabaya. Pisau original cap garpu Solingen asli!",
                'is_verified_buyer' => true,
            ]
        );

        \App\Models\Review::firstOrCreate(
            ['user_id' => $adminEkop->id, 'product_id' => $product1->id],
            [
                'rating' => 5,
                'comment' => "Produk terverifikasi tim pengurus daerah. Bilah lolos uji ketajaman kertas dan cukur bulu tanpa hambatan.",
                'is_verified_buyer' => true,
            ]
        );

        // Produk 2: APPROVED_EKOP
        Product::updateOrCreate(
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
                'rating_avg' => 5.0,
                'reviews_count' => 1,
                'sold_count' => 14,
            ]
        );

        // Produk 3: PENDING
        Product::updateOrCreate(
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
                'rating_avg' => 4.8,
                'reviews_count' => 0,
                'sold_count' => 6,
            ]
        );
    }
}
