<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const PAYMENT_PENDING = 'pending';
    public const PAYMENT_AWAITING_CONFIRMATION = 'awaiting_seller_confirmation';
    public const PAYMENT_PAID = 'paid';
    public const PAYMENT_EXPIRED = 'expired';
    public const PAYMENT_FAILED = 'failed';

    public const SHIPPING_PENDING = 'pending';
    public const SHIPPING_CONFIRMED = 'confirmed';
    public const SHIPPING_PICKUP_REQUESTED = 'pickup_requested';
    public const SHIPPING_IN_TRANSIT = 'in_transit';
    public const SHIPPING_DELIVERED = 'delivered';
    public const SHIPPING_CANCELLED = 'cancelled';

    public const PAYMENT_METHOD_QRIS = 'qris_dinamis';
    public const PAYMENT_METHOD_MANUAL = 'manual_transfer';

    public const SHIPPING_METHOD_BITESHIP = 'biteship';
    public const SHIPPING_METHOD_MANUAL = 'manual_courier';

    public const MARGIN_SETTLED_PG = 'settled_via_pg';
    public const MARGIN_UNSETTLED_DEBT = 'unsettled_debt'; // Hutang Penjual ke Kas Organisasi
    public const MARGIN_PAID_TREASURY = 'paid_to_treasury'; // Sudah disetor ke Kas Organisasi

    protected $fillable = [
        'order_number',
        'buyer_id',
        'seller_id',
        'total_base_price',
        'total_ekop_margin',
        'total_super_margin',
        'total_product_price',
        'shipping_cost',
        'insurance_cost',
        'grand_total',
        'shipping_courier',
        'shipping_service',
        'shipping_method_type',
        'shipping_address',
        'biteship_order_id',
        'biteship_waybill_id',
        'biteship_tracking_status',
        'qris_invoice_number',
        'qris_payment_url',
        'qris_content',
        'qris_image_url',
        'voucher_id',
        'voucher_code',
        'discount_amount',
        'payment_method_type',
        'payment_status',
        'margin_settlement_status',
        'seller_bank_info_snapshot',
        'manual_payment_proof',
        'transfer_receipt_path',
        'delivery_receipt_path',
        'received_quantity',
        'shipping_status',
        'paid_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'total_base_price' => 'decimal:2',
            'total_ekop_margin' => 'decimal:2',
            'total_super_margin' => 'decimal:2',
            'total_product_price' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'insurance_cost' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'received_quantity' => 'integer',
            'paid_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class, 'voucher_id');
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
