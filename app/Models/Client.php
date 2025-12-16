<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'phone',
        'full_name',
        'nickname',
        'address',
        'gender',
        'notes',
    ];

    protected $casts = [
        'gender' => 'string',
    ];

    /**
     * Get all orders for the client
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get all payments for the client
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the client's display name
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->nickname ?: $this->full_name ?: $this->phone;
    }
}
