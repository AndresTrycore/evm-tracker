# Specification: Activity Performance Chart
> Change: `activity-performance-chart` · Status: Draft · v1.0

## Requirements

### 1. Visualización de Índices
- **R1.1**: La gráfica debe mostrar una barra para el CPI y otra para el SPI por cada actividad.
- **R1.2**: El eje Y debe representar el valor del índice (flotante, 2 decimales).
- **R1.3**: Debe incluirse una línea de referencia horizontal en `1.0`.

### 2. Interactividad
- **R2.1**: Al hacer hover sobre una barra, debe mostrarse el `GlassTooltip` con el nombre de la actividad y los valores exactos de CPI y SPI.
- **R2.2**: La gráfica debe ser responsiva y ajustarse al ancho del contenedor `ChartCard`.

### 3. Gestión de Datos
- **R3.1**: Si el proyecto no tiene actividades, debe mostrar un estado vacío (Empty State) dentro de la tarjeta.
- **R3.2**: Si hay más de 8 actividades, se deben mostrar las 8 con menor rendimiento (peor CPI/SPI combinado) para resaltar riesgos, o permitir scroll. Optamos por mostrar las **Top 10 actividades por CPI más bajo** para priorizar la detección de sobrecostos.

## Scenarios

### Escenario: Proyecto con desviaciones
- **Dado** un proyecto con una actividad con CPI=0.8 y SPI=1.1.
- **Cuando** se visualiza la gráfica.
- **Entonces** se deben ver dos barras, una por debajo de la línea de referencia (CPI) y otra por encima (SPI).
