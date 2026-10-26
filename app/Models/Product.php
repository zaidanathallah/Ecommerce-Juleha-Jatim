<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED_EKOP = 'approved_ekop';
    public const STATUS_LIVE = 'live';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'description',
        'image_url',
        'gallery',
        'weight_gram',
        'length_cm',
        'width_cm',
        'height_cm',
        'base_price',
        'ekop_margin',
        'super_margin',
        'final_price',
        'stock',
        'region_code',
        'region_name',
        'status',
        'rejection_reason',
        'reviewed_by_ekop_id',
        'reviewed_by_super_id',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'base_price' => 'decimal:2',
            'ekop_margin' => 'decimal:2',
            'super_margin' => 'decimal:2',
            'final_price' => 'decimal:2',
            'weight_gram' => 'integer',
            'stock' => 'integer',
        ];
    }

    /**
     * Boot model events:
     * - Auto calculate final_price = base_price + ekop_margin + super_margin
     */
    protected static function booted(): void
    {
        static::saving(function (Product $product) {
            $product->final_price = (float) $product->base_price + (float) $product->ekop_margin + (float) $product->super_margin;
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function reviewedByEkop(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_ekop_id');
    }

    public function reviewedBySuper(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_super_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeLive($query)
    {
        return $query->where('status', self::STATUS_LIVE);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeForRegion($query, string $regionCode)
    {
        return $query->whereRaw('LOWER(region_code) = ?', [strtolower(trim($regionCode))]);
    }
}
