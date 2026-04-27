# Tasks: Advanced BI (Project KPIs & Health Badge)
> Change: `project-kpis` · Status: Pending · v1.0

## Phase 1: HealthBadge
- [x] 1.1 Crear `frontend/src/components/ui/HealthBadge.tsx` como componente funcional `stateless`.
- [x] 1.2 Implementar el contenedor con `group` y el renderizado condicional de colores/íconos según la prop `status` (Verde, Rojo, Gris).
- [x] 1.3 Desarrollar el Tooltip puramente con CSS (`group-hover:visible`, `opacity-0` -> `opacity-100`) y renderizar lógicas dinámicas de CPI/SPI adentro.

## Phase 2: ProjectKPIs (Core Widgets)
- [x] 2.1 Crear `frontend/src/components/ProjectKPIs.tsx` con su estructura de esqueleto de carga (`isLoading`).
- [x] 2.2 Integrar los `HealthBadge` en la cabecera (Cost y Schedule) y los botones de acción simulados.
- [x] 2.3 Implementar las 3 tarjetas de KPIs principales (CPI, SPI, EAC) con la escala tipográfica `text-kpi-xl`.
- [x] 2.4 Incorporar las micro-gráficas (`Recharts` -> `AreaChart`) con un array sintético para las tarjetas CPI/SPI.

## Phase 3: ProjectKPIs (Diagnostic Panel)
- [x] 3.1 Implementar el toggle ("Ver diagnóstico detallado") usando un estado local.
- [x] 3.2 Persistir el estado del toggle en `localStorage` (`'evm-kpi-detail-open'`).
- [x] 3.3 Diseñar el panel de diagnóstico con efecto *Glassmorphism* mostrando la grilla de 3x2 con PV, EV, AC y CV, SV, VAC (aplicando colores semánticos a las variaciones).

## Phase 4: Dashboard Integration
- [x] 4.1 Reemplazar el esqueleto estático de "Sección KPIs" en `frontend/src/components/Dashboard.tsx` por el componente `<ProjectKPIs evm={project.evm_summary} isLoading={isLoading} />`.
