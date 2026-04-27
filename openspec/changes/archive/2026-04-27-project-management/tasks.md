# Tasks: Project Management & Shell Polish
> Change: `project-management` · Status: Pending · v1.0

## Phase 1: API Hooks
- [x] 1.1 Crear `frontend/src/hooks/useCreateProject.ts`.
- [x] 1.2 Crear `frontend/src/hooks/useDeleteProject.ts`.

## Phase 2: Project Creation UI
- [x] 2.1 Crear `frontend/src/components/ProjectModal.tsx` con campos `name` y `description`.
- [x] 2.2 Implementar validación básica de cliente (nombre obligatorio).
- [x] 2.3 Aplicar estilos de **UI Elevada** y transiciones de entrada/salida.

## Phase 3: Sidebar Enhancements
- [x] 3.1 Implementar la lógica de búsqueda (filtrado de la lista `projects`).
- [x] 3.2 Asegurar que el icono de eliminar (`Trash2`) solo sea visible al hacer hover sobre el item del proyecto.
- [x] 3.3 Conectar los eventos `onNewProject` y `onDeleteProject` a los callbacks del componente.

## Phase 4: App Orchestration
- [x] 4.1 Actualizar `frontend/src/App.tsx` para integrar los hooks de mutación.
- [x] 4.2 Reemplazar los `alert()` placeholders por llamadas reales.
- [x] 4.3 Manejar la lógica de navegación post-borrado (resetear selección si el proyecto activo muere).
