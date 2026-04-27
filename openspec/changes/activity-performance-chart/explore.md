# Exploration: Activity Performance Chart
> Change: `activity-performance-chart` · Status: Completed · v1.0

## Context
El dashboard actual tiene un placeholder para la gráfica de "Rendimiento por Actividad". Las otras gráficas (Curva S, Radar de Salud, Donut de Presupuesto) ya están implementadas usando **Recharts**.

## Findings
- **Componente Objetivo**: `frontend/src/components/EVMVisualizations.tsx` tiene el placeholder en las líneas 101-109.
- **Tipo de Gráfica**: Se requiere una gráfica de barras (Bar Chart) que compare el CPI (Cost Performance Index) y el SPI (Schedule Performance Index) por cada actividad.
- **Datos Reales**: Cada objeto `Activity` en el frontend tiene `cpi` y `spi` calculados (provenientes del backend).
- **Estética**: Debe seguir el patrón de `ChartCard` y usar el `GlassTooltip` existente para consistencia visual.

## Constraints
- Debe ser responsiva.
- Debe manejar múltiples actividades sin saturar el eje X (posiblemente limitar a las Top N o usar scroll).
- El eje Y debe tener una línea de referencia en `1.0` (umbral de salud).

## Recommendation
Implementar un componente `ActivityBarChart.tsx` en `frontend/src/components/charts/` que reciba un array de actividades y renderice barras agrupadas (CPI y SPI) por nombre de actividad.
