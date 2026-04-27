# Proposal: API Controllers y Servicios

## Problema
El sistema actual (feature-backend-core) cuenta con los modelos de base de datos (`Project`, `Activity`) y el motor de cálculo matemático EVM (`evm_service.py`), pero no dispone de una interfaz para que el frontend interactúe con el sistema. 

## Solución Propuesta
Desarrollar la capa de exposición (API REST con FastAPI) cumpliendo estrictamente con `api_design.md`. Para lograrlo se introducirá:
1. **Pydantic Schemas**: Para validar las entradas (`Create`, `Update`) y serializar las salidas (`Response`).
2. **Servicios de Aplicación**: Actuarán como puente, obteniendo datos de SQLAlchemy (tipos `Decimal`) y pasándolos al `evm_service` como `float` para inyectar los indicadores calculados al esquema final.
3. **Controladores (Routers)**: Endpoints RESTful y documentación nativa de FastAPI (Swagger/Redoc).
4. **Base de Datos de Pruebas**: Se utilizará una instancia de PostgreSQL aislada en los tests (mediante base de datos temporal) para garantizar consistencia con los tipos de datos nativos `UUID` y `NUMERIC`.

## Alcance
- **Nuevos Archivos**: `db/session.py`, `api/deps.py`, `schemas/*.py`, `services/project_service.py`, `services/activity_service.py`, `api/v1/*.py`, `tests/api/*.py`.
- **Modificados**: `main.py` (para incluir rutas y metadatos de Swagger).

## Decisiones de Diseño
- Conversión `Decimal` a `float`: Se realizará en los *services* (`project_service` / `activity_service`) manteniendo los controladores agnósticos a este detalle.
- Testing: No usar SQLite para tests. Se levantará/usará PostgreSQL para tests completos de API.
