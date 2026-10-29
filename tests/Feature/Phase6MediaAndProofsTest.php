<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\ImageUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Tests\TestCase;

class Phase6MediaAndProofsTest extends TestCase
{
    public function test_image_upload_service_compresses_image_to_lightweight_webp(): void
    {
        Storage::fake('public');

        // Generate a 1800x1200 test image (exceeds 1200px maxWidth)
        $file = UploadedFile::fake()->image('test_product_hd.jpg', 1800, 1200);

        /** @var ImageUploadService $service */
        $service = app(ImageUploadService::class);
        $publicUrl = $service->uploadAndCompress($file, 'test_uploads', 1200, 75);

        // Path format assertion
        $this->assertStringStartsWith('/storage/test_uploads/', $publicUrl);
        $this->assertStringEndsWith('.webp', $publicUrl);

        $diskPath = ltrim(str_replace('/storage/', '', $publicUrl), '/');
        Storage::disk('public')->assertExists($diskPath);

        // File size assertion: must be strictly lightweight (<300KB = 307200 bytes)
        $fileSize = Storage::disk('public')->size($diskPath);
        $this->assertLessThan(300 * 1024, $fileSize, 'Image file size must be below 300KB');

        // Dimensions assertion: width scaled down to 1200px max, aspect ratio preserved
        $content = Storage::disk('public')->get($diskPath);
        $manager = new ImageManager(new Driver());
        $readImage = $manager->read($content);

        $this->assertEquals(1200, $readImage->width());
        $this->assertEquals(800, $readImage->height());
    }

    private function getBuyerAndSeller(): array
    {
        $buyer = User::where('role', User::ROLE_USER)->first();
        if (!$buyer) {
            $buyer = User::create([
                'name' => 'Buyer Test',
                'email' => 'buyertest' . rand(1000, 9999) . '@example.com',
                'password' => bcrypt('password'),
                'role' => User::ROLE_USER,
            ]);
        }

        $seller = User::where('id', '!=', $buyer->id)->first();
        if (!$seller) {
            $seller = User::create([
                'name' => 'Seller Test',
                'email' => 'sellertest' . rand(1000, 9999) . '@example.com',
                'password' => bcrypt('password'),
                'role' => User::ROLE_USER,
                'user_type' => 'seller',
                'is_member' => true,
                'juleha_id' => 'JLH-TEST-SELLER',
            ]);
        }

        return [$buyer, $seller];
    }

    public function test_buyer_can_upload_transfer_receipt_for_manual_order(): void
    {
        Storage::fake('public');

        [$buyer, $seller] = $this->getBuyerAndSeller();

        $order = Order::create([
            'order_number' => 'JLH-RECEIPT-' . time(),
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'total_base_price' => 200000,
            'total_ekop_margin' => 15000,
            'total_super_margin' => 10000,
            'total_product_price' => 225000,
            'shipping_cost' => 15000,
            'insurance_cost' => 0,
            'grand_total' => 240000,
            'shipping_courier' => 'JNE',
            'shipping_service' => 'REG',
            'shipping_method_type' => Order::SHIPPING_METHOD_BITESHIP,
            'payment_method_type' => Order::PAYMENT_METHOD_MANUAL,
            'payment_status' => Order::PAYMENT_PENDING,
            'margin_settlement_status' => Order::MARGIN_UNSETTLED_DEBT,
            'shipping_status' => Order::SHIPPING_PENDING,
            'shipping_address' => [
                'recipient_name' => 'Ahmad',
                'recipient_phone' => '081234567890',
                'address' => 'Surabaya',
                'lat' => -7.2575,
                'lng' => 112.7521,
            ],
        ]);

        $fakeReceipt = UploadedFile::fake()->image('bukti_transfer.jpg', 1600, 1200);

        $response = $this->actingAs($buyer)
            ->post(route('orders.upload-transfer-receipt', $order->order_number), [
                'receipt' => $fakeReceipt,
            ]);

        $response->assertRedirect();

        $order->refresh();
        $this->assertEquals(Order::PAYMENT_AWAITING_CONFIRMATION, $order->payment_status);
        $this->assertNotNull($order->transfer_receipt_path);
        $this->assertStringEndsWith('.webp', $order->transfer_receipt_path);
        $this->assertEquals($order->transfer_receipt_path, $order->manual_payment_proof);
    }

    public function test_non_buyer_cannot_upload_transfer_receipt(): void
    {
        Storage::fake('public');

        [$buyer, $seller] = $this->getBuyerAndSeller();
        $stranger = User::where('id', '!=', $buyer->id)->where('id', '!=', $seller->id)->first();
        if (!$stranger) {
            $stranger = User::create([
                'name' => 'Stranger Test',
                'email' => 'stranger' . rand(1000, 9999) . '@example.com',
                'password' => bcrypt('password'),
                'role' => User::ROLE_USER,
            ]);
        }

        $order = Order::create([
            'order_number' => 'JLH-AUTH-' . time(),
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'total_base_price' => 100000,
            'total_ekop_margin' => 10000,
            'total_super_margin' => 5000,
            'total_product_price' => 115000,
            'shipping_cost' => 0,
            'grand_total' => 115000,
            'payment_method_type' => Order::PAYMENT_METHOD_MANUAL,
            'payment_status' => Order::PAYMENT_PENDING,
            'shipping_status' => Order::SHIPPING_PENDING,
            'shipping_address' => [
                'recipient_name' => 'Ahmad',
                'recipient_phone' => '081234567890',
                'address' => 'Surabaya',
                'lat' => -7.2575,
                'lng' => 112.7521,
            ],
        ]);

        $fakeReceipt = UploadedFile::fake()->image('bukti.jpg');

        $response = $this->actingAs($stranger)
            ->post(route('orders.upload-transfer-receipt', $order->order_number), [
                'receipt' => $fakeReceipt,
            ]);

        $response->assertStatus(403);
    }

    public function test_buyer_can_confirm_delivery_with_proof_and_quantity(): void
    {
        Storage::fake('public');

        [$buyer, $seller] = $this->getBuyerAndSeller();

        $order = Order::create([
            'order_number' => 'JLH-DELIVERY-' . time(),
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'total_base_price' => 300000,
            'total_ekop_margin' => 20000,
            'total_super_margin' => 10000,
            'total_product_price' => 330000,
            'shipping_cost' => 20000,
            'grand_total' => 350000,
            'payment_method_type' => Order::PAYMENT_METHOD_QRIS,
            'payment_status' => Order::PAYMENT_PAID,
            'shipping_status' => Order::SHIPPING_IN_TRANSIT,
            'shipping_address' => [
                'recipient_name' => 'Ahmad',
                'recipient_phone' => '081234567890',
                'address' => 'Surabaya',
                'lat' => -7.2575,
                'lng' => 112.7521,
            ],
        ]);

        $fakeDeliveryProof = UploadedFile::fake()->image('paket_sampai.jpg', 1500, 1000);

        $response = $this->actingAs($buyer)
            ->post(route('orders.confirm-delivery', $order->order_number), [
                'received_quantity' => 2,
                'delivery_proof' => $fakeDeliveryProof,
            ]);

        $response->assertRedirect();

        $order->refresh();
        $this->assertEquals(Order::SHIPPING_DELIVERED, $order->shipping_status);
        $this->assertEquals(2, $order->received_quantity);
        $this->assertNotNull($order->delivery_receipt_path);
        $this->assertStringEndsWith('.webp', $order->delivery_receipt_path);
        $this->assertNotNull($order->delivered_at);
    }

    public function test_seller_can_confirm_manual_payment_received(): void
    {
        [$buyer, $seller] = $this->getBuyerAndSeller();

        $order = Order::create([
            'order_number' => 'JLH-SELLER-CONFIRM-' . time(),
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'total_base_price' => 100000,
            'total_ekop_margin' => 10000,
            'total_super_margin' => 5000,
            'total_product_price' => 115000,
            'shipping_cost' => 0,
            'grand_total' => 115000,
            'payment_method_type' => Order::PAYMENT_METHOD_MANUAL,
            'payment_status' => Order::PAYMENT_AWAITING_CONFIRMATION,
            'shipping_status' => Order::SHIPPING_PENDING,
            'shipping_address' => [
                'recipient_name' => 'Ahmad',
                'recipient_phone' => '081234567890',
                'address' => 'Surabaya',
                'lat' => -7.2575,
                'lng' => 112.7521,
            ],
        ]);

        $response = $this->actingAs($seller)
            ->post(route('orders.confirm-payment', $order->order_number));

        $response->assertRedirect();

        $order->refresh();
        $this->assertEquals(Order::PAYMENT_PAID, $order->payment_status);
        $this->assertNotNull($order->paid_at);
    }
}
