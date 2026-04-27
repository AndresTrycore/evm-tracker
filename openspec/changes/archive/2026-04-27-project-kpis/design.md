# Design: Advanced BI (Project KPIs & Health Badge)
> Change: `project-kpis` · Stage: Design · v1.1

## Technical Approach
Desarrollar componentes altamente modulares enfocados en la representación clara e inequívoca del estado del proyecto. Se priorizará el rendimiento y la limpieza visual utilizando CSS puro para las interacciones secundarias (tooltips) y conservando el estado de expansión de UI a nivel de cliente (`localStorage`).

## Architecture Decisions

### Decision: CSS-Only Tooltips for HealthBadge
**Choice**: Usar las clases `group` y `group-hover` de Tailwind para el tooltip del `HealthBadge`.
**Rationale**: `HealthBadge` es un átomo que puede ser instanciado múltiples veces (en la cabecera y potencialmente en listas largas). Usar librerías de JS para tooltips en átomos afecta el rendimiento y llena el árbol de React. Tailwind provee un mecanismo nativo, robusto y liviano.

### Decision: State Persistence for Diagnostic Panel
**Choice**: `localStorage` para el toggle `isDetailOpen`.
**Rationale**: Cuando el gerente activa el panel de diagnóstico detallado (VAC, CV, SV, etc.), es probable que desee seguir viéndolo tras recargar o al cambiar de proyecto. Proveer esta persistencia mejora la experiencia de usuario significativamente.

### Decision: Mini-Trend Mocking (Temporary)
**Choice**: Inyectar un sparkline sintético lineal o estático en el `AreaChart` de CPI/SPI.
**Rationale**: Actualmente `EVMSummary` expone los índices actuales pero no una serie de tiempo (`history`). Para cumplir con el diseño, se insertará un array simulado (ej. `[cpi, cpi]`) que genere una línea plana visualmente armónica en el color semántico correspondiente, preparada para ser conectada cuando la API expanda el modelo.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/components/ui/HealthBadge.tsx` | Create | Átomo visual de semáforo con tooltips CSS. |
| `frontend/src/components/ProjectKPIs.tsx` | Create | Organismo principal que consolida las métricas. |
| `frontend/src/components/Dashboard.tsx` | Modify | Reemplazar los placeholders superiores por `<ProjectKPIs evm={project.evm_summary} />`. |

## Feature Specifications

### 1. HealthBadge
- **Propiedad `status`**: Mapea a Verde (`'bajo presupuesto'`, `'adelantado'`), Rojo (`'sobre presupuesto'`, `'atrasado'`) o Gris (`'sin datos'`).
- **Propiedad `dimension`**: Alterna los textos explicativos (`cost` vs `schedule`) en el Tooltip.
- **Modos**: `compact` (solo icono para tablas) y default (icono + texto).

### 2. ProjectKPIs
- **Widgets Principales**: CPI y SPI muestran el valor numérico en tipografía gigante y un sparkline por detrás. EAC no muestra sparkline.
- **Panel de Diagnóstico**: Expande un grid de 3x2 con PV, EV, AC y CV, SV, VAC. Los valores de variación tendrán color condicional (Verde > 0, Rojo < 0).
- **Esqueleto**: Ocupará el área visual idéntica mientras carga.

## Data Flow
```
[Dashboard] ──(project.evm_summary)──→ [ProjectKPIs]
                                            │
                                            ├─→ [HealthBadge (Cost)]
                                            ├─→ [HealthBadge (Schedule)]
                                            └─→ [Diagnostic Panel]
```
