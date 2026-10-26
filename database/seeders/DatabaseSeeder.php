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
        $superAdmin = User::updateOrCreate(
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
        $adminEkop = User::updateOrCreate(
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
        $memberSeller = User::updateOrCreate(
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

        // Update Produk 1 menjadi Flash Sale
        $product1->update([
            'is_flash_sale' => true,
            'flash_sale_price' => 590000.00,
            'flash_sale_discount_percent' => 25,
            'flash_sale_stock' => 8,
            'flash_sale_end' => now()->addDays(2),
        ]);

        // Produk Flash Sale 2 (LIVE): Golok Jagal
        Product::updateOrCreate(
            ['slug' => 'golok-jagal-sembelih-baja-per-willys-tempa-rph-28cm'],
            [
                'user_id' => $memberSeller->id,
                'category_id' => $categories['golok-dan-bendo']->id,
                'title' => 'Golok Jagal Sembelih Baja Per Willys Tempa RPH Panjang 28cm',
                'slug' => 'golok-jagal-sembelih-baja-per-willys-tempa-rph-28cm',
                'description' => 'Golok sembelih hand-forged dari baja per jip willys legendaris dengan sepuh oli tepat. Sangat tangguh untuk sembelih leher sapi kerbau tanpa gompal.',
                'image_url' => 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?auto=format&fit=crop&w=800&q=80',
                'weight_gram' => 550,
                'base_price' => 450000.00,
                'ekop_margin' => 30000.00,
                'super_margin' => 15000.00,
                'final_price' => 495000.00,
                'is_flash_sale' => true,
                'flash_sale_price' => 345000.00,
                'flash_sale_discount_percent' => 30,
                'flash_sale_stock' => 12,
                'flash_sale_end' => now()->addDays(2),
                'stock' => 15,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'status' => Product::STATUS_LIVE,
                'reviewed_by_ekop_id' => $adminEkop->id,
                'reviewed_by_super_id' => $superAdmin->id,
                'rating_avg' => 5.0,
                'reviews_count' => 5,
                'sold_count' => 42,
            ]
        );

        // Produk Flash Sale 3 (LIVE): Batu Asah Alami
        Product::updateOrCreate(
            ['slug' => 'batu-asah-arkansas-natural-finishing-grit-6000'],
            [
                'user_id' => $memberSeller->id,
                'category_id' => $categories['batu-dan-alat-asah']->id,
                'title' => 'Batu Asah Alami White Arkansas Finishing Mirror Grit 6000',
                'slug' => 'batu-asah-arkansas-natural-finishing-grit-6000',
                'description' => 'Batu asah gunung asli berkarakter padat halus untuk meluruskan micro bevel dan mengkilapkan mata bilah sembelihan.',
                'image_url' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                'weight_gram' => 600,
                'base_price' => 230000.00,
                'ekop_margin' => 20000.00,
                'super_margin' => 10000.00,
                'final_price' => 260000.00,
                'is_flash_sale' => true,
                'flash_sale_price' => 195000.00,
                'flash_sale_discount_percent' => 25,
                'flash_sale_stock' => 10,
                'flash_sale_end' => now()->addDays(2),
                'stock' => 20,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'status' => Product::STATUS_LIVE,
                'reviewed_by_ekop_id' => $adminEkop->id,
                'reviewed_by_super_id' => $superAdmin->id,
                'rating_avg' => 4.9,
                'reviews_count' => 4,
                'sold_count' => 29,
            ]
        );

        // Produk Flash Sale 4 (LIVE): Daging Sapi Segar
        Product::updateOrCreate(
            ['slug' => 'daging-sapi-segar-paha-depan-halal-juleha-1kg'],
            [
                'user_id' => $memberSeller->id,
                'category_id' => $categories['daging-halal']->id,
                'title' => 'Daging Sapi Segar Paha Depan (Chuck) Sembelih Halal Juleha 1 Kg',
                'slug' => 'daging-sapi-segar-paha-depan-halal-juleha-1kg',
                'description' => 'Daging sapi lokal segar kualitas premium disembelih oleh Juru Sembelih Halal bersertifikasi resmi, higienis, halal 100%, dan bebas bahan pengawet.',
                'image_url' => 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
                'weight_gram' => 1000,
                'base_price' => 120000.00,
                'ekop_margin' => 10000.00,
                'super_margin' => 5000.00,
                'final_price' => 135000.00,
                'is_flash_sale' => true,
                'flash_sale_price' => 110000.00,
                'flash_sale_discount_percent' => 18,
                'flash_sale_stock' => 30,
                'flash_sale_end' => now()->addDays(2),
                'stock' => 50,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'status' => Product::STATUS_LIVE,
                'reviewed_by_ekop_id' => $adminEkop->id,
                'reviewed_by_super_id' => $superAdmin->id,
                'rating_avg' => 5.0,
                'reviews_count' => 8,
                'sold_count' => 87,
            ]
        );

        // Produk 5: Wearpack APD Juleha (LIVE)
        Product::updateOrCreate(
            ['slug' => 'wearpack-apd-resmi-juleha-jatim-waterproof'],
            [
                'user_id' => $memberSeller->id,
                'category_id' => $categories['wearpack-dan-apd']->id,
                'title' => 'Wearpack Sembelih Resmi Juleha Jatim Bahan Drill Tebal Waterproof',
                'slug' => 'wearpack-apd-resmi-juleha-jatim-waterproof',
                'description' => 'Seragam kebanggaan Juru Sembelih Halal Jawa Timur dengan bordir logo resmi, nyaman, adem, dan dilapisi lapisan anti-darah untuk operasional RPH & Qurban.',
                'image_url' => 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
                'weight_gram' => 700,
                'base_price' => 220000.00,
                'ekop_margin' => 15000.00,
                'super_margin' => 10000.00,
                'final_price' => 245000.00,
                'stock' => 35,
                'region_code' => 'SDA',
                'region_name' => 'KABUPATEN SIDOARJO',
                'status' => Product::STATUS_LIVE,
                'reviewed_by_ekop_id' => $adminEkop->id,
                'reviewed_by_super_id' => $superAdmin->id,
                'rating_avg' => 4.9,
                'reviews_count' => 6,
                'sold_count' => 53,
            ]
        );

        // 7. Seed Vouchers (Gratis Ongkir & Diskon Shopee-style)
        \App\Models\Voucher::updateOrCreate(
            ['code' => 'GRATISONGKIR'],
            [
                'title' => 'Gratis Ongkir s.d Rp 20.000',
                'description' => 'Potongan ongkos kirim ke seluruh Jawa Timur dengan kurir Biteship.',
                'type' => \App\Models\Voucher::TYPE_FREE_SHIPPING,
                'discount_amount' => 20000.00,
                'min_spend' => 50000.00,
                'scope' => \App\Models\Voucher::SCOPE_GLOBAL,
                'created_by' => $superAdmin->id,
                'is_active' => true,
            ]
        );

        \App\Models\Voucher::updateOrCreate(
            ['code' => 'JULEHA10'],
            [
                'title' => 'Diskon 10% Spesial Halal',
                'description' => 'Potongan 10% maksimal Rp 50.000 untuk semua perlengkapan sembelih.',
                'type' => \App\Models\Voucher::TYPE_DISCOUNT_PERCENT,
                'discount_amount' => 10.00,
                'min_spend' => 100000.00,
                'max_discount' => 50000.00,
                'scope' => \App\Models\Voucher::SCOPE_GLOBAL,
                'created_by' => $superAdmin->id,
                'is_active' => true,
            ]
        );

        \App\Models\Voucher::updateOrCreate(
            ['code' => 'BAROKAH25'],
            [
                'title' => 'Voucher Barokah Rp 25.000',
                'description' => 'Potongan langsung Rp 25.000 minimal belanja Rp 200.000.',
                'type' => \App\Models\Voucher::TYPE_DISCOUNT_FIXED,
                'discount_amount' => 25000.00,
                'min_spend' => 200000.00,
                'scope' => \App\Models\Voucher::SCOPE_GLOBAL,
                'created_by' => $superAdmin->id,
                'is_active' => true,
            ]
        );
    }
}
