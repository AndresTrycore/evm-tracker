# Design: Project Management & Shell Polish
> Change: `project-management` · Stage: Design · v1.0

## Technical Approach
Implementar una capa de gestión de proyectos que se integre de forma natural en el `Sidebar`. Utilizaremos mutaciones asíncronas para garantizar que la lista de proyectos esté siempre sincronizada con el backend.

## Architecture Decisions

### Decision: Dedicated ProjectModal for Creation
**Choice**: Crear `frontend/src/components/ProjectModal.tsx`.
**Rationale**: Mantener `App.tsx` limpio de lógica de formularios. El modal se encargará de validar el nombre del proyecto y enviar la descripción opcional al backend.

### Decision: Sidebar-Driven Deletion
**Choice**: El `Sidebar` emitirá el evento `onDelete`, y el padre (`App.tsx`) ejecutará la mutación.
**Rationale**: Centralizar la lógica de estado global (qué proyecto está seleccionado) en `App.tsx` facilita la redirección: si se elimina el proyecto actualmente seleccionado, el estado debe volver a `null`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/hooks/useCreateProject.ts` | Create | Mutación para `POST /projects`. |
| `frontend/src/hooks/useDeleteProject.ts` | Create | Mutación para `DELETE /projects/{id}`. |
| `frontend/src/components/ProjectModal.tsx` | Create | Modal esmerilado para creación de proyectos. |
| `frontend/src/components/Sidebar.tsx` | Modify | Implementar búsqueda real y visibilidad del botón borrar al hover. |
| `frontend/src/App.tsx` | Modify | Conectar hooks de mutación y orquestar el flujo de selección post-creación. |

## Feature Specifications

### 1. Project Creation Flow
1. Usuario clickea "+ Nuevo Proyecto" en Sidebar.
2. Abre `ProjectModal`.
3. Al guardar con éxito:
   - Invalidar `['projects']`.
   - Seleccionar automáticamente el ID del nuevo proyecto.
   - Cerrar modal.

### 2. Project Deletion Flow
1. Usuario clickea "Trash" en un item del Sidebar (visible en hover).
2. `window.confirm` solicita verificación.
3. Al borrar con éxito:
   - Si el proyecto borrado era el activo, setear `selectedProjectId = null`.
   - Invalidar `['projects']`.

## Data Flow
```
[Sidebar] --(click create)--> [ProjectModal] --(mutate)--> [Backend API]
                                    |
                                    └--onSuccess--> [App] (setSelectedId)
```
