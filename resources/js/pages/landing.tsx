
import { Head,  router, usePage } from '@inertiajs/react';
import {
    Activity, AlertTriangle, Building2, CheckCircle2,
    ClipboardList, Clock3, History, MapPin, Plus,
    Search, ShieldAlert, X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

type Status = 'open' | 'review' | 'blocked' | 'resolved';
type Priority = 'green' | 'yellow' | 'red';

type Incident = {
    id: number;
    title: string;
    description: string;
    company: string;
    address: string;
    category: string;
    status: Status;
    priority: Priority;
    requesterName: string;
    requesterEmail: string;
    requesterPhone: string;
    assignedTo: string | null;
    createdAt: string;
    logs?: IncidentLog[];
    comments?: IncidentComment[];
};

type IncidentLog = {
    id: number;
    action: string;
    from: Status | null;
    to: Status;
    actor: string;
    date: string;
};

type IncidentComment = {
    id: number;
    authorName: string;
    body: string;
    createdAt: string;
};

type IncidentFormData = Omit<
    Incident,
    'id' | 'status' | 'createdAt' | 'logs'
>;

const statusLabels: Record<Status, string> = {
    open: 'Abierta',
    review: 'En revisión',
    blocked: 'Bloqueada',
    resolved: 'Resuelta',
};

const priorityLabels: Record<Priority, string> = {
    green: '🟢 Bajo impacto',
    yellow: '🟡 Medio impacto',
    red: '🔴 Urgencia',
};

const statusColors: Record<Status, string> = {
    open: 'bg-blue-50 text-blue-700 ring-blue-200',
    review: 'bg-amber-50 text-amber-700 ring-amber-200',
    blocked: 'bg-red-50 text-red-700 ring-red-200',
    resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const priorityColors: Record<Priority, string> = {
    green: 'bg-green-100 text-green-800 ring-1 ring-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
    red: 'bg-red-100 text-red-800 ring-1 ring-red-200',
};

const transitions: Record<Status, Status[]> = {
    open: ['review'],
    review: ['blocked', 'resolved'],
    blocked: ['review', 'resolved'],
    resolved: ['review'],
};

const categories = [
    'Climatización',
    'Electricidad e iluminación',
    'Fontanería',
    'Cerrajería y accesos',
    'Puertas automáticas',
    'Protección contra incendios',
    'Limpieza',
    'Control de plagas',
    'Mantenimiento general',
    'Otros',
];

const initialIncidents: Incident[] = [
    {
        id: 1001,
        title: 'Aire acondicionado fuera de servicio',
        description: 'El equipo no enfría la zona comercial.',
        company: 'Marca Demo A',
        address: 'Barcelona, España',
        category: 'Climatización',
        priority: 'yellow',
        status: 'review',
        requesterName: 'Laura García',
        requesterEmail: 'laura@example.com',
        requesterPhone: '600000001',
        assignedTo: 'Equipo HVAC',
        createdAt: '2026-11-08T09:20:00',
        logs: [],
    },
    {
        id: 1002,
        title: 'Fallo en iluminación del escaparate',
        description: 'Varios circuitos no funcionan.',
        company: 'Marca Demo B',
        address: 'Madrid, España',
        category: 'Electricidad e iluminación',
        priority: 'red',
        status: 'open',
        requesterName: 'Carlos Ruiz',
        requesterEmail: 'carlos@example.com',
        requesterPhone: '600000002',
        assignedTo: 'Sin asignar',
        createdAt: '2026-11-07T12:00:00',
        logs: [],
    },
    {
        id: 1003,
        title: 'Persiana de acceso bloqueada',
        description: 'La persiana no puede abrirse.',
        company: 'Marca Demo C',
        address: 'Valencia, España',
        category: 'Cerrajería y accesos',
        priority: 'red',
        status: 'blocked',
        requesterName: 'Ana López',
        requesterEmail: 'ana@example.com',
        requesterPhone: '600000003',
        assignedTo: 'Servicio técnico',
        createdAt: '2026-11-06T08:10:00',
        logs: [],
    },
    {
        id: 1004,
        title: 'Reparación de fuga de agua',
        description: 'Intervención finalizada correctamente.',
        company: 'Marca Demo D',
        address: 'Sevilla, España',
        category: 'Fontanería',
        priority: 'green',
        status: 'resolved',
        requesterName: 'Javier Martín',
        requesterEmail: 'javier@example.com',
        requesterPhone: '600000004',
        assignedTo: 'Equipo fontanería',
        createdAt: '2026-11-05T10:30:00',
        logs: [],
    },
];

const emptyForm: IncidentFormData = {
    title: '',
    description: '',
    company: '',
    address: '',
    category: 'Climatización',
    priority: 'green',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    assignedTo: '',
};

function Badge({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
        >
            {children}
        </span>
    );
}

function StatusBadge({ status }: { status: Status }) {
    return (
        <Badge className={`${statusColors[status]} ring-1`}>
            {statusLabels[status]}
        </Badge>
    );
}


function Modal({
    title,
    children,
    onClose,
}: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl dark:bg-white dark:text-slate-900"
            >
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Completa los datos del establecimiento y la incidencia.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar formulario"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-white p-6 text-slate-900">
                    {children}
                </div>
            </section>
        </div>
    );
}


function NewIncidentForm({
    onSave,
    onCancel,
}: {
    onSave: (data: IncidentFormData) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState<IncidentFormData>(emptyForm);

    const input =
    'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400';

    function update<K extends keyof IncidentFormData>(
        key: K,
        value: IncidentFormData[K],
    ) {
        setForm((previous) => ({ ...previous, [key]: value }));
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSave(form);
    }

    return (
        <form onSubmit={submit} className="space-y-5">
            <p className="text-sm text-slate-500">
                Registra una solicitud de mantenimiento para un establecimiento.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="company">
                        Empresa / Marca *
                    </label>
                    <input
                        id="company"
                        required
                        value={form.company}
                        onChange={(e) => update('company', e.target.value)}
                        className={input}
                        placeholder="Nombre de la marca"
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="address">
                        Dirección del establecimiento *
                    </label>
                    <input
                        id="address"
                        required
                        value={form.address}
                        onChange={(e) => update('address', e.target.value)}
                        className={input}
                        placeholder="Dirección completa"
                    />
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="title">
                    Incidencia *
                </label>
                <input
                    id="title"
                    required
                    maxLength={150}
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    className={input}
                    placeholder="Ej. Aire acondicionado averiado"
                />
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="description">
                    Descripción del problema *
                </label>
                <textarea
                    id="description"
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    className={input}
                    placeholder="Describe qué ocurre y cómo afecta a la tienda"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="category">
                        Tipo de mantenimiento
                    </label>
                    <select
                        id="category"
                        value={form.category}
                        onChange={(e) => update('category', e.target.value)}
                        className={input}
                    >
                        {categories.map((category) => (
                            <option key={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="priority">
                        Prioridad *
                    </label>
                    <select
                        id="priority"
                        value={form.priority}
                        onChange={(e) =>
                            update('priority', e.target.value as Priority)
                        }
                        className={input}
                    >
                        {Object.entries(priorityLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="border-t pt-5">
                <h3 className="mb-4 font-bold text-slate-900">
                    Datos del solicitante
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="requester">
                            Nombre completo *
                        </label>
                        <input
                            id="requester"
                            required
                            value={form.requesterName}
                            onChange={(e) => update('requesterName', e.target.value)}
                            className={input}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                            Correo electrónico *
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={form.requesterEmail}
                            onChange={(e) => update('requesterEmail', e.target.value)}
                            className={input}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="phone">
                            Teléfono *
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            required
                            value={form.requesterPhone}
                            onChange={(e) => update('requesterPhone', e.target.value)}
                            className={input}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="assignee">
                    Responsable asignado
                </label>
                <input
                    id="assignee"
                    value={form.assignedTo}
                    onChange={(e) => update('assignedTo', e.target.value)}
                    className={input}
                    placeholder="Opcional · Asignación interna"
                />
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border px-5 py-2.5 text-sm font-medium"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                >
                    Registrar incidencia
                </button>
            </div>
        </form>
    );
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}


function NewCommentForm({
    incidentId,
}: {
    incidentId: number;
}) {
    const [authorName, setAuthorName] = useState('');
    const [body, setBody] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.post(
            `/incidents/${incidentId}/comments`,
            {
                author_name: authorName,
                body,
            },
            {
                preserveScroll: true,
                preserveState: true,

                onStart: () => setSaving(true),

                onSuccess: () => {
                    setBody('');
                    setErrors({});
                },

                onError: (validationErrors) => {
                    setErrors(validationErrors);
                },

                onFinish: () => setSaving(false),
            }
        );
    }

    return (
        <form
            onSubmit={submit}
            className="mt-6 space-y-4 border-t border-slate-200 pt-5"
        >
            <h3 className="font-bold text-slate-900">
                Añadir comentario
            </h3>

            <div>
                <label className="text-sm font-medium text-slate-700">
                    Nombre del autor
                </label>
                <input
                    required
                    maxLength={150}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
                {errors.author_name && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.author_name}
                    </p>
                )}
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">
                    Comentario
                </label>
                <textarea
                    required
                    maxLength={5000}
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Escribe una actualización..."
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
                {errors.body && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.body}
                    </p>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                    {saving ? 'Guardando...' : 'Publicar comentario'}
                </button>
            </div>
        </form>
    );
}


export default function Landing() {
    const { incidents: dbIncidents } = usePage<{
        incidents: Incident[];
    }>().props;

    const [incidents, setIncidents] = useState<Incident[]>(
        dbIncidents ?? []
    );


    // AQUÍ DEBES AÑADIR EL useEffect
    useEffect(() => {
        setIncidents(dbIncidents ?? []);
    }, [dbIncidents]);

    
    const [showForm, setShowForm] = useState(false);
    const [historyId, setHistoryId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    const selectedIncident = incidents.find((i) => i.id === historyId);

    
    const historyEvents = selectedIncident
    ? [
        ...(selectedIncident.logs ?? []).map((log) => ({
            key: `log-${log.id}`,
            type: 'log' as const,
            date: log.date,
            log,
        })),

        ...(selectedIncident.comments ?? []).map((comment) => ({
            key: `comment-${comment.id}`,
            type: 'comment' as const,
            date: comment.createdAt,
            comment,
        })),
    ].sort(
        (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
    )
    : [];

    const counts = useMemo(() => ({
        total: incidents.length,
        open: incidents.filter((i) => i.status === 'open').length,
        review: incidents.filter((i) => i.status === 'review').length,
        blocked: incidents.filter((i) => i.status === 'blocked').length,
        resolved: incidents.filter((i) => i.status === 'resolved').length,
    }), [incidents]);

    const filtered = useMemo(() => incidents.filter((incident) => {
        const text = search.trim().toLowerCase();
        const searchable = [
            incident.title,
            incident.company,
            incident.address,
            incident.category,
            incident.requesterName,
            incident.assignedTo,
        ].join(' ').toLowerCase();

        return searchable.includes(text)
            && (statusFilter === 'all' || incident.status === statusFilter)
            && (priorityFilter === 'all' || incident.priority === priorityFilter);
    }), [incidents, search, statusFilter, priorityFilter]);

        
        
    function createIncident(data: IncidentFormData) {
        
        console.log('Enviando incidencia a Laravel:', data);

        router.post(
            '/incidents',
            {
                title: data.title,
                description: data.description,
                company: data.company,
                address: data.address,
                category: data.category,
                priority: data.priority,
                requester_name: data.requesterName,
                requester_email: data.requesterEmail,
                requester_phone: data.requesterPhone,
                assigned_to: data.assignedTo || null,
            },
            {
                preserveScroll: true,

                onStart: () => {
                    console.log('Iniciando petición POST...');
                },

                onSuccess: () => {
                    console.log('Laravel ha respondido correctamente');
                    setShowForm(false);
                },

                onError: (errors) => {
                    console.error('Errores de Laravel:', errors);
                },

                onFinish: () => {
                    console.log('Petición finalizada');
                },
            }
        );
    }



    
    function changeStatus(id: number, next: Status) {
        const current = incidents.find((i) => i.id === id);

        if (!current || current.status === next) return;

        if (!transitions[current.status].includes(next)) {
            alert('Transición de estado no permitida.');
            return;
        }

        const confirmed = window.confirm(
            `¿Confirmas cambiar la incidencia #${id}?\n\n` +
            `${statusLabels[current.status]} → ${statusLabels[next]}`
        );

        if (!confirmed) return;

        const actor = window.prompt(
            'Nombre del usuario que realiza el cambio:',
            'Operador'
        );

        if (actor === null) return;

        if (!actor.trim()) {
            alert('Debes indicar un usuario.');
            return;
        }

        console.log('Enviando PATCH:', {
            id,
            status: next,
            actor: actor.trim(),
        });

        router.patch(
            `/incidents/${id}/status`,
            {
                status: next,
                actor: actor.trim(),
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    console.log('Petición PATCH completada.');
                },

                onError: (errors) => {
                    console.error('Error actualizando estado:', errors);

                    alert(
                        Object.values(errors).join('\n') ||
                        'No se pudo actualizar la incidencia.'
                    );
                },
            }
        );
    }



    const stats = [
        { label: 'Total incidencias', value: counts.total, icon: ClipboardList, color: 'text-slate-700' },
        { label: 'Abiertas', value: counts.open, icon: Activity, color: 'text-blue-600' },
        { label: 'En revisión', value: counts.review, icon: Clock3, color: 'text-amber-600' },
        { label: 'Bloqueadas', value: counts.blocked, icon: ShieldAlert, color: 'text-red-600' },
        { label: 'Resueltas', value: counts.resolved, icon: CheckCircle2, color: 'text-emerald-600' },
    ];

    return (
        <>
            <Head title="Panel de incidencias | Optima Retail" />

            <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
                <header className="bg-[#101b30] text-white">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-blue-600 p-3">
                                <Building2 size={25} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                                    Optima Retail
                                </p>
                                <h1 className="text-xl font-bold">
                                    Facility Management
                                </h1>
                                <p className="text-xs text-slate-300">
                                    Panel operativo de incidencias
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full border border-slate-600 px-4 py-2 text-xs text-slate-200">
                            Gestión de mantenimiento · 24/7
                        </span>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl space-y-7 px-5 py-8 sm:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
                                Operaciones / Incidencias
                            </p>
                            <h2 className="mt-2 text-3xl font-bold">
                                Gestión de incidencias
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Control y seguimiento del mantenimiento de establecimientos comerciales.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-800"
                        >
                            <Plus size={19} />
                            Nueva incidencia
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm text-slate-500">{stat.label}</span>
                                    <stat.icon className={stat.color} size={20} />
                                </div>
                                <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <div className="mb-5">
                                <h3 className="text-lg font-bold">Incidencias registradas</h3>
                                <p className="text-sm text-slate-500">
                                    {filtered.length} incidencias encontradas
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        aria-label="Buscar incidencias"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar tienda, avería, técnico..."
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
                                    {Object.entries(statusLabels).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>

                                <select
                                    aria-label="Filtrar por prioridad"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                                >
                                    <option value="all">Todas las prioridades</option>
                                    {Object.entries(priorityLabels).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        {[
                                            'Incidencia',
                                            'Establecimiento',
                                            'Prioridad',
                                            'Estado',
                                            'Responsable',
                                            'Fecha',
                                            'Acciones',
                                        ].map((label) => (
                                            <th key={label} className="px-5 py-4 font-semibold">
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((incident) => (
                                        <tr key={incident.id} className="hover:bg-blue-50/40">
                                            <td className="px-5 py-4">
                                                <p className="font-semibold">{incident.title}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    #{incident.id} · {incident.category}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium">{incident.company}</p>
                                                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                    <MapPin size={12} />
                                                    {incident.address}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge className={priorityColors[incident.priority]}>
                                                    {priorityLabels[incident.priority]}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={incident.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <p>{incident.assignedTo}</p>
                                                <p className="text-xs text-slate-500">
                                                    Sol.: {incident.requesterName}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {formatDate(incident.createdAt)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        aria-label={`Estado de incidencia ${incident.id}`}
                                                        value={incident.status}
                                                        onChange={(e) =>
                                                            changeStatus(incident.id, e.target.value as Status)
                                                        }
                                                        className="max-w-36 rounded-lg border border-slate-300 p-2 text-xs"
                                                    >
                                                        <option value={incident.status}>
                                                            {statusLabels[incident.status]}
                                                        </option>
                                                        {transitions[incident.status].map((status) => (
                                                            <option key={status} value={status}>
                                                                {statusLabels[status]}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        title="Ver historial"
                                                        aria-label={`Ver historial de incidencia ${incident.id}`}
                                                        onClick={() => setHistoryId(incident.id)}
                                                        className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"
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
                        Prototipo de prueba técnica · Datos simulados, sin persistencia
                    </p>
                </main>
            </div>

            {showForm && (
                <Modal title="Nueva incidencia de mantenimiento" onClose={() => setShowForm(false)}>
                    <NewIncidentForm
                        onSave={createIncident}
                        onCancel={() => setShowForm(false)}
                    />
                </Modal>
            )}

            {selectedIncident && (
                <Modal
                    title={`Historial de incidencia #${selectedIncident.id}`}
                    onClose={() => setHistoryId(null)}
                >
                    <div className="mb-6 rounded-lg bg-slate-50 p-4">
                        <p className="font-semibold">{selectedIncident.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                            {selectedIncident.company} · {selectedIncident.address}
                        </p>
                    </div>

                    
                    {historyEvents.length === 0 ? (
                        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                            Esta incidencia todavía no tiene actividad registrada.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {historyEvents.map((event) => (
                                <div
                                    key={event.key}
                                    className="border-l-2 border-blue-400 pl-4"
                                >
                                    {event.type === 'log' ? (
                                        <>
                                            <p className="font-semibold text-slate-900">
                                                {event.log.action === 'created'
                                                    ? 'Incidencia registrada'
                                                    : event.log.action === 'reopened'
                                                        ? 'Incidencia reabierta'
                                                        : 'Cambio de estado'}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-600">
                                                {event.log.from
                                                    ? `${statusLabels[event.log.from]} → `
                                                    : ''}
                                                {event.log.to
                                                    ? statusLabels[event.log.to]
                                                    : 'Sin estado'}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {event.log.actor} ·{' '}
                                                {new Date(event.date).toLocaleString('es-ES')}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-semibold text-blue-700">
                                                Comentario añadido
                                            </p>

                                            <p className="mt-1 text-sm text-slate-700">
                                                {event.comment.body}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {event.comment.authorName} ·{' '}
                                                {new Date(event.date).toLocaleString('es-ES')}
                                            </p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <NewCommentForm incidentId={selectedIncident.id} />


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
