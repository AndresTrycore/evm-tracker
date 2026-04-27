# Roadmap & Orden de Implementación

> **Versión:** 3.0.0 | **Última actualización:** 2026-04-27
> **Aplicable a:** EVM Dashboard — Trycore Colombia Technical Challenge
> **Estado Actual:** Backend [COMPLETADO] | Frontend [POR INICIAR]

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

## Fase 5: Backend Refinement & DoD [FINALIZADO]
1. Verificación de calidad y cobertura > 90% finalizada.
2. Manejo de excepciones y CORS configurado.
3. El backend está listo para servir al frontend.

---

## Fase 6: Frontend Foundation & Design
1. Setup de Vite + React + Tailwind + Geist/DM Mono.
2. Implementación de variables CSS y `ThemeToggle`.
3. Rama: `feat/frontend-foundation`

## Fase 7: API Client & State Layer
1. Implementación de Axios, Zod schemas y hooks de TanStack Query.
2. Rama: `feat/api-state-layer`

## Fase 8: App Shell & Dashboard Layout
1. Implementación de `Sidebar` y estructura de navegación de proyectos.
2. Rama: `feat/app-shell-sidebar`

## Fase 9: Core EVM Visualization
1. Componentes `HealthBadge` y `ActivityTable` (Read-only).
2. Rama: `feat/core-evm-components`

## Fase 10: CRUD & Interactions
1. Implementación de `ActivityForm` y mutaciones de escritura.
2. Rama: `feat/activity-crud-flows`

## Fase 11: Advanced BI & Visualizations
1. `ProjectKPIs` con Mini-Trends y `EVMVisualizations` (S-Curve, Radar, Donut).
2. Rama: `feat/evm-visualizations-vips`
