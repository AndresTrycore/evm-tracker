# Tasks: CRUD & Interactions (Activity Table & Form)
> Change: `crud-interactions` · Status: Pending · v1.0

## Phase 1: Activity Table (Foundation)
- [x] 1.1 Crear `frontend/src/components/ActivityTable.tsx` con la estructura base de columnas.
- [x] 1.2 Implementar la **Barra Dual de Progreso** (Planificado vs Real) con los colores semánticos (`--health-green`, `--health-red`, etc.).
- [x] 1.3 Implementar estados de renderizado condicional: Skeletons (`isLoading`), Empty State y lista real.

## Phase 2: Activity Table (Interactivity)
- [x] 2.1 Añadir funcionalidad de ordenamiento por múltiples columnas, forzando los valores `null` al final de la lista.
- [x] 2.2 Implementar el input de búsqueda en tiempo real (filtrado case-insensitive).
- [x] 2.3 Añadir el tooltip interactivo por fila para mostrar EAC y VAC.
- [x] 2.4 Incorporar la columna de acciones (Editar, Eliminar).

## Phase 3: Activity Form (State & Foundation)
- [x] 3.1 Crear `frontend/src/components/ActivityForm.tsx` con el diseño de 2 columnas para campos.
- [x] 3.2 Implementar el doble modo de renderizado: Modal (si `activity === null`) y Panel lateral/Drawer (si `activity` existe).
- [x] 3.3 Inicializar el estado de los campos (`fields` como `string`) según el modo de creación o edición.

## Phase 4: Activity Form (Validation & API)
- [x] 4.1 Implementar la validación en tiempo real (`onBlur` -> `touched`) y estados de error visuales en los inputs.
- [x] 4.2 Integrar los hooks de TanStack Query (`useCreateActivity`, `useUpdateActivity`) para mutar los datos al guardar.
- [x] 4.3 Mostrar banner de error si la API falla y spinner inline cuando `isPending === true`.

## Phase 5: Dashboard Integration
- [x] 5.1 Actualizar `frontend/src/components/Dashboard.tsx` para importar `ActivityTable` y `ActivityForm`.
- [x] 5.2 Manejar el estado local en el Dashboard para abrir/cerrar el formulario y guardar el ID de la actividad en edición.
- [x] 5.3 Conectar la acción de borrado llamando a `useDeleteActivity` con un diálogo de confirmación `confirm()`.
