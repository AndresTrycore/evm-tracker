# health_badge.md — Especificación de Componente
> EVM Tracker · Frontend Specs · v1.0  
> Depende de: `visual_standards.md` (tokens de semáforo), `api_client.md` (tipos `CostStatus`, `ScheduleStatus`)

---

## 1. Propósito

Representar de forma visual y compacta la salud de un proyecto o actividad en una dimensión específica (Costo o Tiempo).
En su versión extendida, sirve como trigger para un **Tooltip Detallado** que desglosa los valores monetarios detrás del indicador.
Es el componente de menor jerarquía — no hace llamadas a la API ni maneja estado propio.

---

## 2. Props

```ts
interface HealthBadgeProps {
  // Estado de costo o cronograma a representar
  status: CostStatus | ScheduleStatus | 'sin datos'

  // Qué dimensión representa el badge — determina el label y el detalle del tooltip
  dimension: 'cost' | 'schedule'

  // Valores numéricos para el tooltip — opcionales, se muestran si están presentes
  cpi?: number | null    // Solo relevante cuando dimension = 'cost'
  spi?: number | null    // Solo relevante cuando dimension = 'schedule'

  // Tamaño visual del badge
  size?: 'sm' | 'md'    // default: 'md'

  // Para uso en tabla — elimina el label de texto, mantiene ícono y tooltip
  compact?: boolean      // default: false
}
```

---

## 3. Estados Internos

Este componente es **stateless**. No usa `useState`.  
El único estado es `isTooltipVisible`, manejado con CSS (`group-hover`) — sin JavaScript.

---

## 4. Mapa Visual de Estados

| `status` | Ícono | Label (`dimension='cost'`) | Label (`dimension='schedule'`) | Token de color |
|---|---|---|---|---|
| `'bajo presupuesto'` / `'adelantado'` | `●` filled | `Bajo presupuesto` | `Adelantado` | `--health-green` |
| `'en presupuesto'` / `'en cronograma'` | `●` filled | `En presupuesto` | `En cronograma` | `--health-green` |
| `'sobre presupuesto'` / `'atrasado'` | `▲` | `Sobre presupuesto` | `Atrasado` | `--health-red` |
| `'sin datos'` | `○` outline | `Sin datos` | `Sin datos` | `--health-gray` |

> **Nota sobre verde:** `'bajo presupuesto'` y `'en presupuesto'` usan el mismo color verde — ambos son estados saludables. La distinción semántica la aporta el label de texto.

> **Íconos:** Usar íconos de `lucide-react`. Mapeo exacto:
> - Verde (saludable): `CheckCircle2`
> - Rojo/atrasado: `AlertTriangle`  
> - Sin datos: `Minus`

---

## 5. Comportamiento del Tooltip

El tooltip aparece al hacer **hover** sobre el badge (desktop) y al **tap** en móvil.  
Se implementa con CSS puro usando clases `group` / `group-hover` de Tailwind — sin librería de tooltip.

### Contenido del tooltip

```
┌─────────────────────────────────┐
│  Costo · Sobre presupuesto      │  ← dimension capitalizada + status
│  ─────────────────────────────  │
│  CPI  0.75                      │  ← si cpi prop está presente
│  Indica $0.75 ganados por       │
│  cada $1.00 invertido           │  ← descripción fija según valor
└─────────────────────────────────┘
```

```
┌─────────────────────────────────┐
│  Cronograma · Atrasado          │
│  ─────────────────────────────  │
│  SPI  0.83                      │  ← si spi prop está presente
│  El proyecto avanza al 83%      │
│  del ritmo planificado          │
└─────────────────────────────────┘
```

```
┌─────────────────────────────────┐
│  Costo · Sin datos              │
│  ─────────────────────────────  │
│  No hay actividades registradas │
│  para calcular indicadores      │
└─────────────────────────────────┘
```

### Textos de descripción por rango de CPI/SPI

| Valor | Descripción en tooltip |
|---|---|
| `>= 1.0` | `"Eficiencia óptima"` |
| `>= 0.95` | `"Dentro del margen aceptable"` |
| `>= 0.85` | `"Ligera desviación — monitorear"` |
| `>= 0.70` | `"Desviación significativa — tomar acción"` |
| `< 0.70` | `"Desviación crítica — requiere intervención"` |
| `null` | No mostrar línea de descripción |

### Posicionamiento

- Por defecto: aparece **arriba** del badge, centrado
- Si el badge está en las primeras filas de una tabla: aparece **abajo** (clase condicional basada en prop `tooltipPosition?: 'top' | 'bottom'`, default `'top'`)

---

## 6. Render Condicional

```
compact = false (default)
└── Muestra: [ícono] [label] con tooltip al hover

compact = true
└── Muestra: [ícono] solo, con tooltip al hover
    Usar en columnas de tabla donde el espacio es limitado

size = 'sm'
└── text-xs, ícono de 12px, padding px-2 py-0.5

size = 'md' (default)
└── text-sm, ícono de 14px, padding px-3 py-1
```

---

## 7. Casos Borde Visuales

| Caso | Comportamiento |
|---|---|
| `status = 'sin datos'` | Badge gris con ícono `Minus`, label "Sin datos". Tooltip explica ausencia de actividades |
| `cpi = null` con `status != 'sin datos'` | Tooltip muestra el status pero omite la línea del índice numérico |
| `status` con valor inesperado | Render como `'sin datos'` — nunca romper el layout |
| Texto muy largo en contenedor pequeño | El label se trunca con `truncate` de Tailwind, tooltip siempre muestra el texto completo |

---

## 8. Estructura HTML / Clases Tailwind

```
<div class="relative inline-flex group">              ← contenedor con grupo para hover
  <span class="inline-flex items-center gap-1.5
               rounded-full px-3 py-1
               text-sm font-medium
               [color y bg según status]">
    <Icon size={14} />                                ← lucide-react
    {!compact && <span>{label}</span>}
  </span>

  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
              invisible group-hover:visible opacity-0 group-hover:opacity-100
              transition-opacity duration-150
              w-56 rounded-md p-3
              bg-[--bg-elevated] border border-[--border]
              text-[--text-primary] text-xs
              z-50 pointer-events-none">
    {/* contenido del tooltip */}
  </div>
</div>
```

---

## 9. Dependencias

| Dependencia | Uso |
|---|---|
| `lucide-react` | Íconos `CheckCircle2`, `AlertTriangle`, `Minus` |
| `visual_standards.md §2.2` | Tokens de color `--health-*` para cada estado |
| `api_client.md §2.1` | Tipos `CostStatus`, `ScheduleStatus` |

No depende de ningún otro componente del proyecto.  
No consume ningún hook — recibe todos los datos por props.

---

## 10. Pruebas Requeridas

| Test | Qué verifica |
|---|---|
| Render verde con `'en presupuesto'` | Clase de color verde presente, label "En presupuesto" visible |
| Render rojo con `'sobre presupuesto'` | Clase de color rojo, ícono `AlertTriangle` presente |
| Render gris con `'sin datos'` | Ícono `Minus`, label "Sin datos", color gris |
| Tooltip muestra CPI cuando se pasa la prop | Valor `"0.75"` visible en el DOM del tooltip |
| Tooltip omite línea numérica con `cpi = null` | No hay valor numérico en el tooltip |
| `compact = true` oculta el label | El texto del label no está en el DOM |
| `size = 'sm'` aplica clases correctas | Clase `text-xs` presente |
| Status inesperado no rompe el render | Componente renderiza sin lanzar error |
| Snapshot del badge en cada estado del semáforo | 4 snapshots: verde / rojo / gris + 1 por `compact` |