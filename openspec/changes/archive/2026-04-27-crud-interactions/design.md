# Design: CRUD & Interactions (Activity Table & Form)
> Change: `crud-interactions` · Stage: Design · v1.1

## Technical Approach
Implementar los componentes `ActivityTable` y `ActivityForm` respetando minuciosamente las reglas establecidas en `activity_table.md` y `activity_form.md`. Se integrarán como el corazón de interacción en el `Dashboard`.

## Architecture Decisions

### Decision: Activity Table Sorting & Filtering
**Choice**: Procesamiento en el cliente.
**Rationale**: Según la especificación, la búsqueda y el ordenamiento (incluyendo la lógica especial para valores `null` en CPI/SPI ubicados siempre al final) se realizarán localmente, ya que la API entrega todas las actividades al solicitar el proyecto.

### Decision: Form State & Conversion
**Choice**: Estado tipado como `string` temporal, parseo a `number` al enviar.
**Rationale**: Los inputs numéricos nativos en HTML/React pueden causar problemas de UX con valores intermedios (ej: cuando el usuario borra todo para escribir un nuevo número). Mantener el estado del formulario como `string` y convertir a payload de mutación (`ActivityCreate` / `ActivityUpdate`) al hacer submit.

### Decision: Dual Container Form
**Choice**: Un solo componente `ActivityForm` que cambia su envoltorio (Modal vs Drawer) según si la prop `activity` es `null` (creación) o un objeto (edición).
**Rationale**: Reduce la duplicación de lógica de validación. La tabla lanzará `onEdit(null)` para crear y `onEdit(actividad)` para editar. El Dashboard orquesta la visibilidad pasándole estas props al formulario.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/components/ActivityTable.tsx` | Create | Tabla con barra de progreso dual, sorting y búsqueda. |
| `frontend/src/components/ActivityForm.tsx` | Create | Formulario con validación en tiempo real. |
| `frontend/src/components/Dashboard.tsx` | Modify | Integrar la tabla y manejar los estados para abrir/cerrar el form. |

## Feature Specifications

### 1. Activity Table
- **Barra Dual de Progreso**: Un solo componente visual en la celda que superpone `actual_progress` sobre `planned_progress`. El color de la barra "actual" se mapea utilizando los thresholds de salud: `--health-green` si `actual >= planned`, `--health-red` si `< 70%`, etc.
- **Row Tooltip**: Oculta el exceso de columnas (EAC y VAC) dentro de un tooltip de fila. VAC tendrá color condicional (Rojo si negativo).
- **Columnas**: ACTIVIDAD, PROGRESO, CPI, SPI, BAC, AC y Acciones.

### 2. Activity Form
- **Validación en Tiempo Real**: Activada por campo después de un `onBlur` inicial (`touched`).
- **Estados de Error**: UI específica para errores (borde rojo, texto en caption rojo). También soporta un banner global de error devuelto por la API.
- **Formateo**: Contadores de caracteres (hasta 200 en `name`) y campos numéricos listos para el parseo.

## Data Flow
```
[Dashboard] ──(activities)──→ [ActivityTable] ──(onEdit/onDelete)──┐
      │                                                            │
      └─────────(open Form with activity data or null)─────────────┘
      │                                                            │
      └──────────────────────[ActivityForm] ──(mutate)──→ [TanStack Query]
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Validation Logic | Verificar que `touched` activa correctamente los errores. |
| Unit | Sorting | Asegurar que `null` en CPI o SPI siempre se ordena al final. |
| Integration | Mutations | Verificar que guardar en el form invalida `['projects', projectId]` y actualiza la UI. |

## Migration / Rollout
Reemplazará los placeholders estáticos actuales en el `Dashboard.tsx`.
