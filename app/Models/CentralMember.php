<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use RuntimeException;

/**
 * Model read-only untuk koneksi ke database pusat Juleha (julehaaja_members.members)
 * Terletak di server Jagoan Hosting yang sama.
 */
class CentralMember extends Model
{
    protected $connection = 'members';
    protected $table = 'members';
    public $timestamps = false;
    protected $guarded = [];

    // Strictly Read-Only guard to prevent accidental modification of central database
    public function save(array $options = []): bool
    {
        throw new RuntimeException("Database pusat members.julehajatim.com bersifat READ-ONLY.");
    }

    public function delete(): ?bool
    {
        throw new RuntimeException("Database pusat members.julehajatim.com bersifat READ-ONLY.");
    }

    public function update(array $attributes = [], array $options = []): bool
    {
        throw new RuntimeException("Database pusat members.julehajatim.com bersifat READ-ONLY.");
    }

    public function regionRelation()
    {
        return $this->belongsTo(CentralRegion::class, 'region', 'initial');
    }

    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->title,
            $this->firstname,
            $this->middlename,
            $this->lastname,
        ]);

        return trim(implode(' ', $parts));
    }

    public function getIsActiveAttribute(): bool
    {
        return (string) $this->mstatus === '1';
    }

    public function scopeActive($query)
    {
        return $query->where('mstatus', '1');
    }

    public function scopeByJulehaId($query, string $julehaId)
    {
        return $query->where('juleha_id', trim($julehaId));
    }
}
