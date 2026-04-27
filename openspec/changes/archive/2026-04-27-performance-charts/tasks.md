# Tasks: Performance Charts (Recharts)
> Change: `performance-charts` · Status: Pending · v1.0

## Phase 1: Setup & Foundations
- [x] 1.1 Instalar dependencias: `recharts`.
- [x] 1.2 Crear `frontend/src/components/charts/ChartCard.tsx` como contenedor con estilos de UI Elevada.
- [x] 1.3 Implementar `frontend/src/components/charts/GlassTooltip.tsx` con efecto esmerilado y tipografía `DM Mono`.

## Phase 2: Core Charts Implementation
- [x] 2.1 Implementar `frontend/src/components/charts/SCurveChart.tsx` (Evolución temporal PV vs EV vs AC).
- [x] 2.2 Implementar `frontend/src/components/charts/HealthRadarChart.tsx` (KPIs de salud normalizados).
- [x] 2.3 Implementar `frontend/src/components/charts/BACDonutChart.tsx` (Distribución de presupuesto).

## Phase 3: Orchestration & Integration
- [x] 3.1 Crear `frontend/src/components/EVMVisualizations.tsx` para agrupar y pasar datos a las gráficas.
- [x] 3.2 Modificar `frontend/src/components/Dashboard.tsx` para integrar el panel de visualizaciones real.

## Phase 4: Verification
- [ ] 4.1 Verificar el renderizado de datos en modo Dark y Light.
- [ ] 4.2 Validar que los tooltips muestran la información monetaria con formato correcto.
- [ ] 4.3 Comprobar la responsividad del grid de gráficas.
