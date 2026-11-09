<?php

namespace App\Console\Commands;

use App\Models\Incident;
use App\Models\IncidentLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DiagnoseIncidentConsistency extends Command
{
    protected $signature = 'incidents:diagnose {--fix : Corrige únicamente inconsistencias seguras}';

    protected $description = 'Diagnostica inconsistencias entre incidencias y su historial de estados';

    private const STATUS_ACTIONS = [
        'created',
        'status_changed',
        'reopened',
        'resolved',
    ];

    public function handle(): int
    {
        $fix = (bool) $this->option('fix');
        $issues = 0;
        $fixed = 0;
        $manual = 0;

        $this->info($fix
            ? 'Modo REPARACIÓN'
            : 'Modo DRY-RUN (sin modificar datos)'
        );

        Incident::query()
            ->orderBy('id')
            ->chunkById(100, function ($incidents) use (
                $fix, &$issues, &$fixed, &$manual
            ) {
                foreach ($incidents as $incident) {
                    $result = DB::transaction(function () use ($incident, $fix) {
                        $incident = Incident::query()
                            ->whereKey($incident->id)
                            ->lockForUpdate()
                            ->firstOrFail();

                        $logs = IncidentLog::query()
                            ->where('incident_id', $incident->id)
                            ->orderBy('created_at')
                            ->orderBy('id')
                            ->get();

                        $stateLogs = $logs->filter(fn ($log) =>
                            in_array($log->action, self::STATUS_ACTIONS, true)
                        )->values();

                        $findings = [];

                        // 1. Detectar duplicados consecutivos.
                        $previous = null;

                        foreach ($stateLogs as $log) {
                            if (
                                $previous &&
                                $previous->action === $log->action &&
                                $previous->old_value === $log->old_value &&
                                $previous->new_value === $log->new_value &&
                                $previous->user_name === $log->user_name &&
                                $previous->created_at?->equalTo($log->created_at)
                            ) {
                                $findings[] = [
                                    'type' => 'duplicate_log',
                                    'message' => "Log #{$log->id} duplicado del #{$previous->id}",
                                    'safe' => false,
                                ];
                            }

                            $previous = $log;
                        }

                        $last = $stateLogs->last();
                        $current = $incident->status->value;

                        // 2. Estado actual distinto al último log.
                        if ($last && $last->new_value !== $current) {
                            $findings[] = [
                                'type' => 'status_mismatch',
                                'message' => "Estado actual={$current}; último log={$last->new_value}",
                                'safe' => false,
                            ];
                        }

                        // 3. Resuelta sin evidencia de resolución.
                        if ($current === 'resolved') {
                            $hasResolution = $stateLogs->contains(fn ($log) =>
                                $log->new_value === 'resolved' &&
                                in_array($log->action, [
                                    'status_changed', 'resolved',
                                ], true)
                            );

                            if (!$hasResolution) {
                                $findings[] = [
                                    'type' => 'missing_resolution_log',
                                    'message' => 'Incidencia resuelta sin log de resolución',
                                    'safe' => false,
                                ];
                            }
                        }

                        // 4. Logs de transición incoherentes.
                        $previousState = null;

                        foreach ($stateLogs as $log) {
                            if (
                                $previousState !== null &&
                                $log->old_value !== $previousState
                            ) {
                                $findings[] = [
                                    'type' => 'broken_chain',
                                    'message' => "Log #{$log->id}: old_value={$log->old_value}, esperado={$previousState}",
                                    'safe' => false,
                                ];
                            }

                            $previousState = $log->new_value;
                        }

                        // Nunca alterar datos ambiguos sin evidencia.
                        return $findings;
                    });

                    foreach ($result as $finding) {
                        $issues++;

                        $this->warn(
                            "[Incidencia #{$incident->id}] "
                            . "{$finding['type']}: {$finding['message']}"
                        );

                        if (!$finding['safe']) {
                            $manual++;
                            $this->line('  → Requiere revisión manual.');
                        }
                    }
                }
            });

        $this->newLine();

        $this->table(
            ['Indicador', 'Total'],
            [
                ['Inconsistencias detectadas', $issues],
                ['Corregidas automáticamente', $fixed],
                ['Pendientes de revisión', $manual],
            ]
        );

        if (!$fix) {
            $this->comment(
                'No se ha modificado ningún registro. Usa --fix para ejecutar las reparaciones seguras.'
            );
        } else {
            $this->comment(
                'No se han alterado datos ambiguos. Revisa las incidencias señaladas.'
            );
        }

        return self::SUCCESS;
    }
}
