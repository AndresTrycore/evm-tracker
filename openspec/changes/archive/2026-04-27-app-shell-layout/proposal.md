# Proposal: App Shell & Dashboard Layout
> Change: `app-shell-layout` · Status: Draft · v1.0

## Intent
Implementar la estructura visual definitiva de la aplicación, transformando el prototipo de Phase 6 en una interfaz funcional y responsiva. Esto incluye el Sidebar inteligente, el Header de navegación y el contenedor principal del Dashboard con soporte para estados de carga.

## Scope
- Refactorización de `App.tsx` para usar componentes especializados.
- Implementación del `Sidebar` con búsqueda y selección de proyectos.
- Implementación del `Header` con el nombre del proyecto activo y toggle de tema.
- Creación del componente `Dashboard` como contenedor de la visualización de datos.
- Implementación de `Skeletons` para estados de carga suaves.
- Manejo del "Empty State" cuando no hay proyectos o no hay uno seleccionado.

## Non-Goals
- Implementar las gráficas reales (Fase 9).
- Implementar la tabla de actividades real (Fase 11).

## Technical Approach
Utilizaremos un patrón de **Container-Presentational** a nivel de página. `App.tsx` mantendrá el estado `selectedProjectId`. El `Sidebar` permitirá cambiar este ID y el `Dashboard` lo usará para disparar el hook `useProject`. Se aplicarán clases de Tailwind para el diseño de "UI Elevada" (sombras, bordes suaves y glassmorphism en el header).
