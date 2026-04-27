# API Design

## Principios generales

- Estilo: REST con recursos anidados para actividades bajo proyectos.
- Prefijo global: `/api/v1`
- Formato de request y response: `application/json` en todos los endpoints.
- Fechas: ISO 8601 con zona horaria UTC — `"2024-01-15T10:30:00Z"`.
- Números decimales: máximo 2 decimales en la respuesta (redondear con `round(value, 2)`).
- Idioma de los mensajes de error: español — consistente con la interfaz del sistema.
- Documentación interactiva disponible en `/docs` (Swagger UI) y `/redoc` (ReDoc).
- Cada endpoint debe incluir en su decorador: `summary`, `description`, `response_model`
  y `responses` con todos los códigos de error posibles.

---

## Convenciones de respuesta

### Respuesta exitosa con datos
El body es directamente el recurso o lista de recursos. Sin envoltura `{ data: ... }`.

### Respuesta de error
Todos los errores usan este esquema consistente:

```json
{
  "detail": "Mensaje descriptivo del error en español"
}
```

FastAPI ya usa este esquema por defecto para 422. Los 404 y 500 deben seguirlo también.

### Códigos HTTP utilizados

| Código | Cuándo |
|--------|--------|
| `200 OK` | GET y PUT exitosos |
| `201 Created` | POST exitoso |
| `204 No Content` | DELETE exitoso — sin body |
| `404 Not Found` | Recurso no encontrado |
| `422 Unprocessable Entity` | Error de validación Pydantic |
| `500 Internal Server Error` | Error inesperado del servidor |

---

## Schemas

### `ProjectBase`
```json
{
  "name": "string (1–200 caracteres)",
  "description": "string (0–1000 caracteres) | null"
}
```

### `ProjectCreate` — hereda `ProjectBase`
Sin campos adicionales.

### `ProjectUpdate` — todos los campos opcionales
```json
{
  "name": "string (1–200 caracteres) | null",
  "description": "string (0–1000 caracteres) | null"
}
```

### `ProjectResponse` — hereda `ProjectBase`
```json
{
  "id": "string (UUID v4)",
  "name": "string",
  "description": "string | null",
  "created_at": "datetime (ISO 8601 UTC)",
  "updated_at": "datetime (ISO 8601 UTC)"
}
```

### `ActivityBase`
```json
{
  "name": "string (1–200 caracteres)",
  "budget_at_completion": "float >= 0",
  "planned_progress": "float [0.0 – 100.0]",
  "actual_progress": "float [0.0 – 100.0]",
  "actual_cost": "float >= 0"
}
```

### `ActivityCreate` — hereda `ActivityBase`
Sin campos adicionales.

### `ActivityUpdate` — todos los campos opcionales
```json
{
  "name": "string | null",
  "budget_at_completion": "float >= 0 | null",
  "planned_progress": "float [0.0–100.0] | null",
  "actual_progress": "float [0.0–100.0] | null",
  "actual_cost": "float >= 0 | null"
}
```

### `EVMIndicators` — indicadores calculados por actividad
```json
{
  "planned_value": "float",
  "earned_value": "float",
  "cost_variance": "float",
  "schedule_variance": "float",
  "cost_performance_index": "float | null",
  "schedule_performance_index": "float | null",
  "estimate_at_completion": "float | null",
  "variance_at_completion": "float | null"
}
```

### `EVMSummary` — hereda `EVMIndicators`, consolidado del proyecto
```json
{
  "planned_value": "float",
  "earned_value": "float",
  "cost_variance": "float",
  "schedule_variance": "float",
  "cost_performance_index": "float | null",
  "schedule_performance_index": "float | null",
  "estimate_at_completion": "float | null",
  "variance_at_completion": "float | null",
  "cost_status": "string",
  "schedule_status": "string"
}
```

Valores posibles de `cost_status`: `"bajo presupuesto"` | `"en presupuesto"` | `"sobre presupuesto"` | `"sin datos"`
Valores posibles de `schedule_status`: `"adelantado"` | `"en cronograma"` | `"atrasado"` | `"sin datos"`

### `ActivityResponse` — hereda `ActivityBase`
```json
{
  "id": "string (UUID v4)",
  "project_id": "string (UUID v4)",
  "name": "string",
  "budget_at_completion": "float",
  "planned_progress": "float",
  "actual_progress": "float",
  "actual_cost": "float",
  "created_at": "datetime (ISO 8601 UTC)",
  "updated_at": "datetime (ISO 8601 UTC)",
  "evm": "EVMIndicators"
}
```

### `ProjectWithEVM` — hereda `ProjectResponse`
```json
{
  "id": "string (UUID v4)",
  "name": "string",
  "description": "string | null",
  "created_at": "datetime (ISO 8601 UTC)",
  "updated_at": "datetime (ISO 8601 UTC)",
  "activities": "List[ActivityResponse]",
  "evm_summary": "EVMSummary"
}
```

---

## Endpoints — Proyectos

### `GET /api/v1/projects`

**Summary:** Listar todos los proyectos
**Description:** Retorna la lista de proyectos registrados. No incluye actividades
ni indicadores EVM — usar `GET /api/v1/projects/{project_id}` para el detalle completo.

**Response 200:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Proyecto Alpha",
    "description": "Rediseño del portal web",
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-10T08:00:00Z"
  }
]
```

**Posibles errores:**

| Código | Condición | Mensaje |
|--------|-----------|---------|
| `500` | Error de base de datos | `"Error interno del servidor"` |

---

### `POST /api/v1/projects`

**Summary:** Crear un proyecto
**Description:** Crea un nuevo proyecto. Retorna el proyecto creado con su `id` asignado.

**Request body:**
```json
{
  "name": "Proyecto Beta",
  "description": "Migración a la nube"
}
```

**Response 201:**
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "name": "Proyecto Beta",
  "description": "Migración a la nube",
  "created_at": "2024-01-15T09:00:00Z",
  "updated_at": "2024-01-15T09:00:00Z"
}
```

**Posibles errores:**

| Código | Condición | Mensaje |
|--------|-----------|---------|
| `422` | `name` vacío o ausente | `"El nombre del proyecto es obligatorio"` |
| `422` | `name` supera 200 caracteres | `"El nombre no puede superar 200 caracteres"` |
| `500` | Error de base de datos | `"Error interno del servidor"` |

---

### `GET /api/v1/projects/{project_id}`

**Summary:** Obtener proyecto con indicadores EVM
**Description:** Retorna el proyecto con todas sus actividades y los indicadores EVM
calculados por actividad y de forma consolidada para el proyecto completo.
Este es el endpoint principal del sistema — el frontend lo usa para renderizar el dashboard.

**Path params:**
- `project_id` (string UUID v4, requerido): ID del proyecto

**Response 200:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Proyecto Alpha",
  "description": "Rediseño del portal web",
  "created_at": "2024-01-10T08:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z",
  "activities": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "project_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Desarrollo módulo de login",
      "budget_at_completion": 10000.0,
      "planned_progress": 50.0,
      "actual_progress": 30.0,
      "actual_cost": 4000.0,
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-15T12:00:00Z",
      "evm": {
        "planned_value": 5000.0,
        "earned_value": 3000.0,
        "cost_variance": -1000.0,
        "schedule_variance": -2000.0,
        "cost_performance_index": 0.75,
        "schedule_performance_index": 0.6,
        "estimate_at_completion": 13333.33,
        "variance_at_completion": -3333.33
      }
    },
    {
      "id": "423e4567-e89b-12d3-a456-426614174003",
      "project_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Diseño de interfaz",
      "budget_at_completion": 5000.0,
      "planned_progress": 80.0,
      "actual_progress": 90.0,
      "actual_cost": 3500.0,
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-15T12:00:00Z",
      "evm": {
        "planned_value": 4000.0,
        "earned_value": 4500.0,
        "cost_variance": 1000.0,
        "schedule_variance": 500.0,
        "cost_performance_index": 1.29,
        "schedule_performance_index": 1.13,
        "estimate_at_completion": 3882.0,
        "variance_at_completion": 1118.0
      }
    }
  ],
  "evm_summary": {
    "planned_value": 9000.0,
    "earned_value": 7500.0,
    "cost_variance": 0.0,
    "schedule_variance": -1500.0,
    "cost_performance_index": 1.0,
    "schedule_performance_index": 0.83,
    "estimate_at_completion": 15000.0,
    "variance_at_completion": 0.0,
    "cost_status": "en presupuesto",
    "schedule_status": "atrasado"
  }
}
```

**Posibles errores:**

| Código | Condición | Mensaje |
|--------|-----------|---------|
| `404` | `project_id` no existe | `"Proyecto con id {project_id} no encontrado"` |
| `500` | Error de base de datos | `"Error interno del servidor"` |

---

### `PUT /api/v1/projects/{project_id}`

**Summary:** Actualizar un proyecto
**Description:** Actualiza los campos enviados en el body. Los campos no enviados
conservan su valor actual (PATCH semántico sobre método PUT).

**Path params:**
- `project_id` (string UUID v4, requerido): ID del proyecto

**Request body** (todos los campos opcionales):
```json
{
  "name": "Proyecto Alpha v2",
  "description": "Descripción actualizada"
}
```

**Response 200:** `ProjectResponse` con los datos actualizados.

**Posibles errores:**

| Código | Condición | Mensaje |
|--------|-----------|---------|
| `404` | `project_id` no existe | `"Proyecto con id {project_id} no encontrado"` |
| `422` | `name` vacío si se envía | `"El nombre del proyecto es obligatorio"` |
| `500` | Error de base de datos | `"Error interno del servidor"` |

---

### `DELETE /api/v1/projects/{project_id}`

**Summary:** Eliminar un proyecto
**Description:** Elimina el proyecto y todas sus actividades en cascada.
Esta operación es irreversible.

**Path params:**
- `project_id` (string UUID v4, requerido): ID del proyecto

**Response 204:** Sin body.

**Posibles errores:**

| Código | Condición | Mensaje |
|--------|-----------|---------|
| `404` | `project_id` no existe | `"Proyecto con id {project_id} no encontrado"` |
| `500` | Error de base de datos | `"Error interno del servidor"` |

---

## Endpoints — Actividades

### `GET /api/v1/projects/{project_id}/activities`

**Summary:** Listar actividades de un proyecto
**Description:** Retorna todas las actividades del proyecto con sus indicadores EVM
calculados individualmente. No incluye el resumen consolidado del proyecto.

**Path params:**
- `project_id` (string UUID v4, requerido): ID del proyecto

**Response 200:**
```json
[
  {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "project_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Desarrollo módulo de login",
    "budget_at_completion": 10000.0,
    "planned_progress": 50.0,
    "actual_progress": 30.0,
    "actual_cost": 4000.0,
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "evm": {
      "planned_value": 5000.0,
      "earned_value": 3000.0,
      "cost_variance": -1000.0,
      "schedule_variance": -2000.0,
      "cost_performance_index": 0.75,
      "schedule_performance_index": 0.6,
      "estimate_at_completion": 13333.33,
      "variance_at_completion": -3333.33
    }
  }
]
```

**Posibles errores:**

| Código | Condición | Mensaje |
|--------|-----------|---------|
| `404` | `project_id` no existe | `"Proyecto con id {project_id} no encontrado"` |
| `500` | Error de base de datos | `"Error interno del servidor"` |

---

### `POST /api/v1/projects/{project_id}/activities`

**Summary:** Crear una actividad
**Description:** Crea una nueva actividad dentro del proyecto especificado.
Retorna la actividad creada con sus indicadores EVM calculados.

**Path params:**
- `project_id` (string UUID v4, requerido): ID del proyecto

**Request body:**
```json
{
  "name": "Pruebas de integración",
  "budget_at_completion": 8000.0,
  "planned_progress": 25.0,
  "actual_progress": 10.0,
  "actual_cost": 1200.0
}
```

**Response 201:** `ActivityResponse` con indicadores EVM calculados.

**Posibles errores:**

| Código | Condición | Mensaje |
|--------|-----------|---------|
| `404` | `project_id` no existe | `"Proyecto con id {project_id} no encontrado"` |
| `422` | `name` vacío o ausente | `"El nombre de la actividad es obligatorio"` |
| `422` | `budget_at_completion` negativo | `"El presupuesto no puede ser negativo"` |
| `422` | `planned_progress` fuera de rango | `"El avance planificado debe estar entre 0 y 100"` |
| `422` | `actual_progress` fuera de rango | `"El avance real debe estar entre 0 y 100"` |
| `422` | `actual_cost` negativo | `"El costo real no puede ser negativo"` |
| `500` | Error de base de datos | `"Error interno del servidor"` |

---

### `PUT /api/v1/projects/{project_id}/activities/{activity_id}`

**Summary:** Actualizar una actividad
**Description:** Actualiza los campos enviados. Los campos no enviados conservan
su valor actual. Recalcula y retorna los indicadores EVM con los nuevos valores.

**Path params:**
- `project_id` (string UUID v4, requerido): ID del proyecto
- `activity_id` (string UUID v4, requerido): ID de la actividad

**Request body** (todos los campos opcionales):
```json
{
  "actual_progress": 45.0,
  "actual_cost": 5500.0
}
```

**Response 200:** `ActivityResponse` con indicadores EVM recalculados.

**Posibles errores:**

| Código | Condición | Mensaje |
|--------|-----------|---------|
| `404` | `project_id` no existe | `"Proyecto con id {project_id} no encontrado"` |
| `404` | `activity_id` no existe en el proyecto | `"Actividad con id {activity_id} no encontrada"` |
| `422` | Cualquier campo con valor inválido | Mensaje específico por campo (ver POST) |
| `500` | Error de base de datos | `"Error interno del servidor"` |

---

### `DELETE /api/v1/projects/{project_id}/activities/{activity_id}`

**Summary:** Eliminar una actividad
**Description:** Elimina la actividad del proyecto. El resumen EVM del proyecto
se recalcula automáticamente en el siguiente request. Operación irreversible.

**Path params:**
- `project_id` (string UUID v4, requerido): ID del proyecto
- `activity_id` (string UUID v4, requerido): ID de la actividad

**Response 204:** Sin body.

**Posibles errores:**

| Código | Condición | Mensaje |
|--------|-----------|---------|
| `404` | `project_id` no existe | `"Proyecto con id {project_id} no encontrado"` |
| `404` | `activity_id` no existe en el proyecto | `"Actividad con id {activity_id} no encontrada"` |
| `500` | Error de base de datos | `"Error interno del servidor"` |

---

## Configuración Swagger / OpenAPI

El agente debe configurar FastAPI con los metadatos completos para que
el Swagger UI sea un artefacto de comunicación profesional, no solo
documentación automática.

```python
app = FastAPI(
    title="EVM Tracker API",
    description="""
API para gestión de proyectos con análisis de Valor Ganado (EVM).

Permite a los líderes de proyecto registrar actividades, ingresar datos de
avance y costo, y obtener en tiempo real los indicadores EVM calculados
automáticamente: PV, EV, CV, SV, CPI, SPI, EAC y VAC — tanto por actividad
como consolidados por proyecto.

## Indicadores EVM

| Indicador | Fórmula |
|-----------|---------|
| PV — Planned Value | % planificado × BAC |
| EV — Earned Value | % completado × BAC |
| CV — Cost Variance | EV − AC |
| SV — Schedule Variance | EV − PV |
| CPI — Cost Performance Index | EV / AC |
| SPI — Schedule Performance Index | EV / PV |
| EAC — Estimate at Completion | BAC / CPI |
| VAC — Variance at Completion | BAC − EAC |

Un **CPI > 1** indica eficiencia en costos (bajo presupuesto).
Un **SPI > 1** indica adelanto en cronograma.
    """,
    version="1.0.0",
    contact={
        "name": "EVM Tracker",
    },
    openapi_tags=[
        {
            "name": "projects",
            "description": "Gestión de proyectos y consulta de indicadores EVM consolidados.",
        },
        {
            "name": "activities",
            "description": "Gestión de actividades con indicadores EVM calculados en tiempo real.",
        },
    ]
)
```

Cada endpoint debe declarar su tag correspondiente:
```python
@router.get("/projects", tags=["projects"], summary="...", description="...")
```

---

## Contrato de tests de integración

Cada endpoint debe tener **al menos un test** que valide el contrato exacto
de su response. Los tests deben verificar:

1. El código HTTP correcto
2. La presencia de todos los campos obligatorios del schema
3. El tipo de dato de cada campo (no solo que exista)
4. Para endpoints EVM: que los valores calculados sean matemáticamente correctos
5. Para errores: que el código y el mensaje sean los esperados

Ejemplo de nivel de detalle requerido:
```python
def test_get_project_with_evm_returns_correct_indicators():
    # Crear proyecto con actividad conocida: BAC=10000, planned=50%, actual=30%, AC=4000
    # Verificar que la response contiene:
    assert response.status_code == 200
    evm = response.json()["activities"][0]["evm"]
    assert evm["planned_value"] == 5000.0
    assert evm["earned_value"] == 3000.0
    assert evm["cost_variance"] == -1000.0
    assert evm["cost_performance_index"] == 0.75
    summary = response.json()["evm_summary"]
    assert summary["cost_status"] == "sobre presupuesto"
    assert summary["schedule_status"] == "atrasado"
```