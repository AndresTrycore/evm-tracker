# Proposal: Performance Charts (Recharts)
> Change: `performance-charts` · Status: Draft · v1.0

## Intent
Implementar el sistema de visualización avanzada del Dashboard utilizando **Recharts**. El objetivo es proporcionar al usuario una interpretación visual inmediata del rendimiento del proyecto mediante el "Triángulo de Datos" (Tendencia, Salud y Distribución), aplicando los estándares de diseño de Glassmorphism y UI Elevada.

## Scope
- Instalación y configuración de Recharts.
- Implementación de `SCurveChart` (Líneas/Área para PV vs EV vs AC).
- Implementación de `HealthRadarChart` (Radar para CPI, SPI y Variaciones).
- Implementación de `BACDonutChart` (Donut para distribución del presupuesto).
- Creación de un componente `ChartCard` reutilizable con efectos de elevación.
- Integración de tooltips esmerilados (glassmorphism) en todas las gráficas.

## Non-Goals
- Implementar la lógica de simulación de Monte Carlo (Fase 12).
- Implementar la edición de datos desde las gráficas.

## Technical Approach
Utilizaremos **Recharts** por su integración nativa con React y su capacidad para recibir datos reactivos desde los hooks de TanStack Query implementados en la Fase 7. Las gráficas serán totalmente responsivas y adaptarán sus colores según el tema activo (usando las variables CSS de `index.css`). Se utilizarán gradientes suaves para enfatizar el Valor Ganado (EV) en la curva S.
