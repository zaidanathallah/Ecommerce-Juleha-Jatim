<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use RuntimeException;

class CentralRegion extends Model
{
    protected $connection = 'members';
    protected $table = 'regions';
    public $timestamps = false;
    protected $guarded = [];

    public function save(array $options = []): bool
    {
        throw new RuntimeException("Database pusat members.julehajatim.com bersifat READ-ONLY.");
    }

    public function delete(): ?bool
    {
        throw new RuntimeException("Database pusat members.julehajatim.com bersifat READ-ONLY.");
    }

    public function members()
    {
        return $this->hasMany(CentralMember::class, 'region', 'initial');
    }
}
