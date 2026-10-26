<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const ROLE_USER = 'user';
    public const ROLE_ADMIN_EKOP = 'admin_ekop';
    public const ROLE_SUPER_ADMIN = 'super_admin';

    protected $fillable = [
        'juleha_id',
        'name',
        'email',
        'phone',
        'password',
        'role',
        'region_code',
        'region_name',
        'address',
        'lat',
        'lng',
        'ktp_url',
        'is_verified',
        'avatar_url',
        'is_pg_active',
        'is_shipping_api_active',
        'seller_bank_details',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'is_pg_active' => 'boolean',
            'is_shipping_api_active' => 'boolean',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isAdminEkop(): bool
    {
        return $this->role === self::ROLE_ADMIN_EKOP;
    }

    public function isAnggota(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    public function canManageRegion(?string $regionCode): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isAdminEkop() && !empty($this->region_code)) {
            return strtolower((string) $this->region_code) === strtolower((string) $regionCode);
        }

        return false;
    }

    public function centralMember()
    {
        return $this->hasOne(CentralMember::class, 'juleha_id', 'juleha_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'user_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Order::class, 'seller_id');
    }
}
