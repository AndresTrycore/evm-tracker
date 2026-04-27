# Quality Standards

> **Versión:** 1.0.0 | **Última actualización:** 2026-04-26  
> **Aplicable a:** EVM Dashboard — Trycore Colombia Technical Challenge  
> **Stack:** Python 3.12 + FastAPI · React 19 · PostgreSQL 17

---

## Tabla de contenidos

1. [Gitflow & Control de Versiones](#1-gitflow--control-de-versiones)
2. [Estándares de Commit](#2-estándares-de-commit)
3. [Calidad de Código Backend](#3-calidad-de-código-backend)
4. [Calidad de Código Frontend](#4-calidad-de-código-frontend)
5. [Pruebas — Backend](#5-pruebas--backend)
6. [Pruebas — Frontend](#6-pruebas--frontend)
7. [Cobertura Mínima Obligatoria](#7-cobertura-mínima-obligatoria)
8. [Arquitectura Limpia — Reglas de Capas](#8-arquitectura-limpia--reglas-de-capas)
9. [Tooling de Calidad en Contenedor](#9-tooling-de-calidad-en-contenedor)
10. [Definition of Done](#10-definition-of-done)

---

## 1. Gitflow & Control de Versiones

### Estructura de ramas

```
main          ← producción (protegida, solo merge desde release/*)
develop       ← rama de integración continua
feature/*     ← una rama por funcionalidad
release/*     ← preparación de release candidata
hotfix/*      ← correcciones urgentes sobre main
```

### Ramas previstas para este proyecto

| Rama | Propósito |
|------|-----------|
| `feature/project-setup` | Configuración inicial: Docker, linters, CI skeleton |
| `feature/database-models` | Modelos SQLAlchemy + migraciones Alembic |
| `feature/evm-calculation` | Servicio de cálculo EVM puro (sin I/O) |
| `feature/rest-api` | Endpoints FastAPI + validaciones Pydantic |
| `feature/openapi-docs` | Decoradores OpenAPI, esquemas de error, ejemplos |
| `feature/unit-tests` | Suite completa de pruebas unitarias e integración |
| `feature/frontend-dashboard` | Dashboard React con tabla, KPIs y gráfica |
| `release/1.0.0` | Release candidate antes del merge final a `main` |

### Reglas de integración

- **Nunca** se commitea directamente a `main` o `develop`.
- Cada `feature/*` se integra a `develop` mediante **Pull Request**, aunque se trabaje en solitario.
- La rama `release/1.0.0` se crea desde `develop` cuando todas las features están integradas; solo se permiten bug fixes en ella antes del merge a `main`.
- El merge a `main` debe ir acompañado de un **tag semántico**: `git tag -a v1.0.0 -m "Release 1.0.0"`.

---

## 2. Estándares de Commit

### Formato obligatorio — Conventional Commits

```
<tipo>(<scope opcional>): <descripción imperativa en presente>

[cuerpo opcional: qué y por qué, no cómo]

[footer opcional: referencias a issues]
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|------|---------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `test` | Agregar o corregir pruebas |
| `refactor` | Refactorización sin cambio de comportamiento |
| `docs` | Documentación únicamente |
| `chore` | Tareas de build, CI, configuración |
| `perf` | Mejora de rendimiento |

### Ejemplos válidos

```
feat(evm): Add EVM calculation service with CPI and SPI computation
fix(evm): Handle zero AC edge case in CPI calculation
test(evm): Add unit tests for EAC when CPI approaches zero
feat(api): Add project consolidation endpoint with EVM indicators
refactor(evm): Extract interpretation logic into dedicated module
docs(api): Add OpenAPI examples for activity creation endpoint
chore(ci): Add Ruff and MyPy quality gates to GitHub Actions
```

### Mensajes prohibidos

```
fix
cambios
wip
update
arreglé cosas
más cambios
```

---

## 3. Calidad de Código Backend

### 3.1 Linter y Formateador — Ruff

Ruff reemplaza Flake8, isort, pydocstyle y bandit en una sola herramienta ultrarrápida.

**Configuración en `backend/pyproject.toml`:**

```toml
[tool.ruff]
target-version = "py312"
line-length = 88
src = ["app", "tests"]

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
    "N",   # pep8-naming
    "S",   # bandit (security)
    "ANN", # type annotations
    "PTH", # use pathlib
    "RUF", # ruff-specific rules
]
ignore = [
    "ANN101",  # Missing type annotation for self
    "ANN102",  # Missing type annotation for cls
    "S101",    # Use of assert (permitido en tests)
]

[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = ["S101", "ANN"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

**Comandos:**

```bash
# Verificar sin modificar
docker compose exec backend ruff check app/ tests/

# Formatear y corregir automáticamente
docker compose exec backend ruff check --fix app/ tests/
docker compose exec backend ruff format app/ tests/
```

### 3.2 Verificación de Tipos — MyPy

**Configuración en `backend/pyproject.toml`:**

```toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
plugins = ["pydantic.mypy"]

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
```

**Comando:**

```bash
docker compose exec backend mypy app/
```

### 3.3 Reglas de Código Limpio

**Prohibido en el código de producción:**

| Anti-patrón | Motivo |
|-------------|--------|
| Bloques comentados (`# old code`) | Si se necesita historial, existe Git |
| Variables sin usar | Ruff `F841` lo detecta automáticamente |
| Magic numbers (`if cpi > 1`) | Extraer a constante nombrada en `constants.py` |
| Magic strings (`status = "on_budget"`) | Usar `enum.StrEnum` |
| Lógica de negocio en controladores | Los routers solo orquestan; el cálculo vive en `services/` |
| Funciones con más de una responsabilidad | Aplicar Single Responsibility; máx. ~20 líneas |
| Lógica duplicada (más de dos veces) | Abstraer en función o clase reutilizable |

**Constantes EVM — `app/core/constants.py`:**

```python
from enum import StrEnum

class PerformanceStatus(StrEnum):
    UNDER_BUDGET    = "under_budget"
    OVER_BUDGET     = "over_budget"
    ON_BUDGET       = "on_budget"
    AHEAD_OF_SCHEDULE  = "ahead_of_schedule"
    BEHIND_SCHEDULE    = "behind_schedule"
    ON_SCHEDULE        = "on_schedule"

PERFORMANCE_THRESHOLD: float = 1.0
EVM_PRECISION: int = 4          # decimales en resultados calculados
ZERO_DENOMINATOR_RESULT: float  = 0.0
```

---

## 4. Calidad de Código Frontend

### 4.1 ESLint

**`frontend/.eslintrc.json`:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-magic-numbers": ["error", { "ignore": [0, 1, -1, 100] }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### 4.2 Prettier

**`frontend/.prettierrc`:**

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

### 4.3 Reglas de Código Limpio Frontend

- No se usan valores literales de color o tamaño fuera de los tokens de diseño (variables CSS / Tailwind).
- Los componentes React son funcionales con tipado explícito en props (`interface Props`).
- Los valores calculados (EVM indicators) nunca se recalculan en el componente: vienen del API.
- Los estados de carga y error siempre se manejan explícitamente (no se ignoran).

---

## 5. Pruebas — Backend

### 5.1 Estructura de pruebas

```
tests/
├── unit/
│   └── test_evm_calculator.py   ← lógica de cálculo, sin I/O
├── integration/
│   └── test_projects_api.py     ← contratos HTTP de cada endpoint
└── conftest.py                  ← fixtures compartidos (DB en memoria, cliente HTTP)
```

### 5.2 Pruebas unitarias EVM

Toda la lógica de `EVMCalculator` debe cubrirse con pruebas que validen **valores específicos**, no solo que la función retorna algo.

**Escenarios obligatorios para `test_evm_calculator.py`:**

```python
# ── Caso nominal ────────────────────────────────────────────────────────────
def test_planned_value_equals_planned_percent_times_bac():
    """PV = planned_percent × BAC"""

def test_earned_value_equals_completed_percent_times_bac():
    """EV = completed_percent × BAC"""

def test_cost_variance_positive_means_under_budget():
    """CV > 0 → se avanza más de lo que cuesta"""

def test_schedule_variance_negative_means_behind_schedule():
    """SV < 0 → se avanzó menos de lo planificado"""

def test_cpi_greater_than_one_means_cost_efficient():
    """CPI > 1 → cada peso gastado produce más de un peso de valor"""

def test_spi_greater_than_one_means_ahead_of_schedule():
    """SPI > 1 → se avanza más rápido de lo planificado"""

def test_eac_equals_bac_divided_by_cpi():
    """EAC = BAC / CPI"""

def test_vac_equals_bac_minus_eac():
    """VAC = BAC − EAC"""

# ── Casos borde ─────────────────────────────────────────────────────────────
def test_cpi_when_actual_cost_is_zero_returns_zero():
    """AC = 0 → CPI no produce ZeroDivisionError; retorna valor definido"""

def test_spi_when_planned_value_is_zero_returns_zero():
    """PV = 0 → SPI no produce ZeroDivisionError"""

def test_eac_when_cpi_approaches_zero_is_handled():
    """CPI ≈ 0 → EAC no explota; el sistema retorna un valor controlado"""

def test_project_with_no_activities_returns_zeroed_indicators():
    """Proyecto sin actividades → todos los indicadores consolidados = 0"""

def test_activity_with_zero_progress_produces_zero_ev():
    """% completado = 0 → EV = 0"""

def test_activity_with_full_completion_equals_bac():
    """% completado = 100 → EV = BAC"""

def test_activity_with_zero_bac_returns_zero_for_all_value_indicators():
    """BAC = 0 → PV = EV = 0 sin errores"""

# ── Interpretación ───────────────────────────────────────────────────────────
def test_cpi_status_over_one_returns_under_budget():
    """CPI > 1 → status = PerformanceStatus.UNDER_BUDGET"""

def test_cpi_status_under_one_returns_over_budget():
    """CPI < 1 → status = PerformanceStatus.OVER_BUDGET"""

def test_spi_status_over_one_returns_ahead_of_schedule():
    """SPI > 1 → status = PerformanceStatus.AHEAD_OF_SCHEDULE"""

def test_spi_status_under_one_returns_behind_schedule():
    """SPI < 1 → status = PerformanceStatus.BEHIND_SCHEDULE"""

# ── Consolidación por proyecto ───────────────────────────────────────────────
def test_project_consolidated_bac_equals_sum_of_activities():
    """BAC proyecto = Σ BAC actividades"""

def test_project_consolidated_cpi_uses_summed_ev_and_ac():
    """CPI consolidado = Σ EV / Σ AC (no promedio de CPIs)"""
```

> **Nota importante:** El CPI consolidado del proyecto se calcula como `Σ EV / Σ AC`, **no** como el promedio aritmético de los CPIs individuales. Esta es la fórmula correcta según el estándar PMI y debe reflejarse explícitamente en las pruebas.

### 5.3 Pruebas de integración API

Cada endpoint debe tener **al menos un test de integración** que valide:

- Código de estado HTTP correcto.
- Estructura del cuerpo de respuesta (schema).
- Al menos un caso de error (404, 422, etc.).

**Escenarios mínimos para `test_projects_api.py`:**

```python
# POST /projects
def test_create_project_returns_201_with_id()
def test_create_project_with_empty_name_returns_422()

# GET /projects/{id}
def test_get_project_returns_200_with_evm_indicators()
def test_get_nonexistent_project_returns_404()

# POST /projects/{id}/activities
def test_create_activity_returns_201_and_updates_project_indicators()
def test_create_activity_with_invalid_percent_returns_422()

# PUT /projects/{id}/activities/{aid}
def test_update_activity_recalculates_project_indicators()

# DELETE /projects/{id}/activities/{aid}
def test_delete_activity_removes_it_from_project()

# GET /projects/{id} — contratos de respuesta EVM
def test_response_includes_cpi_status_interpretation()
def test_response_includes_spi_status_interpretation()
def test_response_indicators_are_rounded_to_four_decimals()
```

---

## 6. Pruebas — Frontend

### Framework

**Vitest** + **React Testing Library** (no Enzyme; no snapshots sin criterio).

### Escenarios mínimos

```typescript
// EVMTable.test.tsx
test('renders activity row with calculated indicators from API response')
test('shows green indicator when CPI > 1')
test('shows red indicator when CPI < 1')
test('shows amber indicator when CPI === 1')

// ProjectDashboard.test.tsx
test('renders consolidated project indicators')
test('shows loading skeleton while fetching')
test('shows error message when API call fails')

// EVMChart.test.tsx
test('renders bars for PV, EV and AC per activity')
test('renders empty state when project has no activities')
```

---

## 7. Cobertura Mínima Obligatoria

| Capa | Herramienta | Umbral mínimo |
|------|-------------|---------------|
| Lógica de negocio EVM (`services/`) | pytest-cov | **≥ 90%** |
| Capa de dominio completa (`app/`) | pytest-cov | **≥ 80%** |
| Frontend (componentes) | Vitest coverage | **≥ 70%** |

**Configuración en `backend/pyproject.toml`:**

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "--cov=app --cov-report=term-missing --cov-fail-under=80"

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
]
```

**Comando de ejecución:**

```bash
docker compose exec backend pytest -v
```

---

## 8. Arquitectura Limpia — Reglas de Capas

```
app/
├── api/          ← Routers FastAPI. Solo validan input/output y delegan al servicio.
│                    PROHIBIDO: lógica de negocio, acceso directo a DB.
├── services/     ← Lógica de aplicación (orquestación). Llama al calculador y al repositorio.
│                    PROHIBIDO: SQL directo, construcción de respuestas HTTP.
├── domain/       ← Entidades de dominio y servicio de cálculo EVM puro.
│                    PROHIBIDO: imports de FastAPI, SQLAlchemy, Pydantic.
├── repositories/ ← Acceso a datos (SQLAlchemy). Solo queries; sin lógica de negocio.
├── schemas/      ← Modelos Pydantic de request/response.
├── models/       ← Modelos SQLAlchemy (tablas).
└── core/         ← Configuración, constantes, excepciones custom.
```

### Diagrama de dependencias (flujo unidireccional)

```
Router → Service → Domain (EVMCalculator)
Router → Service → Repository → DB
Router ← Service ← Repository
```

El dominio (`domain/`) no depende de ninguna capa externa. Es el corazón testeable puro.

---

## 9. Tooling de Calidad en Contenedor

### Requisito: Las herramientas no deben instalarse en el host

El contenedor backend instala Ruff y MyPy como parte del entorno Python. Un desarrollador con un clon fresco puede ejecutar checks de calidad sin instalar nada localmente.

**`backend/pyproject.toml` — dependencias de desarrollo:**

```toml
[project.optional-dependencies]
dev = [
    "ruff>=0.9.0",
    "mypy>=1.14.0",
    "pytest>=8.3.0",
    "pytest-cov>=6.0.0",
    "pytest-asyncio>=0.25.0",
    "httpx>=0.28.0",       # cliente async para tests de integración
    "factory-boy>=3.3.0",  # factories para fixtures
]
```

**`backend/Dockerfile` — instalación explícita:**

```dockerfile
RUN pip install -e ".[dev]"
```

### Comandos de calidad disponibles en contenedor

```bash
# Lint
docker compose exec backend ruff check app/ tests/

# Tipos
docker compose exec backend mypy app/

# Formateo
docker compose exec backend ruff format app/ tests/

# Tests con cobertura
docker compose exec backend pytest -v --cov=app --cov-report=term-missing

# Todo en secuencia (equivalente a CI local)
docker compose exec backend sh -c "ruff check app/ tests/ && mypy app/ && pytest -v"
```

### Escenarios de validación (BDD-style)

#### Escenario: Herramientas presentes tras build

```
DADO  que el contenedor backend ha sido construido
CUANDO un desarrollador entra al contenedor
ENTONCES `ruff --version` y `mypy --version` responden sin error
```

#### Escenario: Entorno fresco sin tooling local

```
DADO  un clon limpio sin Python instalado localmente
CUANDO el contenedor backend se reconstruye
ENTONCES `ruff` y `mypy` están disponibles dentro del contenedor
```

#### Escenario: Ruff reporta lint

```
DADO  que los archivos fuente del backend están presentes
CUANDO Ruff se ejecuta en el contenedor
ENTONCES analiza los archivos e imprime resultados (exit 0 si no hay errores)
```

#### Escenario: MyPy detecta error de tipos

```
DADO  que el código backend contiene una incompatibilidad de tipos
CUANDO MyPy se ejecuta en el contenedor
ENTONCES reporta el mismatch y sale con código de error no-cero
```

#### Escenario: El servicio backend sigue arrancando

```
DADO  que la definición del servicio backend es válida
CUANDO el contenedor inicia normalmente
ENTONCES la API FastAPI arranca exitosamente en el puerto configurado
```

#### Escenario: El host carece de tooling

```
DADO  que Ruff y MyPy no están instalados en el host
CUANDO el contenedor backend inicia
ENTONCES el startup no falla porque las herramientas están dentro del contenedor
```

---

## 10. Definition of Done

Una funcionalidad se considera **completa** únicamente cuando cumple **todos** los criterios siguientes:

### Código

- [ ] La lógica de negocio reside exclusivamente en `services/` o `domain/`, no en controladores.
- [ ] No existen bloques comentados, variables sin usar, ni magic numbers/strings.
- [ ] Todas las funciones públicas tienen type hints completos.
- [ ] `ruff check` pasa con cero errores.
- [ ] `mypy app/` pasa con cero errores.

### Pruebas

- [ ] Cobertura ≥ 80% en la capa de negocio (`pytest --cov`).
- [ ] Todos los casos borde EVM listados en `product/business_rules.md` tienen prueba unitaria.
- [ ] Cada endpoint nuevo tiene al menos un test de integración.
- [ ] Las pruebas validan valores específicos, no solo que la función retorna algo.

### Git

- [ ] Los cambios están en una rama `feature/*` correctamente nombrada.
- [ ] Existe al menos un Pull Request hacia `develop` (no push directo).
- [ ] Todos los mensajes de commit siguen el formato Conventional Commits.
- [ ] No existen commits con mensajes como `fix`, `cambios` o `wip`.

### API

- [ ] El endpoint está documentado con `summary`, `description`, `responses` y ejemplos en los schemas Pydantic.
- [ ] La respuesta incluye interpretación de CPI y SPI cuando aplica.
- [ ] Los errores retornan el schema `ValidationErrorResponse` estándar.

### Integración

- [ ] `docker compose up` levanta el sistema completo sin errores.
- [ ] `docker compose exec backend pytest -v` pasa en verde.
- [ ] El dashboard refleja los cambios del nuevo endpoint en tiempo real.

---