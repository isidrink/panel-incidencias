<?php

namespace App\Enums;

enum IncidentPriority: string
{
    case GREEN = 'green';
    case YELLOW = 'yellow';
    case RED = 'red';

    public function label(): string
    {
        return match ($this) {
            self::GREEN => 'CÓDIGO VERDE - Bajo impacto',
            self::YELLOW => 'CÓDIGO AMARILLO - Medio impacto',
            self::RED => 'CÓDIGO ROJO - Urgencia',
        };
    }
}
