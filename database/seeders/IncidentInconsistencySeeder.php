<?php

namespace Database\Seeders;

use App\Models\Incident;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IncidentInconsistencySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            $base = [
                'description' => 'Incidencia creada para probar el diagnóstico de consistencia.',
                'company' => 'Optima Retail - QA',
                'address' => 'Centro de pruebas',
                'category' => 'Mantenimiento',
                'priority' => 'yellow',
                'requester_name' => 'Equipo QA',
                'requester_email' => 'qa@example.com',
                'requester_phone' => '600000000',
                'assigned_to' => 'Equipo técnico',
            ];

            // CASO 1: Resuelta sin log de resolución.
            $one = Incident::create(array_merge($base, [
                'title' => '[QA] Resuelta sin log',
                'status' => 'resolved',
            ]));

            $one->logs()->create([
                'action' => 'created',
                'old_value' => null,
                'new_value' => 'open',
                'user_name' => 'QA',
            ]);

            // CASO 2: Estado distinto al último log.
            $two = Incident::create(array_merge($base, [
                'title' => '[QA] Estado distinto al historial',
                'status' => 'blocked',
            ]));

            $two->logs()->create([
                'action' => 'created',
                'old_value' => null,
                'new_value' => 'open',
                'user_name' => 'QA',
            ]);

            $two->logs()->create([
                'action' => 'status_changed',
                'old_value' => 'open',
                'new_value' => 'review',
                'user_name' => 'QA',
            ]);

            // CASO 3: Log duplicado.
            $three = Incident::create(array_merge($base, [
                'title' => '[QA] Log duplicado',
                'status' => 'review',
            ]));

            $three->logs()->create([
                'action' => 'created',
                'old_value' => null,
                'new_value' => 'open',
                'user_name' => 'QA',
            ]);

            $duplicate = [
                'action' => 'status_changed',
                'old_value' => 'open',
                'new_value' => 'review',
                'user_name' => 'QA',
                'created_at' => now(),
            ];

            $three->logs()->create($duplicate);
            $three->logs()->create($duplicate);
        });
    }
}
