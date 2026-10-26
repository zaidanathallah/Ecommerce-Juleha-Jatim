<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Voucher extends Model
{
    use HasFactory;

    public const TYPE_FREE_SHIPPING = 'free_shipping';
    public const TYPE_DISCOUNT_PERCENT = 'discount_percent';
    public const TYPE_DISCOUNT_FIXED = 'discount_fixed';

    public const SCOPE_GLOBAL = 'global';
    public const SCOPE_REGIONAL = 'regional';
    public const SCOPE_SELLER = 'seller';

    protected $fillable = [
        'code',
        'title',
        'description',
        'type',
        'discount_amount',
        'min_spend',
        'max_discount',
        'scope',
        'created_by',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'min_spend' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>=', now());
            });
    }

    /**
     * Calculate discount for a given total and shipping cost
     */
    public function calculateDiscount(float $subtotal, float $shippingFee = 0): float
    {
        if ($subtotal < (float) $this->min_spend) {
            return 0;
        }

        if ($this->type === self::TYPE_FREE_SHIPPING) {
            $deduction = (float) $this->discount_amount;
            return min($deduction > 0 ? $deduction : $shippingFee, $shippingFee);
        }

        if ($this->type === self::TYPE_DISCOUNT_PERCENT) {
            $discount = ($subtotal * (float) $this->discount_amount) / 100;
            if ($this->max_discount && $discount > (float) $this->max_discount) {
                return (float) $this->max_discount;
            }
            return $discount;
        }

        if ($this->type === self::TYPE_DISCOUNT_FIXED) {
            return min((float) $this->discount_amount, $subtotal);
        }

        return 0;
    }
}
