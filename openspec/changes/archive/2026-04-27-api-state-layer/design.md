# Design: API Client & State Layer
> Change: `api-state-layer` · Stage: Design · v1.0

## Technical Approach
La arquitectura se basa en una separación clara entre **definición de datos (tipos)**, **comunicación (servicios)** y **sincronización de estado (hooks)**. TanStack Query actuará como la única fuente de verdad para los datos del servidor, utilizando un sistema de invalidación basado en claves jerárquicas para asegurar que la UI siempre refleje el estado más reciente tras cualquier cambio.

## Architecture Decisions

### Decision: API Integration Pattern
**Choice**: Axios Instance + Stateless Services
**Alternatives considered**: Fetch API (menos robusto para interceptores), Hooks con `useEffect` (difícil de mantener y cachear).
**Rationale**: Axios permite centralizar la lógica de errores y la inyección de `VITE_API_URL`. Los servicios serán funciones puras que retornan promesas, facilitando su testeo.

### Decision: Server State Management
**Choice**: TanStack Query v5
**Alternatives considered**: Redux/Toolkit (demasiado boilerplate), Zustand (requeriría lógica manual de caché/refetch).
**Rationale**: La aplicación es intensiva en datos del servidor. TanStack Query automatiza el manejo de skeletons, reintentos y la invalidación reactiva del Dashboard cuando se modifican actividades.

### Decision: Type Integrity
**Choice**: Shared TypeScript Interfaces + Zod (opcional en puntos críticos)
**Alternatives considered**: `any` o tipos implícitos.
**Rationale**: Se requiere paridad total con los modelos de FastAPI para evitar errores de redondeo o campos faltantes en el frontend.

## Data Flow
El flujo sigue el patrón de "Smart Hooks":

```
[Component] ──(useQuery)──→ [Custom Hook] ──(Service)──→ [Axios Instance] ──→ [Backend]
     │                           │
     └──────(Render data) <──────┘ (Cache/Stale Logic)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/types/index.ts` | Create | Interfaces compartidas de Proyectos y EVM. |
| `frontend/src/lib/api-client.ts` | Create | Instancia de Axios e interceptores. |
| `frontend/src/lib/query-client.ts` | Create | Configuración global de TanStack Query. |
| `frontend/src/lib/query-keys.ts` | Create | Centralización de claves de caché. |
| `frontend/src/services/projects.ts` | Create | Llamadas a endpoints de proyectos. |
| `frontend/src/services/activities.ts` | Create | Llamadas a endpoints de actividades. |
| `frontend/src/hooks/useProjects.ts` | Create | Hook para la lista del sidebar. |
| `frontend/src/hooks/useProject.ts` | Create | Hook para el dashboard (EVM Summary). |
| `frontend/src/hooks/useCreateActivity.ts` | Create | Mutación + Invalidación de caché. |
| `frontend/src/main.tsx` | Modify | Inyección del `QueryClientProvider`. |

## Interfaces / Contracts

### EVM Indicators Contract
```ts
export interface EVMIndicators {
  planned_value: number;
  earned_value: number;
  cost_performance_index: number | null;
  schedule_performance_index: number | null;
  // ... rest from api_client.md
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration | Hook `useProject` | Mockear API con MSW y verificar que retorna datos EVM. |
| Integration | Mutación `useCreateActivity` | Verificar que dispara la invalidación de la query del proyecto. |
| Unit | Axios Interceptor | Verificar que transforma errores 422 de FastAPI correctamente. |

## Migration / Rollout
No migration required. Se integra sobre la Phase 6.

## Open Questions
- [ ] ¿Añadiremos `react-query-devtools` en desarrollo? Se recomienda para debuggear el flujo de invalidación.
