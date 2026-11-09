<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIncidentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

use App\Models\Incident;
use App\Enums\IncidentStatus;
use App\Enums\IncidentPriority;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class IncidentController extends Controller
{
    
    public function index(Request $request): \Inertia\Response
    {
        $query = Incident::query()
            ->with(['logs', 'comments']);

        // Filtro por estado
        if ($request->filled('status')) {
            $status = IncidentStatus::tryFrom($request->status);

            if ($status) {
                $query->where('status', $status->value);
            }
        }

        // Filtro por prioridad
        if ($request->filled('priority')) {
            $priority = IncidentPriority::tryFrom($request->priority);

            if ($priority) {
                $query->where('priority', $priority->value);
            }
        }

        // Búsqueda por texto
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                ->orWhere('company', 'like', "%{$search}%")
                ->orWhere('requester_name', 'like', "%{$search}%");
            });
        }

        $incidents = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Incident $incident) => [
                'id' => $incident->id,
                'title' => $incident->title,
                'description' => $incident->description,
                'company' => $incident->company,
                'address' => $incident->address,
                'category' => $incident->category,
                'status' => $incident->status->value,
                'priority' => $incident->priority->value,
                'requesterName' => $incident->requester_name,
                'requesterEmail' => $incident->requester_email,
                'requesterPhone' => $incident->requester_phone,
                'assignedTo' => $incident->assigned_to,
                'createdAt' => $incident->created_at->toISOString(),

                // Historial de cambios de estado
                'logs' => $incident->logs
                    ->sortBy('created_at')
                    ->map(fn ($log) => [
                        'id' => $log->id,
                        'action' => $log->action,
                        'from' => $log->old_value,
                        'to' => $log->new_value,
                        'actor' => $log->user_name,
                        'date' => $log->created_at?->format('Y-m-d\TH:i:s'),
                    ])
                    ->values()
                    ->all(),

                // Comentarios de la incidencia
                'comments' => $incident->comments
                    ->sortBy('created_at')
                    ->map(fn ($comment) => [
                        'id' => $comment->id,
                        'authorName' => $comment->author_name,
                        'body' => $comment->body,
                        'createdAt' => $comment->created_at?->toISOString(),
                    ])
                    ->values()
                    ->all(),
            ]);

        return Inertia::render('landing', [
            'incidents' => $incidents,
            'filters' => [
                'status' => $request->input('status'),
                'priority' => $request->input('priority'),
                'search' => $request->input('search'),
            ],
        ]);
    }


    
    public function store(StoreIncidentRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {

            $data = $request->validated();

            // El estado inicial siempre lo establece el backend.
            $data['status'] = IncidentStatus::OPEN->value;

            $incident = Incident::create($data);

            // Registramos la creación de la incidencia.
            $incident->logs()->create([
                'action' => 'created',
                'old_value' => null,
                'new_value' => IncidentStatus::OPEN->value,
                'user_name' => $incident->requester_name,
                'metadata' => [
                    'priority' => $incident->priority->value,
                    'source' => 'web_form',
                ],
            ]);
        });

        return redirect()
            ->route('incidents.index')
            ->with('success', 'Incidencia creada correctamente.');
    }


        
        
    public function updateStatus(
        Request $request,
        Incident $incident
    ): RedirectResponse {

        $data = $request->validate([
            'status' => [
                'required',
                Rule::enum(IncidentStatus::class),
            ],
            'actor' => ['required', 'string', 'max:150'],
        ]);

        DB::transaction(function () use ($incident, $data) {

            $incident = Incident::whereKey($incident->id)
                ->lockForUpdate()
                ->firstOrFail();

            $oldStatus = $incident->status;
            $newStatus = IncidentStatus::from($data['status']);

            if (!$oldStatus->canTransitionTo($newStatus)) {
                throw ValidationException::withMessages([
                    'status' => 'Transición de estado no permitida.',
                ]);
            }

            $incident->update([
                'status' => $newStatus->value,
            ]);

            $incident->logs()->create([
                'action' => $oldStatus === IncidentStatus::RESOLVED
                    ? 'reopened'
                    : 'status_changed',
                'old_value' => $oldStatus->value,
                'new_value' => $newStatus->value,
                'user_name' => $data['actor'],
                'metadata' => [
                    'source' => 'dashboard',
                ],
            ]);
        });

        return redirect()
            ->route('incidents.index')
            ->with('success', 'Estado actualizado correctamente.');
    }



}
