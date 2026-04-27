# EVM Tracker

API para gestión de proyectos y actividades con cálculo de indicadores EVM (Earned Value Management).

## Estado actual

- Backend FastAPI operativo
- Base de datos PostgreSQL operativa en Docker
- Migraciones con Alembic habilitadas
- Frontend en carpeta [frontend](frontend) (sin aplicación activa en compose por ahora)

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.12 + FastAPI |
| Base de datos | PostgreSQL 15 |
| ORM | SQLAlchemy 2 |
| Migraciones | Alembic |
| Infraestructura | Docker + Docker Compose |

## Requisitos

- Docker + Docker Compose
- Git

## Configuración de entorno

1. Crear archivo de desarrollo:

```bash
cp .env.example .env.development
```

cp .env.example .env
```

Archivos relevantes:

- [ .env.example ](.env.example): plantilla base para configuración local (.env)

## Levantar el proyecto

```bash
docker compose up --build
```

Servicios disponibles:

| Servicio | URL |
|----------|-----|
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Healthcheck | http://localhost:8000/health |

## Base de datos y migraciones

Este proyecto usa Alembic para versionar esquema. No dependas de create_all como estrategia principal.

Flujo recomendado:

1. Levantar DB:

```bash
docker compose up -d db
```

2. Ejecutar migraciones:

```bash
docker compose run --rm api alembic -c backend/alembic.ini upgrade head
```

Guía completa de Alembic:

- [backend/alembic/README](backend/alembic/README)

## Comandos de desarrollo

### Tests

Todos los tests:

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

## Estructura actual

```text
evm-tracker/
├── backend/
│   ├── alembic/
│   ├── alembic.ini
│   ├── app/
│   │   ├── api/v1/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   └── tests/
│       ├── api/
│       └── unit/
├── docker-compose.yml
├── .env.example
└── README.md
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

## Apagar entorno

```bash
docker compose down
```

Con limpieza de volumen:

```bash
docker compose down -v
```
