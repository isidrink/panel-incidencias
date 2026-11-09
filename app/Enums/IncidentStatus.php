<?php

namespace App\Enums;

enum IncidentStatus: string
{
    case OPEN = 'open';
    case REVIEW = 'review';
    case BLOCKED = 'blocked';
    case RESOLVED = 'resolved';

    public function label(): string
    {
        return match ($this) {
            self::OPEN => 'Abierta',
            self::REVIEW => 'En revisión',
            self::BLOCKED => 'Bloqueada',
            self::RESOLVED => 'Resuelta',
        };
    }

    public function allowedTransitions(): array
    {
        return match ($this) {
            self::OPEN => [
                self::REVIEW,
            ],
            self::REVIEW => [
                self::BLOCKED,
                self::RESOLVED,
            ],
            self::BLOCKED => [
                self::REVIEW,
                self::RESOLVED,
            ],
            self::RESOLVED => [
                self::REVIEW,
            ],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array(
            $next,
            $this->allowedTransitions(),
            true
        );
    }
}
