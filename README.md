# EVM Tracker

Herramienta interna para que los líderes de proyecto puedan registrar el avance de sus actividades y analizar el desempeño en cronograma y presupuesto usando la metodología de Valor Ganado (Earned Value Management).

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.11 + FastAPI |
| Base de datos | PostgreSQL 15 |
| ORM | SQLAlchemy |
| Frontend | React 18 + Axios |
| Gráficas | Recharts |
| Infraestructura | Docker + Docker Compose |

---

## Requisitos previos

- [Docker](https://www.docker.com/get-started) y Docker Compose instalados
- Git

---

## Cómo correr el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/<tu-usuario>/evm-tracker.git
cd evm-tracker
```

### 2. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
```

Los valores por defecto en `.env.example` funcionan sin modificaciones para desarrollo local.

### 3. Levantar la aplicación

```bash
docker compose up --build
```

Este comando:
- Levanta una base de datos PostgreSQL 15
- Levanta el backend FastAPI en el puerto `8000`
- Levanta el frontend React en el puerto `3000`
- Crea todas las tablas de la base de datos automáticamente en el primer arranque

### 4. Abrir la aplicación

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## Inicialización de la base de datos

El esquema de la base de datos se crea automáticamente cuando el backend arranca por primera vez mediante `create_all` de SQLAlchemy. No se requieren pasos manuales de migración.

Si prefieres inicializar la base de datos manualmente:

```bash
docker compose up db -d
docker compose run --rm backend python -c "from app.db.base import init_db; init_db()"
```

---

## Estructura del proyecto

```
evm-tracker/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── projects.py
│   │   │       │   └── activities.py
│   │   │       └── router.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── project.py
│   │   │   └── activity.py
│   │   ├── schemas/
│   │   │   ├── project.py
│   │   │   └── activity.py
│   │   ├── services/
│   │   │   ├── project_service.py
│   │   │   ├── activity_service.py
│   │   │   └── evm_service.py
│   │   └── main.py
│   ├── tests/
│   │   ├── unit/
│   │   │   └── test_evm_service.py
│   │   └── integration/
│   │       ├── test_projects.py
│   │       └── test_activities.py
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── AI_PROCESS.md
```

---

## Correr las pruebas

### Pruebas unitarias e integración

```bash
docker compose run --rm backend pytest tests/ -v --cov=app --cov-report=term-missing
```

### Solo pruebas unitarias

```bash
docker compose run --rm backend pytest tests/unit/ -v
```

### Solo pruebas de integración

```bash
docker compose run --rm backend pytest tests/integration/ -v
```

---

## Endpoints del API

### Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/projects` | Listar todos los proyectos |
| POST | `/api/v1/projects` | Crear un proyecto |
| GET | `/api/v1/projects/{id}` | Obtener proyecto con indicadores EVM |
| PUT | `/api/v1/projects/{id}` | Actualizar un proyecto |
| DELETE | `/api/v1/projects/{id}` | Eliminar un proyecto |

### Actividades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/projects/{id}/activities` | Listar actividades de un proyecto |
| POST | `/api/v1/projects/{id}/activities` | Crear una actividad |
| PUT | `/api/v1/projects/{id}/activities/{activity_id}` | Actualizar una actividad |
| DELETE | `/api/v1/projects/{id}/activities/{activity_id}` | Eliminar una actividad |

La documentación completa del API está disponible en `/docs` (Swagger UI) con el backend corriendo.

---

## Indicadores EVM

El sistema calcula automáticamente los siguientes indicadores por actividad y de forma consolidada por proyecto:

| Indicador | Fórmula | Descripción |
|-----------|---------|-------------|
| PV — Planned Value | `% planificado × BAC` | Valor planificado del trabajo programado |
| EV — Earned Value | `% completado × BAC` | Valor ganado del trabajo realizado |
| CV — Cost Variance | `EV − AC` | Varianza de costo (positivo = bajo presupuesto) |
| SV — Schedule Variance | `EV − PV` | Varianza de cronograma (positivo = adelantado) |
| CPI — Cost Performance Index | `EV / AC` | Índice de eficiencia en costos |
| SPI — Schedule Performance Index | `EV / PV` | Índice de eficiencia en cronograma |
| EAC — Estimate at Completion | `BAC / CPI` | Costo proyectado total al finalizar |
| VAC — Variance at Completion | `BAC − EAC` | Superávit o déficit proyectado al finalizar |

### Interpretación de índices

| Índice | Mayor a 1 | Igual a 1 | Menor a 1 |
|--------|-----------|-----------|-----------|
| CPI | Bajo presupuesto | En presupuesto | Sobre presupuesto |
| SPI | Adelantado | En cronograma | Atrasado |

---

## Detener la aplicación

```bash
docker compose down
```

Para eliminar también el volumen de la base de datos:

```bash
docker compose down -v
```

---

## Estrategia de ramas

Este proyecto sigue Gitflow:

- `main` — código listo para producción
- `develop` — rama de integración
- `feature/*` — funcionalidades individuales
- `release/*` — preparación de releases

---

## Licencia

Este proyecto fue desarrollado como desafío técnico para Trycore Colombia.
