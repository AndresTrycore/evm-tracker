# evm_visualizations.md — Especificación de Componente
> EVM Tracker · Frontend Specs · v1.0  
> Depende de: `visual_standards.md` (librería Recharts), `api_client.md` (tipo `Activity[]`, `EVMSummary`)

---

## 1. Propósito

Ofrecer una visión 360° del proyecto mediante el "Triángulo de Datos": evolución temporal (Curva S), estado actual de salud (Radar) y distribución de recursos (Donut). Se aleja de la tabla plana para proporcionar contexto visual inmediato.

---

## 2. Props

```ts
interface EVMVisualizationsProps {
  activities: Activity[]
  summary: EVMSummary
  history?: Array<{ date: string; pv: number; ev: number; ac: number }> // Datos históricos opcionales
  isLoading?: boolean
}
```

---

## 3. Composición del Panel

El componente organiza las visualizaciones en un grid adaptativo:

```
┌──────────────────────────────────────┬──────────────────────────┐
│  CURVA S (Evolución Temporal)        │  SALUD INTEGRAL (Radar)  │
│                                      │                          │
│  [Gráfico de Líneas PV vs EV vs AC]  │  [CPI, SPI, CV, SV]      │
│                                      │                          │
├──────────────────────────────────────┼──────────────────────────┤
│  RENDIMIENTO POR ACTIVIDAD           │  DISTRIBUCIÓN BAC        │
│                                      │                          │
│  [Gráfico de Barras Agrupadas]       │  [Donut Chart]           │
│                                      │                          │
└──────────────────────────────────────┴──────────────────────────┘
```

---

## 4. Detalle de Gráficas

### 4.1 Curva S (S-Curve) — Evolución Temporal
**Tipo:** `AreaChart` o `LineChart`.
- **Eje X:** Tiempo (fechas).
- **Líneas:** 
  - `PV` (Planned Value): Línea punteada gris (`--text-disabled`).
  - `EV` (Earned Value): Línea sólida verde (`--health-green`).
  - `AC` (Actual Cost): Línea sólida roja (`--health-red`).
- **Efecto:** Rellenar el área bajo `EV` con un gradiente suave verde para enfatizar el valor ganado.

### 4.2 Salud Integral — Radar Chart
**Tipo:** `RadarChart`.
- **Dimensiones:** CPI, SPI, Cost Variance (Normalizada), Schedule Variance (Normalizada).
- **Visualización:** Un polígono que se expande hacia los bordes cuando el proyecto está sano (valores >= 1) y se contrae hacia el centro en caso de riesgo.
- **Estilo:** `fill="--accent"`, `fillOpacity={0.4}`, `stroke="--accent"`.

### 4.3 Distribución BAC — Donut Chart
**Tipo:** `PieChart` con `innerRadius`.
- **Datos:** `name` (Actividad) y `value` (`budget_at_completion`).
- **Centro:** Mostrar el "BAC Total" en texto grande (`DM Mono`) justo en el hueco del donut.
- **Paleta:** Usar una escala de azules/grises (`--accent` a `--text-disabled`) para no confundir con el semáforo de salud.

### 4.4 Rendimiento por Actividad (Barras)
*Mantiene la lógica anterior de barras agrupadas para comparar PV, EV y AC por cada tarea.*

---

## 5. Diseño Visual (Glassmorphism & Elevación)

Cada gráfica se envuelve en una **Card Elevada** (`visual_standards.md §6.1`):
- Bordes redondeados `rounded-xl`.
- Sombra sutil que aumenta al hacer hover (`hover:shadow-lg`).
- Los tooltips de las gráficas usan el efecto de **Glassmorphism** (`backdrop-blur-md bg-[--glass-bg]`).

---

## 6. Estado de Carga y Errores

- **Loading:** Skeletons individuales por cada gráfica.
- **Sin datos:** Si una gráfica no tiene datos suficientes (ej: S-Curve sin historia), mostrar un placeholder con un mensaje: "Datos históricos insuficientes para generar tendencia".

---

## 7. Pruebas Requeridas

- [ ] La Curva S escala correctamente el eje Y según los valores monetarios.
- [ ] El Radar Chart normaliza correctamente las variaciones para que sean comparables con los índices.
- [ ] El Donut Chart suma correctamente el BAC total en el centro.
- [ ] Los tooltips son legibles en ambos temas (Dark/Light).
