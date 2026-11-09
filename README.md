# Panel de Incidencias — Optima Retail

Aplicación de gestión operativa de incidencias desarrollada como prueba técnica Mid/Senior de Laravel y MySQL.

## Stack tecnológico

- Backend: Laravel 12 y PHP 8.2
- Frontend: React, TypeScript, Inertia.js y Tailwind CSS
- Base de datos: MySQL 8 o compatible
- Gestión de dependencias: Composer y npm
- Entorno de desarrollo: Node.js 22
- Interfaz responsive

## Requisitos

- PHP 8.2 o superior compatible con Laravel 12
- Composer 2
- Node.js 22 y npm
- MySQL 8 o MariaDB compatible
- Extensiones PHP necesarias para Laravel, incluyendo PDO MySQL

## Instalación

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd panel-incidencias
```

Instalar las dependencias:

```bash
composer install
npm install
```

Preparar el entorno:

```bash
cp .env.example .env
php artisan key:generate
```

En Windows PowerShell se puede utilizar `Copy-Item .env.example .env` en lugar de `cp`.

Crear una base de datos MySQL llamada `panel_incidencias` y configurar el archivo `.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=panel_incidencias
DB_USERNAME=root
DB_PASSWORD=
```

Las credenciales son un ejemplo de configuración local y deben adaptarse al entorno.

Ejecutar migraciones y cargar los datos de demostración:

```bash
php artisan migrate
php artisan db:seed
```

## Ejecutar la aplicación

En una terminal:

```bash
php artisan serve
```

En otra terminal:

```bash
npm run dev
```

Abrir:

http://localhost:8000

Para compilar los recursos de producción:

```bash
npm run build
```

## Funcionalidades

- Alta de incidencias con validación de datos.
- Listado con búsqueda y filtros por estado y prioridad.
- Estados: abierta, en revisión, bloqueada y resuelta.
- Confirmación de cambios de estado.
- Validación de transiciones permitidas.
- Registro de cambios de estado con actor, fecha y valores anterior y nuevo.
- Historial de actividad y comentarios operativos.
- Contadores por estado y resaltado de incidencias bloqueadas.
- Interfaz responsive desarrollada con React.

## Decisiones técnicas

Se utiliza Inertia.js para conectar Laravel con React sin construir una API REST independiente.

Laravel es responsable de validar y persistir las operaciones. React gestiona la interacción de la interfaz, los filtros rápidos y los diálogos de confirmación.

Los cambios de estado y sus logs se guardan en una transacción para evitar que una incidencia cambie de estado sin registrar su correspondiente evento de auditoría.

Las transiciones se centralizan en el enum `IncidentStatus`.

La aplicación no incorpora autenticación. Para la demostración, el actor de un cambio de estado se introduce manualmente. En un entorno productivo debería obtenerse del usuario autenticado.

## Diagnóstico de inconsistencias

El proyecto incluye un comando Artisan para detectar inconsistencias entre `incidents` e `incident_logs`.

### Crear datos inconsistentes

**Solo en desarrollo:**

```bash
php artisan db:seed --class=IncidentInconsistencySeeder
```

El seeder crea tres situaciones:

1. Una incidencia resuelta sin log de resolución.
2. Una incidencia cuyo estado actual difiere del último log.
3. Una incidencia con un log duplicado.

El seeder es independiente de los datos normales y no debe ejecutarse en producción.

### Ejecutar diagnóstico (dry-run)

```bash
php artisan incidents:diagnose
```

El comando inspecciona las incidencias y muestra los problemas encontrados sin modificar los datos.

### Modo de reparación

```bash
php artisan incidents:diagnose --fix
```

La implementación actual aplica una política conservadora: las inconsistencias ambiguas quedan pendientes de revisión manual y no se modifican automáticamente.

Esto evita inventar eventos históricos, alterar estados sin evidencia o eliminar registros de auditoría legítimos.

### Consultas de diagnóstico

Para detectar divergencias de estado, se obtiene el último log de estado ordenado por `created_at DESC, id DESC` y se compara `new_value` con `incidents.status`.

Para detectar resoluciones sin log, se buscan incidencias con `status = 'resolved'` para las que no exista un evento de resolución.

Para detectar duplicados, se agrupan logs por incidencia, acción, estado anterior, estado nuevo, actor y fecha; los grupos con más de una entrada se consideran sospechosos.

Las consultas SQL completas y su ejecución se describen en la sección de diagnóstico del proyecto o pueden incorporarse a `docs/diagnostico.sql`.

### Política de corrección

- **Resolución sin log:** revisar la evidencia y registrar una regularización auditada si se confirma la resolución.
- **Estado divergente:** determinar cuál es el estado real antes de modificarlo.
- **Log duplicado:** confirmar la duplicidad antes de anular o marcar el evento.

No se eliminan logs automáticamente porque constituyen evidencia histórica.

## Pruebas

Para ejecutar las pruebas automatizadas disponibles:

```bash
php artisan test
```

## Autenticación

No se ha implementado autenticación.

## Consideraciones para producción

Se recomienda añadir autenticación y permisos, auditoría del usuario autenticado, paginación del listado, pruebas de integración y una estrategia de almacenamiento de fechas en UTC con visualización en la zona horaria correspondiente.
