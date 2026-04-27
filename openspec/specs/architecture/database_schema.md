# Database Schema

## Motor y versión

- **Motor:** PostgreSQL 15
- **ORM:** SQLAlchemy 2.0 (estilo declarativo con `DeclarativeBase`)
- **Inicialización:** `Base.metadata.create_all(bind=engine)` al arrancar la aplicación
- **Zona horaria:** Todas las fechas se almacenan en UTC

---

## Principios del esquema

1. **Los indicadores EVM nunca se persisten.** La base de datos almacena únicamente
   los datos crudos ingresados por el usuario. PV, EV, CV, SV, CPI, SPI, EAC y VAC
   se calculan en tiempo real en cada request.

2. **Nombres en snake_case.** Tablas y columnas siguen la convención de PostgreSQL.
   Los modelos Python usan los mismos nombres — sin mapeos confusos entre capa
   de dominio y capa de persistencia.

3. **Restricciones en la base de datos, no solo en Pydantic.** Las validaciones
   de rango (`CHECK`) y nulabilidad (`NOT NULL`) se declaran tanto en el schema
   de PostgreSQL como en el modelo SQLAlchemy. La base de datos es la última
   línea de defensa contra datos corruptos.

4. **Cascade delete explícito.** La relación proyecto → actividades define
   `CASCADE` tanto en la FK de PostgreSQL como en la relación SQLAlchemy.
   Eliminar un proyecto elimina todas sus actividades sin intervención manual.

5. **Sin lógica de negocio en los modelos.** Los modelos son representaciones
   puras de las tablas. Sin métodos que calculen EVM, sin propiedades que
   deriven indicadores.

---

## Diagrama entidad-relación

```
┌─────────────────────────────────┐
│            projects             │
├──────────────┬──────────────────┤
│ id           │ UUID PK          │
│ name         │ VARCHAR(200) NN  │
│ description  │ TEXT NULL        │
│ created_at   │ TIMESTAMPTZ NN   │
│ updated_at   │ TIMESTAMPTZ NN   │
└──────────────┴──────────────────┘
         │ 1
         │
         │ ∞  (ON DELETE CASCADE)
         ▼
┌─────────────────────────────────────────┐
│                activities               │
├──────────────────┬──────────────────────┤
│ id               │ UUID PK              │
│ project_id       │ UUID FK NN           │
│ name             │ VARCHAR(200) NN      │
│ budget_at_       │ NUMERIC(15,2) NN     │
│   completion     │ CHECK >= 0           │
│ planned_progress │ NUMERIC(5,2) NN      │
│                  │ CHECK 0–100          │
│ actual_progress  │ NUMERIC(5,2) NN      │
│                  │ CHECK 0–100          │
│ actual_cost      │ NUMERIC(15,2) NN     │
│                  │ CHECK >= 0           │
│ created_at       │ TIMESTAMPTZ NN       │
│ updated_at       │ TIMESTAMPTZ NN       │
└──────────────────┴──────────────────────┘
```

**Cardinalidad:** Un proyecto tiene cero o más actividades.
Una actividad pertenece a exactamente un proyecto.

---

## Tablas

### `projects`

| Columna | Tipo PostgreSQL | Tipo Python | Restricciones |
|---------|----------------|-------------|---------------|
| `id` | `UUID` | `uuid.UUID` | PK, default = `uuid4()` |
| `name` | `VARCHAR(200)` | `str` | NOT NULL, CHECK `length(trim(name)) > 0` |
| `description` | `TEXT` | `str \| None` | NULL permitido |
| `created_at` | `TIMESTAMPTZ` | `datetime` | NOT NULL, default = `now()` UTC |
| `updated_at` | `TIMESTAMPTZ` | `datetime` | NOT NULL, default = `now()` UTC, onupdate = `now()` UTC |

**Índices:**
- PK implícito en `id`
- Ningún índice adicional requerido para este volumen de datos

---

### `activities`

| Columna | Tipo PostgreSQL | Tipo Python | Restricciones |
|---------|----------------|-------------|---------------|
| `id` | `UUID` | `uuid.UUID` | PK, default = `uuid4()` |
| `project_id` | `UUID` | `uuid.UUID` | NOT NULL, FK → `projects.id` ON DELETE CASCADE |
| `name` | `VARCHAR(200)` | `str` | NOT NULL, CHECK `length(trim(name)) > 0` |
| `budget_at_completion` | `NUMERIC(15,2)` | `Decimal` | NOT NULL, CHECK >= 0 |
| `planned_progress` | `NUMERIC(5,2)` | `Decimal` | NOT NULL, CHECK >= 0 AND <= 100 |
| `actual_progress` | `NUMERIC(5,2)` | `Decimal` | NOT NULL, CHECK >= 0 AND <= 100 |
| `actual_cost` | `NUMERIC(15,2)` | `Decimal` | NOT NULL, CHECK >= 0 |
| `created_at` | `TIMESTAMPTZ` | `datetime` | NOT NULL, default = `now()` UTC |
| `updated_at` | `TIMESTAMPTZ` | `datetime` | NOT NULL, default = `now()` UTC, onupdate = `now()` UTC |

**Índices:**
- PK implícito en `id`
- Índice en `project_id` para acelerar la consulta de actividades por proyecto

**Decisión de tipos numéricos:**
Se usa `NUMERIC(15,2)` en lugar de `FLOAT` para presupuestos y costos porque
`NUMERIC` es exacto en PostgreSQL — no sufre errores de punto flotante que
distorsionen los cálculos EVM. Para los porcentajes `NUMERIC(5,2)` es suficiente
(máximo 100.00 con dos decimales). SQLAlchemy mapea `NUMERIC` a `Decimal` en Python;
el servicio EVM convierte a `float` al momento del cálculo.

---

## Modelos SQLAlchemy

### `db/base.py`

```python
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def init_db(engine) -> None:
    Base.metadata.create_all(bind=engine)
```

---

### `models/project.py`

```python
import uuid
from datetime import UTC, datetime
from sqlalchemy import CheckConstraint, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Project(Base):
    __tablename__ = "projects"

    __table_args__ = (
        CheckConstraint("length(trim(name)) > 0", name="ck_project_name_not_empty"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow
    )

    activities: Mapped[list["Activity"]] = relationship(
        "Activity",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
```

**Nota sobre `lazy="selectin"`:** Carga las actividades automáticamente en una
segunda query optimizada cada vez que se carga un proyecto. Evita el problema N+1
sin necesidad de hacer `joinedload` manual en cada consulta.

---

### `models/activity.py`

```python
import uuid
from datetime import UTC, datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, DateTime, ForeignKey, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Activity(Base):
    __tablename__ = "activities"

    __table_args__ = (
        CheckConstraint("length(trim(name)) > 0", name="ck_activity_name_not_empty"),
        CheckConstraint("budget_at_completion >= 0", name="ck_activity_bac_non_negative"),
        CheckConstraint("planned_progress >= 0 AND planned_progress <= 100", name="ck_activity_planned_progress_range"),
        CheckConstraint("actual_progress >= 0 AND actual_progress <= 100", name="ck_activity_actual_progress_range"),
        CheckConstraint("actual_cost >= 0", name="ck_activity_actual_cost_non_negative"),
        Index("ix_activities_project_id", "project_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    budget_at_completion: Mapped[Decimal] = mapped_column(
        Numeric(precision=15, scale=2), nullable=False
    )
    planned_progress: Mapped[Decimal] = mapped_column(
        Numeric(precision=5, scale=2), nullable=False
    )
    actual_progress: Mapped[Decimal] = mapped_column(
        Numeric(precision=5, scale=2), nullable=False
    )
    actual_cost: Mapped[Decimal] = mapped_column(
        Numeric(precision=15, scale=2), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow
    )

    project: Mapped["Project"] = relationship("Project", back_populates="activities")
```

---

## Script de inicialización

Este script debe incluirse en el repositorio como `scripts/init_db.sql`.
Se documenta en el `README.md` como alternativa a la inicialización automática.

```sql
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
    );

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
    );
```

**Nota:** Los datos de ejemplo generan escenarios EVM variados intencionalmente:
actividades bajo presupuesto, sobre presupuesto, adelantadas y atrasadas.
Esto permite validar todos los casos de la lógica EVM con datos reales en la demo.

---

## Conversión `Decimal` → `float` en el servicio EVM

SQLAlchemy retorna los campos `NUMERIC` como `Decimal` de Python.
El servicio EVM recibe `float`. La conversión debe hacerse en el servicio
de actividades antes de llamar a `evm_service`, no en el modelo ni en el endpoint:

```python
# En activity_service.py — al preparar datos para evm_service
evm_indicators = evm_service.calculate_activity_evm(
    budget_at_completion=float(activity.budget_at_completion),
    planned_progress=float(activity.planned_progress),
    actual_progress=float(activity.actual_progress),
    actual_cost=float(activity.actual_cost),
)
```

Esto mantiene `evm_service.py` trabajando con tipos primitivos puros (`float`),
sin dependencia de SQLAlchemy ni de `Decimal`.

---

## Sesión de base de datos

### `db/session.py`

```python
from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings


engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=settings.app_env == "development",
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**`pool_pre_ping=True`:** Verifica que la conexión esté viva antes de usarla.
Evita errores de conexión perdida después de períodos de inactividad en Docker.

**`echo=True` solo en development:** Loguea todas las queries SQL en consola.
Útil para depurar, pero nunca en producción.

---

## Variables de entorno requeridas

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://evm_user:evm_pass@db:5432/evm_db` | URL de conexión completa a PostgreSQL |

El formato sigue el estándar de SQLAlchemy. El host `db` corresponde al nombre
del servicio en `docker-compose.yml`.

---

## Decisiones de diseño documentadas

### Por qué `NUMERIC` y no `FLOAT` para valores monetarios
`FLOAT` en PostgreSQL es de punto flotante binario — sufre errores de precisión
en operaciones decimales. `NUMERIC` es exacto. Un presupuesto de `10000.00` COP
almacenado como `FLOAT` puede retornar `9999.9999999...`. Para valores monetarios
y porcentajes que alimentan cálculos EVM, la exactitud es no negociable.

### Por qué `TIMESTAMPTZ` y no `TIMESTAMP`
`TIMESTAMPTZ` almacena la fecha con referencia a UTC. `TIMESTAMP` almacena
sin zona horaria y asume la zona del servidor — comportamiento ambiguo en
entornos Docker donde la zona puede variar. Con `TIMESTAMPTZ` el comportamiento
es predecible en cualquier entorno.

### Por qué `lazy="selectin"` y no `lazy="joined"`
`joined` carga proyectos y actividades en un solo JOIN. Cuando se lista
`GET /api/v1/projects` (sin actividades), ese JOIN es innecesario.
`selectin` hace dos queries solo cuando se necesitan las actividades,
optimizando el endpoint de listado sin sacrificar el de detalle.

### Por qué constraints en la BD además de Pydantic
Pydantic valida en la capa HTTP. Si en el futuro se agregan scripts de
migración, jobs de importación masiva o acceso directo a la BD, las
restricciones de Pydantic no aplican. Los `CHECK` constraints en PostgreSQL
garantizan integridad de datos independientemente de cómo lleguen.