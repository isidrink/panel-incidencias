<?php

namespace Database\Seeders;

use App\Enums\IncidentPriority;
use App\Enums\IncidentStatus;
use App\Models\Incident;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IncidentSeeder extends Seeder
{
    public function run(): void
    {
        $incidents = [
            [
                'title' => 'Avería en climatización de tienda',
                'description' => 'El aire acondicionado no enfría en la zona de ventas.',
                'company' => 'Moda Urbana',
                'address' => 'Passeig de Gràcia 45, Barcelona',
                'category' => 'Climatización',
                'priority' => IncidentPriority::RED,
                'status' => IncidentStatus::OPEN,
                'requester_name' => 'Laura Martínez',
                'requester_email' => 'laura@example.com',
                'requester_phone' => '600000001',
                'assigned_to' => null,
            ],
            [
                'title' => 'Fallo de iluminación en escaparate',
                'description' => 'Varias luminarias LED del escaparate no funcionan.',
                'company' => 'Fashion Retail',
                'address' => 'Carrer de Pelai 18, Barcelona',
                'category' => 'Electricidad',
                'priority' => IncidentPriority::YELLOW,
                'status' => IncidentStatus::REVIEW,
                'requester_name' => 'Carlos Ruiz',
                'requester_email' => 'carlos@example.com',
                'requester_phone' => '600000002',
                'assigned_to' => 'Equipo eléctrico',
            ],
            [
                'title' => 'Fuga de agua en almacén',
                'description' => 'Se detecta una fuga en una tubería del almacén.',
                'company' => 'Sport Center',
                'address' => 'Avinguda Diagonal 520, Barcelona',
                'category' => 'Fontanería',
                'priority' => IncidentPriority::RED,
                'status' => IncidentStatus::BLOCKED,
                'requester_name' => 'Marta López',
                'requester_email' => 'marta@example.com',
                'requester_phone' => '600000003',
                'assigned_to' => 'Equipo de fontanería',
            ],
            [
                'title' => 'Puerta automática bloqueada',
                'description' => 'La puerta de entrada presenta fallos de apertura.',
                'company' => 'Electro Market',
                'address' => 'Gran Via 630, Barcelona',
                'category' => 'Accesos',
                'priority' => IncidentPriority::RED,
                'status' => IncidentStatus::REVIEW,
                'requester_name' => 'Jordi Serra',
                'requester_email' => 'jordi@example.com',
                'requester_phone' => '600000004',
                'assigned_to' => 'Servicio técnico',
            ],
            [
                'title' => 'Revisión de extintores',
                'description' => 'Solicitud de comprobación de los equipos de protección.',
                'company' => 'Home Living',
                'address' => 'Rambla Catalunya 82, Barcelona',
                'category' => 'Seguridad',
                'priority' => IncidentPriority::GREEN,
                'status' => IncidentStatus::RESOLVED,
                'requester_name' => 'Ana Pérez',
                'requester_email' => 'ana@example.com',
                'requester_phone' => '600000005',
                'assigned_to' => 'Equipo de seguridad',
            ],
            [
                'title' => 'Persiana metálica atascada',
                'description' => 'La persiana del acceso de mercancías no sube.',
                'company' => 'Urban Shoes',
                'address' => 'Carrer de Sants 112, Barcelona',
                'category' => 'Cerrajería',
                'priority' => IncidentPriority::YELLOW,
                'status' => IncidentStatus::OPEN,
                'requester_name' => 'David Torres',
                'requester_email' => 'david@example.com',
                'requester_phone' => '600000006',
                'assigned_to' => null,
            ],
            [
                'title' => 'Humedades en techo',
                'description' => 'Aparecen manchas de humedad en la zona de probadores.',
                'company' => 'Moda Urbana',
                'address' => 'Passeig de Gràcia 45, Barcelona',
                'category' => 'Albañilería',
                'priority' => IncidentPriority::YELLOW,
                'status' => IncidentStatus::REVIEW,
                'requester_name' => 'Laura Martínez',
                'requester_email' => 'laura@example.com',
                'requester_phone' => '600000001',
                'assigned_to' => 'Equipo de mantenimiento',
            ],
            [
                'title' => 'Sustitución de cerradura',
                'description' => 'La cerradura de la puerta del almacén está deteriorada.',
                'company' => 'Fashion Retail',
                'address' => 'Carrer de Pelai 18, Barcelona',
                'category' => 'Cerrajería',
                'priority' => IncidentPriority::GREEN,
                'status' => IncidentStatus::RESOLVED,
                'requester_name' => 'Carlos Ruiz',
                'requester_email' => 'carlos@example.com',
                'requester_phone' => '600000002',
                'assigned_to' => 'Equipo de cerrajería',
            ],
            [
                'title' => 'Corte eléctrico parcial',
                'description' => 'Parte del establecimiento se ha quedado sin suministro.',
                'company' => 'Sport Center',
                'address' => 'Avinguda Diagonal 520, Barcelona',
                'category' => 'Electricidad',
                'priority' => IncidentPriority::RED,
                'status' => IncidentStatus::OPEN,
                'requester_name' => 'Marta López',
                'requester_email' => 'marta@example.com',
                'requester_phone' => '600000003',
                'assigned_to' => null,
            ],
            [
                'title' => 'Grifo defectuoso en aseos',
                'description' => 'El grifo del aseo de empleados pierde agua.',
                'company' => 'Home Living',
                'address' => 'Rambla Catalunya 82, Barcelona',
                'category' => 'Fontanería',
                'priority' => IncidentPriority::GREEN,
                'status' => IncidentStatus::REVIEW,
                'requester_name' => 'Ana Pérez',
                'requester_email' => 'ana@example.com',
                'requester_phone' => '600000005',
                'assigned_to' => 'Equipo de fontanería',
            ],
            [
                'title' => 'Fallo en alarma de intrusión',
                'description' => 'La central de alarma comunica un fallo de conexión.',
                'company' => 'Electro Market',
                'address' => 'Gran Via 630, Barcelona',
                'category' => 'Seguridad',
                'priority' => IncidentPriority::RED,
                'status' => IncidentStatus::BLOCKED,
                'requester_name' => 'Jordi Serra',
                'requester_email' => 'jordi@example.com',
                'requester_phone' => '600000004',
                'assigned_to' => 'Empresa de alarmas',
            ],
            [
                'title' => 'Pintura deteriorada en fachada',
                'description' => 'Se solicita reparación y repintado de la fachada.',
                'company' => 'Urban Shoes',
                'address' => 'Carrer de Sants 112, Barcelona',
                'category' => 'Pintura',
                'priority' => IncidentPriority::GREEN,
                'status' => IncidentStatus::OPEN,
                'requester_name' => 'David Torres',
                'requester_email' => 'david@example.com',
                'requester_phone' => '600000006',
                'assigned_to' => null,
            ],
        ];

        DB::transaction(function () use ($incidents) {
            foreach ($incidents as $index => $data) {
                $incident = Incident::create($data);

                $incident->logs()->create([
                    'action' => 'created',
                    'old_value' => null,
                    'new_value' => $incident->status->value,
                    'user_name' => $incident->requester_name,
                    'metadata' => [
                        'source' => 'seeder',
                        'priority' => $incident->priority->value,
                    ],
                ]);

                
                $path = match ($incident->status) {
                    IncidentStatus::OPEN => [],
                    IncidentStatus::REVIEW => [
                        IncidentStatus::REVIEW,
                    ],
                    IncidentStatus::BLOCKED => [
                        IncidentStatus::REVIEW,
                        IncidentStatus::BLOCKED,
                    ],
                    IncidentStatus::RESOLVED => [
                        IncidentStatus::REVIEW,
                        IncidentStatus::RESOLVED,
                    ],
                };

                $previous = IncidentStatus::OPEN;

                foreach ($path as $next) {
                    $incident->logs()->create([
                        'action' => 'status_changed',
                        'old_value' => $previous->value,
                        'new_value' => $next->value,
                        'user_name' => 'Administrador',
                        'metadata' => [
                            'source' => 'seeder',
                            'note' => 'Transición de demostración',
                        ],
                    ]);

                    $previous = $next;
                }


                if ($index % 2 === 0) {
                    $incident->comments()->create([
                        'author_name' => 'Equipo de mantenimiento',
                        'body' => 'Incidencia recibida. Pendiente de seguimiento técnico.',
                    ]);
                }
            }
        });
    }
}
