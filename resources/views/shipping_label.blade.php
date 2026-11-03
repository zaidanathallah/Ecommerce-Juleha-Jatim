<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Label Pengiriman - {{ $order->order_number }}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
        }

        body {
            background-color: #f5f5f5;
            color: #000;
            padding: 20px;
        }

        .no-print-bar {
            max-width: 100mm;
            margin: 0 auto 15px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            border: none;
        }

        .btn-print {
            background-color: #ee4d2d;
            color: #fff;
        }

        .btn-print:hover {
            background-color: #d03e1f;
        }

        .btn-download {
            background-color: #2b3990;
            color: #fff;
        }

        .btn-back {
            background-color: #e5e7eb;
            color: #374151;
        }

        /* 100mm x 150mm (A6) Standard Thermal Sticker Dimensions */
        .shipping-label {
            width: 100mm;
            min-height: 148mm;
            margin: 0 auto;
            background: #fff;
            border: 2px solid #000;
            font-size: 11px;
            line-height: 1.3;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
            border-bottom: 1.5px solid #000;
        }

        .courier-badge {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }

        .courier-sub {
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 0.5px;
            display: block;
            margin-top: -2px;
        }

        .logistics-brand {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 900;
            font-size: 14px;
            color: #111;
            text-align: right;
        }

        .logistics-brand span {
            font-size: 8px;
            display: block;
            font-weight: bold;
            color: #ee4d2d;
            text-align: right;
        }

        .main-barcode-section {
            padding: 12px 14px 8px 14px;
            text-align: center;
            border-bottom: 1.5px solid #000;
        }

        .main-barcode-svg {
            max-width: 90%;
            height: 55px;
            margin: 0 auto 6px auto;
        }

        .waybill-number {
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .rate-service-line {
            font-size: 11px;
            font-weight: 600;
            border-top: 1px dashed #666;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
        }

        .mid-section {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            border-bottom: 1.5px solid #000;
        }

        .mid-left {
            padding: 8px 12px;
            border-right: 1.5px solid #000;
        }

        .mid-left .ref-label {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .mid-left .ref-svg {
            max-width: 100%;
            height: 35px;
            margin-bottom: 2px;
        }

        .mid-left .ref-text {
            font-size: 10px;
            font-family: monospace;
            font-weight: bold;
        }

        .mid-right {
            padding: 8px 12px;
            font-size: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
        }

        .mid-right div {
            display: flex;
            justify-content: space-between;
        }

        .mid-right strong {
            font-size: 11px;
        }

        .address-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 1.5px solid #000;
            font-size: 9.5px;
        }

        .addr-box {
            padding: 8px 12px;
        }

        .addr-box:first-child {
            border-right: 1.5px solid #000;
        }

        .addr-title {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            margin-bottom: 4px;
            color: #222;
        }

        .addr-name {
            font-weight: 900;
            font-size: 11px;
            margin-bottom: 2px;
        }

        .addr-phone {
            font-weight: bold;
            margin-bottom: 4px;
        }

        .addr-detail {
            color: #111;
            line-height: 1.25;
        }

        .items-section {
            padding: 8px 12px;
            border-bottom: 1.5px solid #000;
            font-size: 9.5px;
        }

        .items-title {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .item-row {
            margin-bottom: 2px;
            line-height: 1.25;
        }

        .notes-section {
            padding: 6px 12px;
            border-bottom: 1.5px solid #000;
            font-size: 9px;
        }

        .footer-section {
            padding: 6px 12px;
            text-align: center;
            font-size: 8px;
            color: #333;
            background: #fafafa;
        }

        .footer-section strong {
            font-size: 9px;
            color: #000;
        }

        @media print {
            body {
                background: none;
                padding: 0;
            }

            .no-print-bar {
                display: none !important;
            }

            .shipping-label {
                width: 100mm;
                height: 150mm;
                border: 1.5px solid #000;
                page-break-after: always;
            }

            @page {
                size: 100mm 150mm;
                margin: 0;
            }
        }
    </style>
</head>
<body>

    <div class="no-print-bar">
        <a href="{{ route('orders.show', $order->order_number) }}" class="btn btn-back">
            &larr; Kembali
        </a>
        <div style="display: flex; gap: 8px;">
            @if(!empty($order->biteship_label_url))
                <a href="{{ $order->biteship_label_url }}" target="_blank" class="btn btn-download">
                    Download PDF Resmi
                </a>
            @endif
            <button onclick="window.print()" class="btn btn-print">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
                Cetak Label Resi (A6)
            </button>
        </div>
    </div>

    <div class="shipping-label">
        <!-- 1. Header: Kurir & Biteship Brand -->
        <div class="section-header">
            <div>
                <span class="courier-badge">{{ $order->shipping_courier ?: 'JNE' }}</span>
                <span class="courier-sub">EXPRESS ACROSS NATIONS</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="{{ $logoBase64 ?? asset('logo-juleha.jpg') }}" alt="Logo Juleha Jatim" style="height: 38px; width: 38px; object-fit: contain; border-radius: 6px; border: 1px solid #ddd;">
                <div>
                    <div class="logistics-brand" style="justify-content: flex-end;">
                        JULEHA LOGISTIK
                    </div>
                    <span style="font-size: 8px; color: #444; display: block; text-align: right; font-weight: bold; letter-spacing: 0.5px;">STANDAR SYARIAT JATIM</span>
                </div>
            </div>
        </div>

        <!-- 2. Main Resi Barcode Section -->
        <div class="main-barcode-section">
            <div class="main-barcode-svg">
                {!! $waybillBarcode !!}
            </div>
            <div class="waybill-number">
                @if(!empty($waybill))
                    Nomor Resi - {{ $waybill }}
                @else
                    <span style="color: #c2410c;">[RESI MENUNGGU KONFIRMASI KURIR]</span>
                    <span style="font-size: 9px; display: block; font-weight: normal; color: #666; margin-top: 2px;">
                        Order Ref: {{ $order->biteship_order_id ?: $order->order_number }} &bull; Barcode Referensi Logistik
                    </span>
                @endif
            </div>
            <div class="rate-service-line">
                <span>Ongkos Kirim: <strong>Rp. {{ number_format($order->shipping_cost, 0, ',', '.') }}</strong></span>
                <span>Jenis Layanan - {{ strtoupper($order->shipping_service ?: 'REGULER') }}</span>
            </div>
        </div>

        <!-- 3. Mid Section: Reference & Weight -->
        <div class="mid-section">
            <div class="mid-left">
                <div class="ref-label">Reference Number</div>
                <div class="ref-svg">
                    {!! $orderBarcode !!}
                </div>
                <div class="ref-text">{{ $order->order_number }}</div>
            </div>
            <div class="mid-right">
                <div>
                    <span>Quantity:</span>
                    <strong>{{ $order->items->sum('quantity') }} Pcs</strong>
                </div>
                <div>
                    <span>Weight:</span>
                    <strong>{{ number_format(($order->items->sum('quantity') * 500) / 1000, 1) }} Kg</strong>
                </div>
                <div>
                    <span>Asuransi:</span>
                    <strong>Rp. 0</strong>
                </div>
            </div>
        </div>

        <!-- 4. Address Section -->
        <div class="address-section">
            <!-- Penerima -->
            <div class="addr-box">
                <div class="addr-title">Alamat Penerima:</div>
                <div class="addr-name">{{ $shippingAddress['recipient_name'] ?? $order->buyer->name }}</div>
                <div class="addr-phone">{{ $shippingAddress['recipient_phone'] ?? $order->buyer->phone ?? '-' }}</div>
                <div class="addr-detail">
                    {{ $shippingAddress['address'] ?? 'Surabaya, Jawa Timur' }}
                </div>
            </div>

            <!-- Pengirim -->
            <div class="addr-box">
                <div class="addr-title">Alamat Pengirim:</div>
                <div class="addr-name">{{ $seller->shop_name ?: $seller->name }}</div>
                <div class="addr-phone">{{ $seller->phone ?: '08123456789' }}</div>
                <div class="addr-detail">
                    {{ $seller->address ?: 'Sentra Perlengkapan Sembelih Halal Juleha Jatim' }}
                </div>
            </div>
        </div>

        <!-- 5. Package Items -->
        <div class="items-section">
            <div class="items-title">Jenis Barang:</div>
            @foreach($order->items as $it)
                <div class="item-row">
                    [{{ strtoupper(substr($it->product_title, 0, 12)) }}] {{ $it->quantity }}x {{ $it->product_title }}
                </div>
            @endforeach
        </div>

        <!-- 6. Notes -->
        <div class="notes-section">
            <strong>Catatan:</strong> {{ !empty($shippingAddress['notes']) ? $shippingAddress['notes'] : 'Barang Halal Terstandarisasi Juleha Jawa Timur. Harap tangani dengan baik (Fragile).' }}
        </div>

        <!-- 7. Footer -->
        <div class="footer-section">
            Pengiriman Logistik Resmi Terstandarisasi <strong>Jual Beli Juleha Jatim</strong><br>
            Standar Mutu Syariat &bull; jualbeli.julehajatim.com
        </div>
    </div>

</body>
</html>

