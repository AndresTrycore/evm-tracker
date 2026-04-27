# Proposal: Advanced BI (Project KPIs & Health Badge)
> Change: `project-kpis` · Status: Draft · v1.0

## Intent
Implementar la cabecera analítica del proyecto, completando así la Fase 11 del Roadmap. Se desarrollará un sistema jerárquico de indicadores clave (`ProjectKPIs`) acompañado de un átomo de estado (`HealthBadge`), proveyendo una visión gerencial instantánea del estado de costo y cronograma del proyecto con capacidades de inmersión en los detalles matemáticos (Diagnóstico Detallado).

## Scope
- Implementación de `HealthBadge` como un componente atómico `stateless` con tooltips CSS (`group-hover`).
- Creación de `ProjectKPIs` para consolidar CPI, SPI y EAC en tarjetas elevadas.
- Integración de micro-visualizaciones (mini-trends) en las tarjetas de índices usando `Recharts`.
- Panel de Diagnóstico Detallado (PV, EV, AC, CV, SV, VAC) con animación expansible y persistencia en `localStorage`.
- Estado de carga esquelético (`Skeleton`) sincronizado con el Dashboard.

## Non-Goals
- Modificar el backend para incluir historial de índices (si el historial no está presente en la API, las mini-tendencias usarán una línea representativa o plana temporalmente).
- Formularios o mutaciones. Esta fase es estrictamente analítica y de lectura.

## Technical Approach
Utilizaremos `lucide-react` para la iconografía semántica y TailwindCSS para la interactividad pura de los tooltips, evitando sobrecargar el DOM con librerías pesadas de popovers. `ProjectKPIs` mantendrá su estado de expansión en memoria local para mejorar la UX y consumirá directamente el `EVMSummary` pre-calculado por la API.
