# Proposal: Configurar Middleware de Seguridad y Healthcheck

Implementar políticas de seguridad CORS, validación de salud de base de datos y estandarización del punto de entrada para asegurar una integración fluida con el frontend y ambientes de despliegue.

## User Review Required

> [!IMPORTANT]
> **CORS Origins**: Se habilitarán explícitamente `http://localhost:3000` (React legacy) y `http://localhost:5173` (Vite moderno).
> **Healthcheck**: El endpoint `/health` ahora bloqueará brevemente si la DB no responde (validación síncrona).

## Proposed Changes

### Backend Core

#### [MODIFY] [main.py](file:///c:/Users/Usuario/Projects/Personal/evm-tracker/backend/app/main.py)
- Importar e integrar `CORSMiddleware`.
- Configurar orígenes, métodos y headers permitidos.
- Inyectar `root_path` desde configuración para soporte de proxies/traefik.
- Refactorizar `/health` para incluir validación de conectividad con Postgres.

#### [MODIFY] [config.py](file:///c:/Users/Usuario/Projects/Personal/evm-tracker/backend/app/core/config.py)
- Agregar `backend_cors_origins` y `api_root_path` a la clase `Settings`.

### Infraestructura

#### [MODIFY] [Dockerfile](file:///c:/Users/Usuario/Projects/Personal/evm-tracker/backend/Dockerfile)
- Ajustar el `CMD` final para incluir `--reload` y asegurar consistencia con el entorno de desarrollo solicitado.

## Verification Plan

### Automated Tests
- `curl -I -X OPTIONS -H "Origin: http://localhost:5173" http://localhost:8000/api/v1/projects` -> Verificar `Access-Control-Allow-Origin`.
- `curl http://localhost:8000/health` -> Verificar `{"status": "ok", "db": "connected"}`.

### Manual Verification
- Acceder a `/docs` y verificar que los paths sean correctos (especialmente si se usa ROOT_PATH).
