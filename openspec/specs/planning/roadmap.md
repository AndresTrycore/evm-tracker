# Roadmap & Orden de Implementación

> **Versión:** 2.0.0 | **Última actualización:** 2026-04-26
> **Aplicable a:** EVM Dashboard — Trycore Colombia Technical Challenge

Este documento detalla el orden secuencial de desarrollo recomendado para asegurar estabilidad e iteración constante.

---

## Fase 1: Setup y Arquitectura Base
1. Configuración del proyecto base de FastAPI y la estructura de carpetas `app/`.
2. Integración de herramientas de calidad (Ruff, MyPy) y validación en CI/CD local con Docker.
3. Configuración de conexión a PostgreSQL usando SQLAlchemy y Alembic.
4. Generación de las migraciones base de la base de datos (`projects` y `activities`).

## Fase 2: Capa de Dominio (EVM Engine)
1. Implementación de los modelos SQLAlchemy y schemas Pydantic.
2. Implementación del `EVMCalculator` (Módulo puro de Python, sin dependencias de frameworks web o BD).
3. Escritura de pruebas unitarias exhaustivas para la calculadora EVM abarcando los casos borde obligatorios definidos en `business_rules.md`.

## Fase 3: Capa de Acceso a Datos (Repositorios)
1. Implementación de los repositorios CRUD para `Project` y `Activity`.
2. Validaciones a nivel de base de datos.
3. Tests de integración a nivel de base de datos (testing con sesión transaccional aislada).

## Fase 4: Capa de Presentación (Endpoints API)
1. Implementación de Routers de FastAPI (`/api/v1/projects` y `/api/v1/projects/{id}/activities`).
2. Configuración e integración de Swagger/OpenAPI con ejemplos definidos.
3. Tests de integración E2E sobre los endpoints usando `TestClient`.

## Fase 5: Refinamiento y Definition of Done
1. Verificación final de calidad (linter 100% pasable sin warnings, mypy strict, cobertura pytest > 80%).
2. Revisión de manejo de excepciones y códigos HTTP (404, 422, 500).
3. Actualización de documentación de despliegue si aplica.
