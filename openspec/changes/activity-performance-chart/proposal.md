# Proposal: Activity Performance Chart
> Change: `activity-performance-chart` · Status: Draft · v1.0

## Intent
Transformar el placeholder estático en `EVMVisualizations` en una visualización interactiva que permita a los Project Managers identificar rápidamente qué actividades específicas están desviadas en costo (CPI) o tiempo (SPI).

## Scope
- Implementar el componente `ActivityBarChart` usando Recharts.
- Configurar barras agrupadas para CPI y SPI.
- Añadir una `ReferenceLine` en `y=1.0` para marcar el umbral de eficiencia.
- Integrar el componente en `EVMVisualizations` reemplazando el placeholder.
- Asegurar que el `GlassTooltip` muestre los valores exactos con 2 decimales.

## Technical Approach
Utilizaremos `BarChart` de Recharts. El eje X mostrará los nombres de las actividades (truncados si son muy largos). El eje Y mostrará los índices (típicamente entre 0 y 2). Usaremos colores consistentes con el sistema de diseño: `var(--health-green)` para valores >= 1 y `var(--health-red)` para valores < 1 (o simplemente colores fijos para CPI y SPI para diferenciarlos, como Azul y Violeta, aplicando opacidad si están por debajo del umbral).

## Risks
- **Densidad de Datos**: Si un proyecto tiene muchas actividades, el gráfico de barras puede volverse ilegible. 
  - *Mitigación*: Implementar un slice de las 10 actividades con mayor desviación o habilitar scroll horizontal.
