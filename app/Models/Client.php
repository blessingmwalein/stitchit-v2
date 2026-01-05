<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Client extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable, HasApiTokens;

    protected $fillable = [
        'phone',
        'email',
        'username',
        'password',
        'full_name',
        'nickname',
        'address',
        'gender',
        'notes',
        'last_login_at',
        'google_id',
        'auth_provider',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'api_token',
    ];

    protected $casts = [
        'gender' => 'string',
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
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
     * Get finished products for the client
     */
    public function finishedProducts(): HasMany
    {
        return $this->hasMany(FinishedProduct::class);
    }

    /**
     * Get the client's display name
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->nickname ?: $this->full_name ?: $this->phone;
    }
}
