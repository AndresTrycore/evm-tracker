# Business Rules & EVM Logic

> **Versión:** 2.0.0 | **Última actualización:** 2026-04-26  
> **Aplicable a:** EVM Dashboard — Trycore Colombia Technical Challenge  
> **Autoridad:** Este documento es la fuente de verdad para toda la lógica de dominio.  
> Cualquier discrepancia entre este documento y el código se resuelve a favor de este documento.

---

## Tabla de contenidos

1. [Objetivo del sistema](#1-objetivo-del-sistema)
2. [Glosario de términos EVM](#2-glosario-de-términos-evm)
3. [Entidades del dominio](#3-entidades-del-dominio)
4. [Lógica de cálculo EVM](#4-lógica-de-cálculo-evm)
5. [Casos borde — manejo obligatorio](#5-casos-borde--manejo-obligatorio)
6. [Indicadores consolidados por proyecto](#6-indicadores-consolidados-por-proyecto)
7. [Interpretación de índices](#7-interpretación-de-índices)
8. [Clasificación de salud del proyecto](#8-clasificación-de-salud-del-proyecto)
9. [Invariantes del sistema](#9-invariantes-del-sistema)

---

## 1. Objetivo del sistema

Herramienta interna para que los líderes de proyecto registren el avance de sus actividades y analicen en tiempo real el desempeño en cronograma y presupuesto usando la metodología de Valor Ganado (EVM — Earned Value Management, estándar PMI PMBOK 7ª edición).

**El sistema responde a tres preguntas fundamentales:**

| Pregunta | Indicador clave |
|----------|----------------|
| ¿Estamos gastando lo correcto por el trabajo realizado? | CPI |
| ¿Estamos avanzando al ritmo planificado? | SPI |
| ¿Cuánto costará el proyecto al finalizar con el ritmo actual? | EAC |

**Lo que el sistema NO hace:**
- No predice fechas de finalización (out of scope v1.0).
- No gestiona recursos ni asignación de personas.
- No reemplaza un sistema de gestión de proyectos completo (Jira, Asana, MS Project).
- No almacena historial de indicadores a lo largo del tiempo (los indicadores son siempre del momento actual).

---

## 2. Glosario de términos EVM

Definiciones canónicas según el estándar PMI. Toda la base de código debe usar estos términos exactos en variables, funciones y documentación.

| Término | Abreviatura | Definición |
|---------|-------------|------------|
| Budget at Completion | BAC | Presupuesto total aprobado para una actividad o proyecto |
| Planned Value | PV | Valor monetario del trabajo que *debería* haberse completado según el plan |
| Earned Value | EV | Valor monetario del trabajo que *realmente* se ha completado |
| Actual Cost | AC | Costo real incurrido por el trabajo completado hasta la fecha |
| Cost Variance | CV | Diferencia entre el valor ganado y el costo real (positivo = ahorro) |
| Schedule Variance | SV | Diferencia entre el valor ganado y el valor planificado (positivo = adelanto) |
| Cost Performance Index | CPI | Eficiencia de costo: cuánto valor se genera por cada unidad monetaria gastada |
| Schedule Performance Index | SPI | Eficiencia de cronograma: qué fracción del trabajo planificado se está completando |
| Estimate at Completion | EAC | Proyección del costo total final si el rendimiento actual continúa |
| Variance at Completion | VAC | Diferencia entre el presupuesto original y el costo proyectado al finalizar |
| Planned Progress | — | Porcentaje de avance planificado a la fecha de corte (escala 0–100) |
| Actual Progress | — | Porcentaje de avance realmente completado (escala 0–100) |

---

## 3. Entidades del dominio

### 3.1 Proyecto (`Project`)

Un proyecto es el contenedor lógico que agrupa actividades relacionadas y sobre el que se calculan los indicadores EVM consolidados.

**Atributos:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `id` | UUID v4 | Sí (generado) | Identificador único inmutable |
| `name` | string | Sí | Nombre descriptivo del proyecto |
| `description` | string | No | Descripción opcional del alcance |
| `created_at` | datetime UTC | Sí (generado) | Timestamp de creación |
| `updated_at` | datetime UTC | Sí (auto) | Timestamp de última modificación |

**Reglas de negocio:**

- BR-P01: El nombre no puede ser vacío ni contener solo espacios en blanco.
- BR-P02: El nombre tiene un máximo de 200 caracteres.
- BR-P03: La descripción tiene un máximo de 1000 caracteres.
- BR-P04: Eliminar un proyecto elimina en cascada **todas** sus actividades, sin excepción y sin posibilidad de recuperación.
- BR-P05: Un proyecto con cero actividades es un estado válido. Sus indicadores EVM consolidados retornan `0.0` (no `None`, no error).
- BR-P06: El `id` es asignado por el sistema en la creación y nunca puede modificarse.
- BR-P07: `created_at` y `updated_at` son asignados por el sistema; el cliente nunca los envía.

### 3.2 Actividad (`Activity`)

Una actividad representa una tarea discreta dentro de un proyecto, con presupuesto propio y seguimiento de avance planificado vs. real.

**Atributos:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `id` | UUID v4 | Sí (generado) | Identificador único inmutable |
| `project_id` | UUID v4 | Sí | FK al proyecto contenedor |
| `name` | string | Sí | Nombre descriptivo de la actividad |
| `budget_at_completion` | decimal(15,2) | Sí | Presupuesto total planificado (BAC) |
| `planned_progress` | decimal(5,2) | Sí | % avance planificado a la fecha de corte (0–100) |
| `actual_progress` | decimal(5,2) | Sí | % avance realmente completado (0–100) |
| `actual_cost` | decimal(15,2) | Sí | Costo real incurrido hasta la fecha (AC) |
| `created_at` | datetime UTC | Sí (generado) | Timestamp de creación |
| `updated_at` | datetime UTC | Sí (auto) | Timestamp de última modificación |

**Reglas de negocio:**

- BR-A01: Una actividad pertenece a **exactamente un** proyecto. No puede existir sin proyecto.
- BR-A02: El nombre no puede ser vacío; máximo 200 caracteres.
- BR-A03: `budget_at_completion` debe ser `≥ 0`. No se permiten presupuestos negativos.
- BR-A04: `actual_cost` debe ser `≥ 0`. No se permiten costos negativos.
- BR-A05: `planned_progress` debe estar en el rango `[0.0, 100.0]` inclusive.
- BR-A06: `actual_progress` debe estar en el rango `[0.0, 100.0]` inclusive.
- BR-A07: Los porcentajes fuera de rango se **rechazan con error de validación 422**. Nunca se truncan ni redondean silenciosamente.
- BR-A08: Los porcentajes se expresan en escala **0–100**, no en escala 0–1. Un valor de `50.0` representa el 50%. El sistema nunca acepta `0.5` como representación del 50%.
- BR-A09: `actual_cost` puede ser mayor que `budget_at_completion` (sobrecosto). Esto es un estado válido que el sistema debe reportar, no rechazar.
- BR-A10: `actual_progress` puede ser mayor que `planned_progress` (adelanto). Estado válido.

---

## 4. Lógica de cálculo EVM

### 4.1 Principio fundamental

Los indicadores EVM **nunca se persisten en base de datos**. Se calculan en tiempo real a partir de los datos almacenados de cada actividad en cada request. No existe caché de indicadores.

### 4.2 Conversión de porcentajes

Los porcentajes almacenados en escala 0–100 se convierten a factor decimal (0.0–1.0) **únicamente dentro del calculador**, en el momento del cálculo. Esta conversión nunca ocurre en la capa de persistencia ni en los controladores.

```
factor_planificado = planned_progress / 100.0
factor_completado  = actual_progress  / 100.0
```

### 4.3 Fórmulas — orden de cálculo obligatorio

El orden importa: cada indicador depende del anterior. Calcular fuera de orden produce resultados incorrectos.

```
Paso 1:  PV  = factor_planificado × BAC
Paso 2:  EV  = factor_completado  × BAC
Paso 3:  CV  = EV − AC
Paso 4:  SV  = EV − PV
Paso 5:  CPI = EV / AC               → aplicar regla de caso borde §5
Paso 6:  SPI = EV / PV               → aplicar regla de caso borde §5
Paso 7:  EAC = BAC / CPI             → aplicar regla de caso borde §5
Paso 8:  VAC = BAC − EAC             → aplicar regla de caso borde §5
```

### 4.4 Precisión numérica

- Todos los cálculos internos usan punto flotante de 64 bits (`float`).
- Los resultados se redondean a **4 decimales** antes de ser retornados en la respuesta.
- La tolerancia para comparar un índice con `1.0` es `±0.001` (ver §7).
- Nunca se redondea en medio del cálculo; solo al producir la respuesta final.

---

## 5. Casos borde — manejo obligatorio

**Principio:** Nunca lanzar una excepción por división por cero. Retornar `None` para el indicador afectado y continuar calculando el resto de indicadores que sí se pueden calcular.

### 5.1 Tabla de casos borde por actividad

| Condición de entrada | Indicadores afectados | Valor a retornar | Indicadores que SÍ se calculan |
|---------------------|-----------------------|-----------------|-------------------------------|
| `actual_cost == 0` | CPI, EAC, VAC | `None` | PV, EV, CV, SV, SPI |
| `planned_value == 0` (PV=0) | SPI | `None` | PV, EV, CV, SV, CPI, EAC, VAC |
| `CPI == 0` (EV=0 y AC>0) | EAC, VAC | `None` | PV, EV, CV, SV, CPI, SPI |
| `actual_progress == 0` | — (ninguno) | EV=0, CV=−AC, SV=−PV | Todos se calculan normalmente |
| `budget_at_completion == 0` | — (ninguno) | PV=0, EV=0 | Todos se calculan normalmente |
| `planned_progress == 0` | — (ninguno) | PV=0, SV=EV | Todos se calculan normalmente |
| `actual_progress == 100` | — (ninguno) | EV=BAC | Todos se calculan normalmente |

### 5.2 Lógica de protección ante división por cero

```python
# Pseudocódigo — implementación de referencia

def safe_divide(numerator: float, denominator: float) -> float | None:
    if denominator == 0.0:
        return None
    return numerator / denominator

CPI = safe_divide(EV, AC)
SPI = safe_divide(EV, PV)
EAC = safe_divide(BAC, CPI) if CPI is not None else None
VAC = (BAC - EAC)           if EAC is not None else None
```

### 5.3 Propagación de `None`

Si un indicador intermedio es `None`, todos los indicadores que dependen de él también son `None`. La cadena de dependencia es:

```
AC=0 → CPI=None → EAC=None → VAC=None
PV=0 → SPI=None
CPI=0 → EAC=None → VAC=None
```

### 5.4 Representación de `None` en la API

En la respuesta JSON, `None` se serializa como `null`. El cliente nunca recibe el string `"null"`, ni cero, ni un valor omitido — siempre recibe el campo con valor `null` explícito.

```json
{
  "cpi": null,
  "eac": null,
  "vac": null,
  "spi": 0.8333,
  "cost_status": "sin datos",
  "schedule_status": "atrasado"
}
```

---

## 6. Indicadores consolidados por proyecto

### 6.1 Principio de consolidación

Los índices consolidados se calculan sobre las **sumas totales** de todas las actividades del proyecto. **Nunca** como promedio aritmético de los índices individuales.

**Justificación:** El promedio de CPIs individuales no es matemáticamente equivalente al CPI real del proyecto cuando las actividades tienen presupuestos distintos. La suma total es la única forma correcta según el estándar PMI.

### 6.2 Fórmulas de consolidación

```
total_BAC = Σ activity.budget_at_completion   para toda actividad del proyecto
total_PV  = Σ activity.planned_value          (PV ya calculado por actividad)
total_EV  = Σ activity.earned_value           (EV ya calculado por actividad)
total_AC  = Σ activity.actual_cost

CV_proyecto  = total_EV − total_AC
SV_proyecto  = total_EV − total_PV

CPI_proyecto = total_EV / total_AC     si total_AC > 0,            sino None
SPI_proyecto = total_EV / total_PV     si total_PV > 0,            sino None
EAC_proyecto = total_BAC / CPI_proyecto si CPI ≠ None y CPI ≠ 0,   sino None
VAC_proyecto = total_BAC − EAC_proyecto si EAC ≠ None,             sino None
```

### 6.3 Proyecto sin actividades

Cuando un proyecto no tiene actividades, **todos** los indicadores consolidados retornan `0.0` (no `None`). Esta distinción es intencional: `None` significa "no calculable por datos insuficientes"; `0.0` significa "no hay trabajo registrado".

```json
{
  "total_bac": 0.0,
  "total_pv":  0.0,
  "total_ev":  0.0,
  "total_ac":  0.0,
  "cv":  0.0,
  "sv":  0.0,
  "cpi": 0.0,
  "spi": 0.0,
  "eac": 0.0,
  "vac": 0.0,
  "cost_status":     "sin datos",
  "schedule_status": "sin datos"
}
```

---

## 7. Interpretación de índices

El sistema retorna una interpretación textual junto a cada valor numérico. El objetivo es que el líder de proyecto entienda el estado sin necesitar conocer EVM.

### 7.1 Tolerancia de comparación con 1.0

Para evitar errores de punto flotante, se usa una tolerancia de `±0.001` al comparar índices con `1.0`.

```python
TOLERANCE = 0.001

def is_on_target(index: float) -> bool:
    return abs(index - 1.0) <= TOLERANCE
```

Ejemplos de aplicación:
- CPI = `1.0000001` → `"en presupuesto"` (dentro de tolerancia)
- CPI = `1.0011` → `"bajo presupuesto"` (fuera de tolerancia, > 1)
- CPI = `0.9989` → `"sobre presupuesto"` (fuera de tolerancia, < 1)

### 7.2 CPI → `cost_status`

| Condición | `cost_status` retornado | Interpretación para el usuario |
|-----------|------------------------|-------------------------------|
| `CPI is None` | `"sin datos"` | No hay costo real registrado aún |
| `CPI > 1.0 + tolerance` | `"bajo presupuesto"` | Se genera más valor del esperado por cada peso gastado |
| `abs(CPI - 1.0) ≤ tolerance` | `"en presupuesto"` | El gasto está alineado con el avance |
| `CPI < 1.0 - tolerance` | `"sobre presupuesto"` | Se gasta más de lo que se avanza — señal de alerta |

### 7.3 SPI → `schedule_status`

| Condición | `schedule_status` retornado | Interpretación para el usuario |
|-----------|----------------------------|-------------------------------|
| `SPI is None` | `"sin datos"` | No hay avance planificado registrado aún |
| `SPI > 1.0 + tolerance` | `"adelantado"` | Se avanza más rápido de lo planificado |
| `abs(SPI - 1.0) ≤ tolerance` | `"en cronograma"` | El ritmo de avance está según el plan |
| `SPI < 1.0 - tolerance` | `"atrasado"` | Se avanza más lento de lo planificado — señal de alerta |

### 7.4 Aplicación a nivel de actividad y de proyecto

La interpretación aplica tanto a los indicadores por actividad individual como a los indicadores consolidados del proyecto. La lógica de interpretación es **idéntica** en ambos casos — no se duplica el código; se reutiliza la misma función.

---

## 8. Clasificación de salud del proyecto

Para el dashboard, el sistema debe derivar una clasificación general del estado del proyecto combinando CPI y SPI.

### 8.1 Matriz de clasificación

| CPI | SPI | Estado general | Color sugerido |
|-----|-----|---------------|----------------|
| `"bajo presupuesto"` | `"adelantado"` | `"óptimo"` | Verde oscuro |
| `"bajo presupuesto"` | `"en cronograma"` | `"bien"` | Verde |
| `"bajo presupuesto"` | `"atrasado"` | `"alerta cronograma"` | Amarillo |
| `"en presupuesto"` | `"adelantado"` | `"bien"` | Verde |
| `"en presupuesto"` | `"en cronograma"` | `"en control"` | Verde claro |
| `"en presupuesto"` | `"atrasado"` | `"alerta cronograma"` | Amarillo |
| `"sobre presupuesto"` | `"adelantado"` | `"alerta costo"` | Naranja |
| `"sobre presupuesto"` | `"en cronograma"` | `"alerta costo"` | Naranja |
| `"sobre presupuesto"` | `"atrasado"` | `"crítico"` | Rojo |
| Cualquiera `"sin datos"` | Cualquiera | `"sin datos"` | Gris |

### 8.2 Regla de precedencia

Si cualquiera de los dos estados es `"sin datos"`, el estado general es siempre `"sin datos"`, independientemente del otro índice.

---

## 9. Invariantes del sistema

Condiciones que deben ser verdaderas en **todo momento**, independientemente de la capa técnica que las implemente. Ninguna operación puede violarlas.

| ID | Invariante |
|----|-----------|
| INV-01 | Una actividad siempre pertenece a exactamente un proyecto. No pueden existir actividades huérfanas. |
| INV-02 | Eliminar un proyecto elimina en cascada todas sus actividades. La operación es atómica. |
| INV-03 | Los indicadores EVM nunca se almacenan. Siempre se calculan en tiempo real desde los datos crudos. |
| INV-04 | El resumen EVM de un proyecto refleja el estado de **todas** sus actividades en el momento del request. No hay caché. |
| INV-05 | Un índice no calculable por división por cero se representa como `null` en la respuesta. Nunca como `0`, ni como error HTTP. |
| INV-06 | Los porcentajes se almacenan en escala 0–100 y se convierten a 0.0–1.0 solo dentro del calculador EVM. |
| INV-07 | Los índices consolidados del proyecto se calculan sobre sumas totales, nunca como promedio de índices individuales. |
| INV-08 | Un proyecto sin actividades retorna indicadores consolidados en `0.0`, no `null` ni error. |
| INV-09 | Las operaciones de escritura (create, update, delete) son atómicas. Una falla parcial no deja el sistema en estado inconsistente. |
| INV-10 | `created_at` y `updated_at` son siempre UTC. El sistema nunca almacena ni retorna timestamps sin zona horaria. |

---

*Este documento reemplaza cualquier versión anterior de `business_rules.md`. Toda implementación debe alinearse con las reglas aquí definidas. Las desviaciones intencionales deben documentarse en `AI_PROCESS.md` con justificación técnica.*