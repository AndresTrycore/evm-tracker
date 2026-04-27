# EVM Tracker

Sistema de seguimiento de proyectos con enfoque en Earned Value Management (EVM).

Incluye:
- Backend FastAPI para gestión de proyectos/actividades y cálculo de indicadores EVM.
- Frontend React + Vite para dashboard operativo con KPIs, tabla y visualizaciones.
- PostgreSQL + Alembic para persistencia y versionado de esquema.

## Arquitectura

### Backend
- FastAPI + SQLAlchemy 2 + Pydantic.
- Endpoints REST bajo `/api/v1`.
- Cálculo EVM por actividad y consolidado por proyecto (PV, EV, CV, SV, CPI, SPI, EAC, VAC).
- Estados interpretados de costo y cronograma (por ejemplo: `bajo presupuesto`, `atrasado`).

### Frontend
- React 18 + TypeScript + Vite + Tailwind.
- Estado remoto con TanStack Query.
- Cliente HTTP con Axios.
- Dashboard con:
	- KPIs del proyecto.
	- Curva S (PV/EV/AC acumulados).
	- Radar de salud del proyecto.
	- Donut de distribución BAC por actividad.
	- Tabla de actividades con filtros, orden, edición y borrado.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.12 + FastAPI |
| Persistencia | PostgreSQL 15 |
| ORM | SQLAlchemy 2 |
| Migraciones | Alembic |
| Frontend | React 18 + TypeScript + Vite + Tailwind |
| Charts | Recharts |
| Infra | Docker + Docker Compose |

## Requisitos

### Para entorno Docker (recomendado)
- Docker
- Docker Compose

### Para ejecución local (opcional)
- Python 3.12+
- Node.js 20+

## Configuración de entorno

Desde la raíz del proyecto, crear archivo de entorno:

```bash
cp .env.example .env
```

Variables relevantes (ver `.env.example`):
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `DATABASE_URL` (opcional, tiene prioridad sobre `DB_*`)

## Levantar backend y base de datos con Docker

```bash
docker compose up --build
```

Servicios publicados:

| Servicio | URL/puerto |
|----------|------------|
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Healthcheck | http://localhost:8000/health |
| PostgreSQL (host) | localhost:5433 |

Nota: internamente el contenedor `api` conecta a `db:5432`; desde host el puerto expuesto es `5433`.

## Ejecutar frontend

El frontend no está incluido como servicio en `docker-compose.yml`. Se ejecuta por separado:

```bash
cd frontend
npm install
npm run dev
```

URL por defecto: http://localhost:5173

Si necesitas apuntar a otro backend, define `VITE_API_URL` (por defecto usa `http://localhost:8000/api/v1`).

## Migraciones (Alembic)

Comandos desde la raíz del repo:

```bash
docker compose run --rm api alembic -c backend/alembic.ini current
docker compose run --rm api alembic -c backend/alembic.ini upgrade head
```

Crear migración:

```bash
docker compose run --rm api alembic -c backend/alembic.ini revision --autogenerate -m "describe_cambio"
```

Referencia completa: [backend/alembic/README](backend/alembic/README)

## Comandos de desarrollo (backend)

### Tests

Todos:

```bash
docker compose run --rm api pytest tests -v --cov=app --cov-report=term-missing
```

Solo unit:

```bash
docker compose run --rm api pytest tests/unit -v
```

Solo API:

```bash
docker compose run --rm api pytest tests/api -v
```

### Calidad

```bash
docker compose run --rm api ruff check app tests
docker compose run --rm api mypy app
```

## Endpoints principales

| Método | Endpoint |
|--------|----------|
| GET | /api/v1/projects |
| POST | /api/v1/projects |
| GET | /api/v1/projects/{project_id} |
| PUT | /api/v1/projects/{project_id} |
| DELETE | /api/v1/projects/{project_id} |
| GET | /api/v1/projects/{project_id}/activities |
| POST | /api/v1/projects/{project_id}/activities |
| PUT | /api/v1/projects/{project_id}/activities/{activity_id} |
| DELETE | /api/v1/projects/{project_id}/activities/{activity_id} |

## Estructura del repositorio

```text
evm-tracker/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── alembic/
│   └── tests/
├── frontend/
│   ├── src/components/
│   ├── src/hooks/
│   ├── src/services/
│   └── src/types/
├── openspec/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Apagar entorno

```bash
docker compose down
```

Con limpieza de volúmenes:

```bash
docker compose down -v
```
