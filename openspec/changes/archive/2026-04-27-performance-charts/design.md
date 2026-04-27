# Design: Performance Charts (Recharts)
> Change: `performance-charts` · Stage: Design · v1.1

## Technical Approach
Implementaremos un sistema de visualización de alto nivel compuesto por cuatro componentes especializados de Recharts. El diseño se basa en el concepto de "Data Triangle" para ofrecer una visión 360° del proyecto. Cada componente seguirá estrictamente los **Visual Standards (§10)** para asegurar la coherencia con el tema industrial y la legibilidad técnica.

## Architecture Decisions

### Decision: Visualization Components
**Choice**: Componentes desacoplados por tipo de análisis.
- `SCurveChart`: Análisis de tendencia acumulada (PV, EV, AC).
- `HealthRadarChart`: Análisis multidimensional de salud (CPI, SPI, CV, SV).
- `BACDonutChart`: Distribución de presupuesto por actividad.
- `ActivityPerformanceChart`: Comparativa de rendimiento individual.

### Decision: Semantic Color Mapping
**Choice**: Uso de tokens `--health-*` vinculados dinámicamente.
**Rationale**: Las líneas de la Curva S y los sectores del Donut deben reflejar el estado semántico definido en `visual_standards.md §2.2`. EV siempre usará `--health-green` (valor ganado) y AC usará `--health-red` si excede a EV.

### Decision: Custom GlassTooltip
**Choice**: Implementación de un componente `GlassTooltip` reutilizable.
**Rationale**: Para cumplir con el estándar de "UI Elevada" (§6.2), los tooltips deben tener `backdrop-blur-md`, `bg-[--glass-bg]` y `shadow-xl`. Recharts permite inyectar este componente mediante la prop `content`.

## Data Flow & Transformations

### SCurve Data Processing
Las actividades se agrupan por fecha para generar los puntos de la serie temporal:
1. `PV_cum`: Suma acumulada de `planned_value` por fecha.
2. `EV_cum`: Suma acumulada de `earned_value` por fecha.
3. `AC_cum`: Suma acumulada de `actual_cost` por fecha.

### Radar Normalization
Para que el polígono sea útil, las Variaciones (CV/SV) se mapean a una escala relativa al BAC total (0 a 1), donde 1 es salud perfecta. Los índices (CPI/SPI) se usan directamente.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/components/charts/ChartCard.tsx` | Create | Card con `rounded-xl`, `border-[--border]` y `shadow-sm`. |
| `frontend/src/components/charts/GlassTooltip.tsx` | Create | Tooltip con efecto esmerilado y tipografía `DM Mono` para valores. |
| `frontend/src/components/charts/SCurveChart.tsx` | Create | `AreaChart` con gradiente en EV y líneas punteadas para PV. |
| `frontend/src/components/charts/HealthRadarChart.tsx` | Create | `RadarChart` normalizado para KPIs de salud. |
| `frontend/src/components/charts/BACDonutChart.tsx` | Create | `PieChart` con BAC total centrado en `DM Mono`. |
| `frontend/src/components/EVMVisualizations.tsx` | Create | Orquestador principal que inyecta datos de `ProjectWithEVM`. |

## Interfaces / Contracts

### Custom Tooltip Props (Recharts compatibility)
```ts
interface GlassTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type?: 'currency' | 'index' | 'percentage';
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration | Recharts Rendering | Verificar que `ResponsiveContainer` ocupa el 100% del ancho del padre. |
| Unit | Currency Formatting | Validar que los tooltips usan `Intl.NumberFormat` con 2 decimales fijos (§4.4). |
| Visual | Dark Mode Shimmer | Confirmar que los Skeletons de las gráficas usan `--bg-elevated`. |

## Migration / Rollout
Se integrará en `Dashboard.tsx` sustituyendo los placeholders de la Fase 8. No requiere cambios en el backend.
