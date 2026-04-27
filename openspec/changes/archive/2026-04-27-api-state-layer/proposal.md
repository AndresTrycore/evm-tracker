# Proposal: API Client & State Layer
> Change: `api-state-layer` · Status: Draft · v1.0

## Intent
Implementar la infraestructura de comunicación y gestión de estado del servidor. Esto permitirá que el frontend consuma datos reales del backend de forma eficiente, con caché, reintentos automáticos y sincronización de estado tras mutaciones.

## Scope
- Configuración de instancia de Axios con interceptores de error.
- Definición de tipos de TypeScript basados en el backend.
- Configuración de TanStack Query v5.
- Implementación de hooks de query: `useProjects`, `useProject`.
- Implementación de hooks de mutación: `useCreateActivity`, `useUpdateActivity`, `useDeleteActivity`.

## Non-Goals
- Implementar la UI del Dashboard o Sidebar (Fase 8).
- Implementar formularios (Fase 10).

## Technical Approach
Utilizaremos **Axios** para las peticiones HTTP por su robustez con interceptores. **TanStack Query** será el orquestador del estado del servidor, eliminando la necesidad de un store global como Zustand para los datos de la API. Las query keys se centralizarán para evitar errores de invalidación.
