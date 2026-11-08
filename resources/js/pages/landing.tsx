
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    ClipboardList,
    Clock3,
    History,
    Plus,
    Search,
    ShieldAlert,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Status = 'open' | 'review' | 'blocked' | 'resolved';
type Priority = 'low' | 'medium' | 'high' | 'critical';

type IncidentLog = {
    id: number;
    action: string;
    oldValue: string | null;
    newValue: string;
    userName: string;
    createdAt: string;
};

type Incident = {
    id: number;
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    requesterName: string;
    assignedTo: string;
    createdAt: string;
    logs: IncidentLog[];
};

type FormValues = {
    title: string;
    description: string;
    priority: Priority;
    requesterName: string;
    assignedTo: string;
};

const statusLabels: Record<Status, string> = {
    open: 'Abierta',
    review: 'En revisión',
    blocked: 'Bloqueada',
    resolved: 'Resuelta',
};

const priorityLabels: Record<Priority, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica',
};

const statusStyles: Record<Status, string> = {
    open: 'bg-blue-50 text-blue-700 ring-blue-200',
    review: 'bg-amber-50 text-amber-700 ring-amber-200',
    blocked: 'bg-red-50 text-red-700 ring-red-200',
    resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const priorityStyles: Record<Priority, string> = {
    low: 'text-slate-600',
    medium: 'text-amber-700',
    high: 'text-orange-700',
    critical: 'font-bold text-red-700',
};

// Transiciones permitidas en la demostración.
// La misma política se validará posteriormente en Laravel.
const allowedTransitions: Record<Status, Status[]> = {
    open: ['review'],
    review: ['blocked', 'resolved'],
    blocked: ['review', 'resolved'],
    resolved: ['review'],
};

const initialIncidents: Incident[] = [
    {
        id: 1001,
        title: 'Error de sincronización en TPV',
        description: 'El terminal no sincroniza las ventas.',
        status: 'review',
        priority: 'critical',
        requesterName: 'María López',
        assignedTo: 'Equipo IT',
        createdAt: '2026-11-06T09:15:00',
        logs: [],
    },
    {
        id: 1002,
        title: 'Diferencia de stock en almacén',
        description: 'El inventario muestra cantidades incorrectas.',
        status: 'open',
        priority: 'high',
        requesterName: 'Carlos Ruiz',
        assignedTo: 'Sin asignar',
        createdAt: '2026-11-07T11:30:00',
        logs: [],
    },
    {
        id: 1003,
        title: 'Acceso bloqueado al sistema',
        description: 'Un empleado no puede acceder al panel.',
        status: 'blocked',
        priority: 'high',
        requesterName: 'Laura García',
        assignedTo: 'Soporte',
        createdAt: '2026-11-05T16:45:00',
        logs: [],
    },
    {
        id: 1004,
        title: 'Actualización de precios',
        description: 'Se ha corregido la actualización del catálogo.',
        status: 'resolved',
        priority: 'low',
        requesterName: 'Javier Martín',
        assignedTo: 'Equipo IT',
        createdAt: '2026-11-04T10:00:00',
        logs: [],
    },
];

const emptyForm: FormValues = {
    title: '',
    description: '',
    priority: 'medium',
    requesterName: '',
    assignedTo: '',
};

function StatusBadge({ status }: { status: Status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}
        >
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />
            {statusLabels[status]}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: Priority }) {
    return (
        <span className={`text-sm ${priorityStyles[priority]}`}>
            {priorityLabels[priority]}
        </span>
    );
}

function Modal({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="rounded-lg p-2 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </section>
        </div>
    );
}

function IncidentForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (values: FormValues) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState<FormValues>(emptyForm);

    function update<K extends keyof FormValues>(
        field: K,
        value: FormValues[K],
    ) {
        setForm((previous) => ({ ...previous, [field]: value }));
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!form.title.trim() || !form.requesterName.trim()) return;
        onSubmit(form);
    }

    const inputClass =
        'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label htmlFor="incident-title" className="text-sm font-medium">
                    Título *
                </label>
                <input
                    id="incident-title"
                    required
                    maxLength={150}
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    className={inputClass}
                    placeholder="Describe brevemente la incidencia"
                />
            </div>

            <div>
                <label htmlFor="incident-description" className="text-sm font-medium">
                    Descripción
                </label>
                <textarea
                    id="incident-description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    className={inputClass}
                    placeholder="Explica qué ha ocurrido..."
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="incident-priority" className="text-sm font-medium">
                        Prioridad
                    </label>
                    <select
                        id="incident-priority"
                        value={form.priority}
                        onChange={(e) =>
                            update('priority', e.target.value as Priority)
                        }
                        className={inputClass}
                    >
                        {Object.entries(priorityLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="incident-requester" className="text-sm font-medium">
                        Solicitante *
                    </label>
                    <input
                        id="incident-requester"
                        required
                        value={form.requesterName}
                        onChange={(e) => update('requesterName', e.target.value)}
                        className={inputClass}
                        placeholder="Nombre del solicitante"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="incident-assignee" className="text-sm font-medium">
                    Responsable
                </label>
                <input
                    id="incident-assignee"
                    value={form.assignedTo}
                    onChange={(e) => update('assignedTo', e.target.value)}
                    className={inputClass}
                    placeholder="Opcional"
                />
            </div>

            <div className="flex justify-end gap-3 border-t pt-5">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border px-5 py-2.5 text-sm font-medium"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    Crear incidencia
                </button>
            </div>
        </form>
    );
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}

export default function Landing() {
    const [incidents, setIncidents] = useState(initialIncidents);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [createOpen, setCreateOpen] = useState(false);
    const [historyId, setHistoryId] = useState<number | null>(null);

    const selectedIncident = incidents.find((i) => i.id === historyId);

    const counts = useMemo(
        () => ({
            total: incidents.length,
            open: incidents.filter((i) => i.status === 'open').length,
            review: incidents.filter((i) => i.status === 'review').length,
            blocked: incidents.filter((i) => i.status === 'blocked').length,
            resolved: incidents.filter((i) => i.status === 'resolved').length,
        }),
        [incidents],
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return incidents.filter((incident) => {
            const matchesText = [
                incident.title,
                incident.description,
                incident.requesterName,
                incident.assignedTo,
            ].some((value) => value.toLowerCase().includes(query));

            return (
                matchesText &&
                (statusFilter === 'all' || incident.status === statusFilter) &&
                (priorityFilter === 'all' || incident.priority === priorityFilter)
            );
        });
    }, [incidents, search, statusFilter, priorityFilter]);

    function createIncident(values: FormValues) {
        const id = Math.max(1000, ...incidents.map((i) => i.id)) + 1;
        const now = new Date().toISOString();

        const incident: Incident = {
            id,
            title: values.title.trim(),
            description: values.description.trim(),
            priority: values.priority,
            requesterName: values.requesterName.trim(),
            assignedTo: values.assignedTo.trim() || 'Sin asignar',
            status: 'open',
            createdAt: now,
            logs: [
                {
                    id: Date.now(),
                    action: 'created',
                    oldValue: null,
                    newValue: 'open',
                    userName: 'Operador demo',
                    createdAt: now,
                },
            ],
        };

        setIncidents((previous) => [incident, ...previous]);
        setCreateOpen(false);
    }

    function changeStatus(id: number, nextStatus: Status) {
        const incident = incidents.find((item) => item.id === id);
        if (!incident) return;

        if (!allowedTransitions[incident.status].includes(nextStatus)) {
            return;
        }

        if (
            ['blocked', 'resolved'].includes(nextStatus) &&
            !window.confirm(
                `¿Confirmas cambiar la incidencia #${id} a "${statusLabels[nextStatus]}"?`,
            )
        ) {
            return;
        }

        const now = new Date().toISOString();

        setIncidents((previous) =>
            previous.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          status: nextStatus,
                          logs: [
                              ...item.logs,
                              {
                                  id: Date.now(),
                                  action:
                                      item.status === 'resolved'
                                          ? 'reopened'
                                          : 'status_changed',
                                  oldValue: item.status,
                                  newValue: nextStatus,
                                  userName: 'Operador demo',
                                  createdAt: now,
                              },
                          ],
                      }
                    : item,
            ),
        );
    }

    const stats = [
        { label: 'Total', value: counts.total, icon: ClipboardList, color: 'text-slate-700' },
        { label: 'Abiertas', value: counts.open, icon: AlertCircle, color: 'text-blue-600' },
        { label: 'En revisión', value: counts.review, icon: Clock3, color: 'text-amber-600' },
        { label: 'Bloqueadas', value: counts.blocked, icon: ShieldAlert, color: 'text-red-600' },
        { label: 'Resueltas', value: counts.resolved, icon: CheckCircle2, color: 'text-emerald-600' },
    ];

    return (
        <>
            <Head title="Panel operativo de incidencias" />

            <div className="min-h-screen bg-slate-50 text-slate-900">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-5 sm:px-8">
                        <div className="rounded-xl bg-blue-600 p-3 text-white">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Panel operativo de incidencias
                            </h1>
                            <p className="text-sm text-slate-500">
                                Gestión, seguimiento y trazabilidad operativa
                            </p>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl space-y-7 px-5 py-8 sm:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">
                                Gestión de incidencias
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Consulta, registra y actualiza las incidencias.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            <Plus size={18} />
                            Nueva incidencia
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        {stat.label}
                                    </span>
                                    <stat.icon size={20} className={stat.color} />
                                </div>
                                <div className="mt-3 text-3xl font-bold">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <h3 className="text-lg font-bold">
                                Listado de incidencias
                            </h3>
                            <p className="text-sm text-slate-500">
                                {filtered.length} resultados
                            </p>

                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-3 text-slate-400"
                                    />
                                    <input
                                        aria-label="Buscar incidencias"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar incidencias..."
                                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm"
                                    />
                                </div>

                                <select
                                    aria-label="Filtrar por estado"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                                >
                                    <option value="all">Todos los estados</option>
                                    {Object.entries(statusLabels).map(([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    aria-label="Filtrar por prioridad"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                                >
                                    <option value="all">Todas las prioridades</option>
                                    {Object.entries(priorityLabels).map(([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        {[
                                            'Incidencia',
                                            'Prioridad',
                                            'Estado',
                                            'Solicitante / Responsable',
                                            'Fecha',
                                            'Acciones',
                                        ].map((heading) => (
                                            <th key={heading} className="px-5 py-4 font-semibold">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((incident) => (
                                        <tr key={incident.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <div className="font-semibold">
                                                    {incident.title}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-400">
                                                    #{incident.id}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <PriorityBadge priority={incident.priority} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={incident.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div>{incident.requesterName}</div>
                                                <div className="text-xs text-slate-500">
                                                    {incident.assignedTo}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {formatDate(incident.createdAt)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <select
                                                        aria-label={`Cambiar estado de incidencia ${incident.id}`}
                                                        value={incident.status}
                                                        onChange={(e) =>
                                                            changeStatus(
                                                                incident.id,
                                                                e.target.value as Status,
                                                            )
                                                        }
                                                        className="max-w-36 rounded-lg border border-slate-300 px-2 py-2 text-xs"
                                                    >
                                                        <option value={incident.status}>
                                                            {statusLabels[incident.status]}
                                                        </option>
                                                        {allowedTransitions[incident.status].map(
                                                            (status) => (
                                                                <option key={status} value={status}>
                                                                    {statusLabels[status]}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setHistoryId(incident.id)}
                                                        title="Ver historial"
                                                        aria-label={`Ver historial de incidencia ${incident.id}`}
                                                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <History size={19} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filtered.length === 0 && (
                                <div className="p-12 text-center text-slate-500">
                                    No se han encontrado incidencias.
                                </div>
                            )}
                        </div>
                    </section>

                    <p className="text-center text-xs text-slate-400">
                        Panel de incidencias · Demostración frontend sin persistencia
                    </p>
                </main>
            </div>

            {createOpen && (
                <Modal
                    title="Crear nueva incidencia"
                    onClose={() => setCreateOpen(false)}
                >
                    <IncidentForm
                        onSubmit={createIncident}
                        onCancel={() => setCreateOpen(false)}
                    />
                </Modal>
            )}

            {selectedIncident && (
                <Modal
                    title={`Historial · Incidencia #${selectedIncident.id}`}
                    onClose={() => setHistoryId(null)}
                >
                    <h3 className="mb-5 font-semibold">
                        {selectedIncident.title}
                    </h3>

                    {selectedIncident.logs.length === 0 ? (
                        <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">
                            No hay registros de historial disponibles en los datos de demostración.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {[...selectedIncident.logs].reverse().map((log) => (
                                <div key={log.id} className="border-l-2 border-blue-300 pl-4">
                                    <p className="font-medium">
                                        {log.action === 'created'
                                            ? 'Incidencia creada'
                                            : log.action === 'reopened'
                                              ? 'Incidencia reabierta'
                                              : 'Cambio de estado'}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {log.oldValue
                                            ? `${statusLabels[log.oldValue as Status]} → `
                                            : ''}
                                        {statusLabels[log.newValue as Status]}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {log.userName} ·{' '}
                                        {new Date(log.createdAt).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setHistoryId(null)}
                        className="mt-6 rounded-lg border px-5 py-2 text-sm"
                    >
                        Cerrar
                    </button>
                </Modal>
            )}
        </>
    );
}
