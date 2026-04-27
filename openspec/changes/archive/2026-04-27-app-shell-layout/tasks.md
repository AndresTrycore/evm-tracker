# Tasks: App Shell & Dashboard Layout
> Change: `app-shell-layout` · Status: Pending · v1.0

## Phase 1: UI Base Components
- [x] 1.1 Crear `frontend/src/components/ui/Skeleton.tsx` con animaciones de shimmer para estados de carga.
- [x] 1.2 Crear `frontend/src/components/ui/EmptyState.tsx` para vistas sin proyectos seleccionados o datos vacíos.

## Phase 2: Navigation Components
- [x] 2.1 Implementar `frontend/src/components/Sidebar.tsx` con soporte para:
    - Lista de proyectos real (consumiendo props).
    - Input de búsqueda local.
    - Menú responsivo (hamburguesa para mobile).
    - Estado activo/inactivo de items.
- [x] 2.2 Implementar `frontend/src/components/Header.tsx` con soporte para:
    - Nombre del proyecto actual (o "Dashboard").
    - Toggle de tema funcional.
    - Estilos de Glassmorphism.

## Phase 3: Dashboard Container
- [x] 3.1 Implementar `frontend/src/components/Dashboard.tsx` que orqueste:
    - Estados de carga (Skeletons de KPIs y Tablas).
    - Renderizado condicional según si hay un `projectId` activo.
    - Contenedores para las futuras gráficas y tablas.

## Phase 4: Shell Refactor & Integration
- [x] 4.1 Refactorizar `frontend/src/App.tsx` para:
    - Manejar el estado `selectedProjectId` con persistencia en `localStorage`.
    - Integrar `Sidebar`, `Header` y `Dashboard`.
    - Implementar el toggle del menú móvil.

## Phase 5: Verification
- [ ] 5.1 Verificar responsividad en móvil (menú drawer).
- [ ] 5.2 Verificar que el cambio de proyecto muestra skeletons antes de los datos.
- [ ] 5.3 Validar que el tema persiste tras el refactor.
