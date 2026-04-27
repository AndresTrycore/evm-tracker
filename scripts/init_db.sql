-- =============================================================================
-- EVM Tracker — Script de inicialización de base de datos
-- Motor: PostgreSQL 15
-- Ejecutar con: psql -U evm_user -d evm_db -f scripts/init_db.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla: projects
CREATE TABLE IF NOT EXISTS projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL
                    CONSTRAINT ck_project_name_not_empty
                    CHECK (length(trim(name)) > 0),
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: activities
CREATE TABLE IF NOT EXISTS activities (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id            UUID NOT NULL
                              REFERENCES projects(id) ON DELETE CASCADE,
    name                  VARCHAR(200) NOT NULL
                                CONSTRAINT ck_activity_name_not_empty
                                CHECK (length(trim(name)) > 0),
    budget_at_completion  NUMERIC(15, 2) NOT NULL
                                CONSTRAINT ck_activity_bac_non_negative
                                CHECK (budget_at_completion >= 0),
    planned_progress      NUMERIC(5, 2) NOT NULL
                                CONSTRAINT ck_activity_planned_progress_range
                                CHECK (planned_progress >= 0 AND planned_progress <= 100),
    actual_progress       NUMERIC(5, 2) NOT NULL
                                CONSTRAINT ck_activity_actual_progress_range
                                CHECK (actual_progress >= 0 AND actual_progress <= 100),
    actual_cost           NUMERIC(15, 2) NOT NULL
                                CONSTRAINT ck_activity_actual_cost_non_negative
                                CHECK (actual_cost >= 0),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para acelerar consultas de actividades por proyecto
CREATE INDEX IF NOT EXISTS ix_activities_project_id
    ON activities(project_id);

-- =============================================================================
-- Datos de ejemplo para desarrollo y demo
-- (No ejecutar en producción)
-- =============================================================================

INSERT INTO projects (id, name, description) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Portal web corporativo',
        'Rediseño completo del portal público de la empresa'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Migración a la nube',
        'Migración de infraestructura on-premise a AWS'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities
    (id, project_id, name, budget_at_completion, planned_progress, actual_progress, actual_cost)
VALUES
    (
        '11111111-1111-1111-1111-111111111001',
        '11111111-1111-1111-1111-111111111111',
        'Diseño de interfaz',
        5000.00,
        80.00,
        90.00,
        3500.00
    ),
    (
        '11111111-1111-1111-1111-111111111002',
        '11111111-1111-1111-1111-111111111111',
        'Desarrollo módulo login',
        10000.00,
        50.00,
        30.00,
        4000.00
    ),
    (
        '11111111-1111-1111-1111-111111111003',
        '11111111-1111-1111-1111-111111111111',
        'Integración con CRM',
        8000.00,
        40.00,
        20.00,
        2000.00
    ),
    (
        '11111111-1111-1111-1111-111111111004',
        '22222222-2222-2222-2222-222222222222',
        'Configuración de VPC',
        6000.00,
        100.00,
        100.00,
        5800.00
    ),
    (
        '11111111-1111-1111-1111-111111111005',
        '22222222-2222-2222-2222-222222222222',
        'Migración de base de datos',
        15000.00,
        60.00,
        45.00,
        9500.00
    )
ON CONFLICT (id) DO NOTHING;
