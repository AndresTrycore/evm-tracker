# Design: App Shell & Dashboard Layout
> Change: `app-shell-layout` · Stage: Design · v1.0

## Technical Approach
La aplicación se dividirá en tres áreas principales: un **Sidebar** fijo (colapsable en móvil), un **Header** superior con efecto de glassmorphism y un **Área de Contenido** fluida. El estado del proyecto seleccionado se persistirá en `localStorage` para mantener la sesión del usuario entre recargas.

## Architecture Decisions

### Decision: Layout Orchestration
**Choice**: Global State en `App.tsx` + Prop Drilling (ligero)
**Alternatives considered**: Context API para el proyecto seleccionado.
**Rationale**: Por ahora, el proyecto seleccionado solo lo necesitan el Sidebar y el Dashboard. El prop drilling es explícito y evita la sobrecarga de un Context para un solo valor. Si crece, se moverá a un Store de Zustand.

### Decision: Mobile Navigation
**Choice**: Slide-over Drawer (Menú Hamburguesa)
**Alternatives considered**: Tab Bar inferior.
**Rationale**: El Sidebar contiene una lista de proyectos que puede ser larga y tener búsqueda; un Drawer ofrece el espacio necesario para estas interacciones en móviles.

### Decision: UI Feedback
**Choice**: Shimmer Skeletons
**Alternatives considered**: Spinners clásicos.
**Rationale**: Los Skeletons reducen la carga cognitiva al previsualizar la estructura del dashboard antes de que lleguen los datos del backend.

## Data Flow
```
[Sidebar] ──(onSelect)──┐
                        ▼
[App.tsx] ──(State: selectedProjectId)──┐
                        │               ▼
                        └─────────→ [Dashboard] ──(useProject)──→ [UI Components]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/App.tsx` | Modify | Orquestador principal. |
| `frontend/src/components/Sidebar.tsx` | Create | Lista de proyectos, búsqueda y botón "Nuevo". |
| `frontend/src/components/Header.tsx` | Create | Título del proyecto, acciones y tema. |
| `frontend/src/components/Dashboard.tsx` | Create | Contenedor de KPIs, Gráficas y Tabla. |
| `frontend/src/components/ui/Skeleton.tsx` | Create | Utilidad base para efectos de carga. |
| `frontend/src/components/ui/EmptyState.tsx` | Create | Vista para cuando no hay datos. |

## Interfaces / Contracts

### Sidebar Props
```ts
interface SidebarProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  projects: Project[];
  isLoading: boolean;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Visual | Responsive Sidebar | Verificar que el sidebar se oculte en mobile y aparezca el botón hamburguesa. |
| Logic | Project Selection | Verificar que al hacer click en el sidebar, los KPIs del Dashboard cambien a estado "Loading". |
| UI | Theme Persistence | Confirmar que el tema se mantiene tras el refactor. |

## Migration / Rollout
No migration required. Mejora iterativa de la Phase 6.

## Open Questions
- [ ] ¿Añadiremos un breadcrumb en el header? Por ahora el nombre del proyecto es suficiente.
