# Proposal: Project Management & Shell Polish
> Change: `project-management` · Status: Draft · v1.0

## Intent
Completar el ciclo de vida del recurso principal: el **Proyecto**. Actualmente el frontend permite visualizar proyectos pero no crearlos ni eliminarlos (mostrando alertas de "en construcción"). Esta fase habilitará la gestión integral de proyectos desde el Sidebar y pulirá los puntos ciegos de la navegación global.

## Scope
- Implementación de los hooks de mutación `useCreateProject` y `useDeleteProject` (TanStack Query).
- Creación del componente `ProjectModal` para la captura de nombre y descripción del nuevo proyecto.
- Conexión de las acciones del `Sidebar` para disparar la creación y eliminación real.
- Limpieza de `App.tsx` eliminando los placeholders de alerta.
- Manejo de redirección automática al crear un nuevo proyecto.

## Non-Goals
- Edición de proyectos (el diseño actual prioriza creación y eliminación; la edición se delega a una fase futura si se requiere).
- Simulación de Monte Carlo (Fase 12 del roadmap original) — se mantiene como placeholder.

## Technical Approach
Seguiremos el patrón de mutaciones de TanStack Query para invalidar la query `['projects']` tras cada operación. El `ProjectModal` utilizará el estilo de **UI Elevada** (Glassmorphism + Backdrop Blur) definido en los estándares visuales. La eliminación requerirá una confirmación explícita para evitar pérdida accidental de datos.
