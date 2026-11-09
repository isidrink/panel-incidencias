<?php

namespace App\Models;

use App\Enums\IncidentStatus;
use App\Enums\IncidentPriority;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Incident extends Model
{
    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'company',
        'address',
        'category',
        'requester_name',
        'requester_email',
        'requester_phone',
        'assigned_to',
    ];

    protected function casts(): array
    {
        return [
            'status' => IncidentStatus::class,
            'priority' => IncidentPriority::class,
        ];
    }

    public function logs(): HasMany
    {
        return $this->hasMany(IncidentLog::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(IncidentComment::class);
    }
}
