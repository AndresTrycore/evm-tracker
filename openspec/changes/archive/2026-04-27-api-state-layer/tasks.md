# Tasks: API Client & State Layer
> Change: `api-state-layer` · Status: Pending · v1.0

## Phase 1: Core Communication & Types
- [x] 1.1 Crear `frontend/src/types/index.ts` con interfaces para `Project`, `Activity`, `EVMIndicators` y `EVMSummary`.
- [x] 1.2 Implementar `frontend/src/lib/api-client.ts` con instancia de Axios e interceptor de errores (detail mapping).
- [x] 1.3 Configurar `frontend/src/services/projects.ts` con métodos `getProjects`, `getProjectDetail`, `createProject`, `deleteProject`.
- [x] 1.4 Configurar `frontend/src/services/activities.ts` con métodos `createActivity`, `updateActivity`, `deleteActivity`.

## Phase 2: Server State Infrastructure
- [x] 2.1 Crear `frontend/src/lib/query-client.ts` con la configuración global de TanStack Query (staleTime, retry, etc.).
- [x] 2.2 Crear `frontend/src/lib/query-keys.ts` centralizando las claves de caché como constantes/objetos.
- [x] 2.3 Modificar `frontend/src/main.tsx` para envolver la aplicación con `QueryClientProvider`.

## Phase 3: Smart Hooks (Queries)
- [x] 3.1 Implementar `frontend/src/hooks/useProjects.ts` consumiendo el servicio de listado.
- [x] 3.2 Implementar `frontend/src/hooks/useProject.ts` consumiendo el detalle con soporte para `enabled` y `placeholderData`.

## Phase 4: Smart Hooks (Mutations)
- [x] 4.1 Implementar `frontend/src/hooks/useCreateActivity.ts` con lógica de invalidación de `project.detail`.
- [x] 4.2 Implementar `frontend/src/hooks/useUpdateActivity.ts` y `frontend/src/hooks/useDeleteActivity.ts`.

## Phase 5: Verification
- [ ] 5.1 Verificar que las interfaces coinciden exactamente con la respuesta JSON del backend.
- [ ] 5.2 Verificar que el interceptor captura y formatea correctamente los errores 422 de FastAPI.
- [ ] 5.3 Validar que la mutación de actividades dispara el refetch automático del dashboard.
