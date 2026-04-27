# visual_standards.md — Especificación de Diseño y UX
> EVM Tracker · Frontend Specs · v1.0  
> Fuente de verdad visual para todos los componentes. Cualquier decisión estética que no esté aquí debe añadirse aquí antes de implementarse.

---

## 1. Filosofía de Diseño

**Dirección estética:** Minimalismo industrial con dualidad de temas.  
El sistema prioriza la claridad de los datos sobre la decoración. Cada píxel existe para comunicar información o crear respiración visual. El estilo industrial se expresa a través de bordes definidos, tipografía de peso variable y una paleta desaturada con acentos de alto contraste — no a través de texturas o efectos complejos.

**Principio rector:** Si un elemento visual no ayuda al usuario a tomar una decisión sobre su proyecto EVM, no debe estar ahí.

---

## 2. Temas (Dark / Light)

El sistema soporta dos temas. El tema activo se almacena en `localStorage` bajo la clave `evm-theme` con valores `"dark"` | `"light"`. Por defecto se usa `"dark"`.

Todos los valores de color se implementan como **CSS custom properties** en `:root` con override en `[data-theme="light"]`.

### 2.1 Tokens de Color Base

| Token | Dark | Light | Uso |
|---|---|---|---|
| `--bg-base` | `#0E0F11` | `#F5F5F4` | Fondo de la aplicación |
| `--bg-surface` | `#16181C` | `#FFFFFF` | Cards, paneles, modales |
| `--bg-elevated` | `#1E2126` | `#EBEBEA` | Dropdowns, tooltips, hover rows |
| `--border` | `#2A2D33` | `#D6D4D0` | Bordes de cards y separadores |
| `--border-subtle` | `#1E2126` | `#EBEBEA` | Bordes secundarios, divisores internos |
| `--text-primary` | `#E8E6E1` | `#1A1917` | Títulos, valores numéricos principales |
| `--text-secondary` | `#8A8784` | `#6B6966` | Labels, metadata, subtítulos |
| `--text-disabled` | `#4A4846` | `#B5B3B0` | Texto inactivo, placeholders |
| `--accent` | `#4F7CFF` | `#2563EB` | CTAs primarios, links, foco activo |
| `--accent-subtle` | `#1A2540` | `#DBEAFE` | Fondos de badges con acento |
| `--glass-bg` | `rgba(22, 24, 28, 0.7)` | `rgba(255, 255, 255, 0.7)` | Fondo esmerilado (Glassmorphism) |
| `--glass-border` | `rgba(42, 45, 51, 0.5)` | `rgba(214, 212, 208, 0.5)` | Borde esmerilado |

### 2.2 Paleta Semáforo de Salud EVM

Diseñada para funcionar en ambos temas. Los valores tienen baja saturación para integrarse con la estética industrial, pero mantienen suficiente contraste para ser funcionales como indicadores de estado.

| Estado | Token | Dark (texto/badge) | Light (texto/badge) | Dark (fondo badge) | Light (fondo badge) | Mapeo API (`cost_status` / `schedule_status`) |
|---|---|---|---|---|---|---|
| Positivo | `--health-green` | `#4ADE80` | `#16A34A` | `#0F2318` | `#DCFCE7` | `"bajo presupuesto"` / `"adelantado"` / `"en presupuesto"` / `"en cronograma"` |
| Atención | `--health-yellow` | `#FACC15` | `#CA8A04` | `#231E06` | `#FEF9C3` | (Uso para proyecciones o alertas tempranas si aplica) |
| Riesgo | `--health-orange` | `#FB923C` | `#EA580C` | `#231409` | `#FFEDD5` | (Uso para desvíos menores si aplica) |
| Crítico | `--health-red` | `#F87171` | `#DC2626` | `#230D0D` | `#FEE2E2` | `"sobre presupuesto"` / `"atrasado"` |
| Sin datos | `--health-gray` | `#8A8784` | `#6B6966` | `#1E2126` | `#EBEBEA` | `"sin datos"` |

> **Nota:** La API procesa la lógica de negocio y determina si el proyecto está adelantado, atrasado o en presupuesto. El frontend mapea los strings exactos devueltos por el backend (`cost_status` y `schedule_status`) a esta paleta semántica. Si se requiere un "Estado General" consolidado, se debe priorizar el estado más crítico.

---

## 3. Tipografía

### 3.1 Familias

| Rol | Familia | Fuente | Uso |
|---|---|---|---|
| Display / KPIs | `'DM Mono'` | Google Fonts | Valores numéricos grandes (CPI, SPI, costos) |
| UI / Cuerpo | `'Geist'` | Vercel / npm `geist` | Texto de interfaz, labels, botones, tablas |
| Fallback | `monospace`, `system-ui` | Sistema | Fallback obligatorio en ambos casos |

**Racional:** DM Mono aporta el carácter industrial-técnico en los números sin volverse difícil de leer. Geist es la alternativa moderna a Inter — misma legibilidad, diferente personalidad. La combinación mono + sans-serif refuerza que esta es una herramienta de datos, no una app de marketing.

### 3.2 Escala Tipográfica

| Token | Familia | Tamaño | Peso | Line-height | Uso |
|---|---|---|---|---|---|
| `text-kpi-xl` | DM Mono | `2.25rem` (36px) | 600 | 1.1 | KPI principal del dashboard |
| `text-kpi-lg` | DM Mono | `1.5rem` (24px) | 500 | 1.2 | KPIs secundarios |
| `text-kpi-sm` | DM Mono | `1rem` (16px) | 500 | 1.3 | Valores en tabla |
| `text-label` | Geist | `0.75rem` (12px) | 500 | 1.4 | Labels sobre KPIs, headers de tabla |
| `text-body` | Geist | `0.875rem` (14px) | 400 | 1.5 | Texto general, descripiciones |
| `text-heading` | Geist | `1.125rem` (18px) | 600 | 1.3 | Títulos de sección, nombre de proyecto |
| `text-caption` | Geist | `0.75rem` (12px) | 400 | 1.4 | Metadata, fechas, tooltips |

### 3.3 Reglas de Uso

- Los valores numéricos derivados de la API **siempre** usan `DM Mono`, sin excepción.
- Los labels que describen esos valores usan `Geist` en `text-label`.
- No mezclar pesos dentro de un mismo grupo de texto en una card.

---

## 4. Formato de Datos

### 4.1 Valores Nulos

Cuando la API devuelve `null` en cualquier campo numérico, la UI muestra `—` (em dash, U+2014).  
**Nunca** mostrar `0`, `N/A`, `undefined`, vacío, o `-`.

```
null → "—"
```

### 4.2 Índices EVM (CPI, SPI, TCPI)

Los índices llegan como `number` (ej: `0.87`). Se muestran con **2 decimales fijos**.

```
0.87  → "0.87"
1     → "1.00"
1.123 → "1.12"
null  → "—"
```

### 4.3 Porcentajes (Avance planificado, Avance real)

Según la definición de la API, los valores de porcentaje llegan como `number` entre **0.0 y 100.0** (ej: `65.3`). Se muestran con el símbolo `%` y **1 decimal** fijo.

```
65.33 → "65.3%"
100.0 → "100.0%"
0     → "0.0%"
null  → "—"
```

### 4.4 Valores Monetarios (AC, EV, PV, BAC, ETC, EAC)

Llegan como `number`. Se muestran con símbolo de moneda, separador de miles y **2 decimales**.  
La moneda se configura a nivel de proyecto (spec de estado). Por defecto: USD.

```
125000.5  → "$125,000.50"
1000000   → "$1,000,000.00"
null      → "—"
```

> Usar `Intl.NumberFormat` nativo del browser. No instalar librerías de formato.

### 4.5 Fechas

Las fechas llegan como string ISO 8601 (`"2024-03-15"`). Se muestran en formato corto localizado.

```
"2024-03-15" → "15 mar 2024"  (locale es-CO)
null         → "—"
```

---

## 5. Espaciado y Layout

El sistema usa la escala de espaciado de Tailwind con las siguientes convenciones de uso:

| Contexto | Valor Tailwind | px |
|---|---|---|
| Padding interno de card | `p-4` / `p-6` | 16 / 24 |
| Gap entre cards en grid | `gap-4` | 16 |
| Gap entre secciones de página | `gap-8` | 32 |
| Padding horizontal de página | `px-6` md: `px-10` | 24 / 40 |
| Padding vertical de página | `py-6` | 24 |
| Border radius de cards | `rounded-lg` | 8px |
| Border radius de badges | `rounded-full` | 9999px |
| Border radius de botones | `rounded-md` | 6px |

---

## 6. Componentes Visuales Base

### 6.1 Cards

Todas las cards siguen este patrón base:

```
bg: --bg-surface
border: 1px solid --border
border-radius: rounded-xl (12px)
padding: p-4 o p-6
shadow: shadow-sm en dark / shadow-md en light
transition: transform 0.2s ease (para efecto de elevación al hover)
```

No usar `box-shadow` llamativo. El contraste entre `--bg-base` y `--bg-surface` junto con una sombra sutil de baja dispersión (`0 4px 6px -1px rgb(0 0 0 / 0.1)`) es suficiente.

### 6.2 Paneles Elevados y Glassmorphism

Para modales, tooltips detallados y paneles colapsables, se aplica el concepto de **UI Elevada**:

- **Fondo**: `bg-[--glass-bg]`
- **Borde**: `border-[--glass-border]`
- **Efecto**: `backdrop-blur-md` (blur de 12px)
- **Sombra**: `shadow-xl` (para indicar máxima profundidad)

Este efecto permite que la información detallada "flote" sobre el dashboard sin perder el contexto visual del fondo.

### 6.3 Botones

| Variante | Fondo | Texto | Hover | Uso |
|---|---|---|---|---|
| Primary | `--accent` | blanco | `opacity-90` | Acción principal (Guardar, Crear) |
| Secondary | `--bg-elevated` | `--text-primary` | `--border` como borde | Acciones secundarias (Cancelar, Editar) |
| Destructive | `--health-red` bg-subtle | `--health-red` | bg más oscuro | Eliminar |
| Ghost | transparente | `--text-secondary` | `--bg-elevated` | Acciones terciarias, iconos |

### 6.4 Inputs y Formularios

```
bg: --bg-elevated
border: 1px solid --border
border-radius: rounded-md
padding: px-3 py-2
focus: border --accent, ring 2px --accent-subtle
font: Geist text-body
```

Los mensajes de error de validación van en `--health-red` con `text-caption` debajo del campo.

---

## 7. Estados de Carga

| Situación | Patrón | Implementación |
|---|---|---|
| Carga inicial de página | Skeleton | Divs con `animate-pulse` en `--bg-elevated`, mismas dimensiones que el contenido real |
| Recarga de datos (refetch) | Spinner sutil | Icono de carga pequeño en la esquina superior derecha de la sección. No bloquear el contenido anterior |
| Mutación en progreso (guardar/eliminar) | Botón deshabilitado + spinner inline | El botón muestra spinner y texto cambia a "Guardando…" |
| Error de carga | Error state inline | Ver §8 |

**Regla:** Los skeletons se usan solo cuando no hay datos previos que mostrar. Si hay datos cacheados, se muestran mientras se recarga (stale-while-revalidate).

Los skeletons replican exactamente la forma del contenido real (misma altura, mismo ancho aproximado), no son barras genéricas.

---

## 8. Mensajes de Error

### 8.1 Textos por tipo de error HTTP

| Código | Mensaje al usuario | Acción sugerida |
|---|---|---|
| 400 | "Los datos enviados no son válidos." | Revisar campos del formulario |
| 404 | "Este recurso no existe o fue eliminado." | Volver al listado |
| 422 | "Hay campos con errores. Revisa el formulario." | Highlight de campos inválidos |
| 500 | "Error del servidor. Intenta de nuevo en un momento." | Botón "Reintentar" |
| Network error | "Sin conexión. Verifica tu red." | Botón "Reintentar" |

### 8.2 Presentación

Los errores a nivel de página se muestran en un banner inline (no toast, no modal) dentro del área de contenido afectada, con:

- Ícono de alerta en `--health-red`
- Texto en `text-body` color `--text-primary`
- Fondo `--health-red` bg-subtle
- Border `1px solid --health-red`
- Botón "Reintentar" en variante Secondary si la acción es recuperable

Los errores de validación de formulario van campo por campo, nunca en un banner global.

---

## 9. Empty States

| Contexto | Mensaje | Acción |
|---|---|---|
| Sin proyectos creados | "Aún no tienes proyectos. Crea el primero para comenzar." | Botón "Crear proyecto" |
| Sin actividades en proyecto | "Este proyecto no tiene actividades. Agrega la primera." | Botón "Agregar actividad" |
| Tabla filtrada sin resultados | "Ninguna actividad coincide con el filtro actual." | Botón "Limpiar filtro" |

Los empty states se muestran centrados verticalmente en el área de contenido, con ícono ilustrativo simple (outline, sin color), mensaje en `text-body --text-secondary`, y CTA en variante Primary o Secondary según corresponda.

---

## 10. Librería de Gráficas

**Selección: [Recharts](https://recharts.org)**

**Racional:**
- Basada en D3, composable como componentes React nativos
- No requiere configuración adicional con Tailwind
- API declarativa que se alinea con el patrón de componentes del proyecto
- Bundle size razonable (~130kb gzip)
- Soporte nativo para tooltips customizables y responsive containers

**Alternativa considerada y descartada:** Chart.js — API imperativa que choca con el modelo mental de React. Tremor — demasiado opinionado visualmente, difícil de adaptar al tema dark.

### 10.1 Convenciones de uso en Recharts

- Siempre envolver en `<ResponsiveContainer width="100%" height={N}>` — nunca dimensiones fijas.
- Los colores de líneas y barras usan los tokens del semáforo o `--accent`, nunca valores hardcodeados.
- Los tooltips usan fondo `--bg-elevated`, borde `--border`, texto `--text-primary` — implementar con `content` prop custom.
- El grid de los ejes usa `--border-subtle` con `strokeDasharray="3 3"`.
- Deshabilitar la animación en tests (`isAnimationActive={false}`).

---

## 11. Iconografía

**Librería: [Lucide React](https://lucide.dev)**

Se utiliza una paleta de iconos consistente para reforzar la semántica de la interfaz sin saturar visualmente.

| Categoría | Iconos | Uso |
|---|---|---|
| **Navegación** | `Folder`, `LayoutDashboard`, `Settings` | Sidebar y menú principal |
| **Acciones** | `Plus`, `Pencil`, `Trash2`, `Search`, `X` | Botones CRUD y búsqueda |
| **Estado Salud** | `CheckCircle2`, `AlertTriangle`, `Minus` | Semáforo EVM (§2.2) |
| **Indicadores** | `TrendingUp`, `TrendingDown`, `DollarSign`, `Clock` | KPIs y gráficos |
| **UI** | `ChevronUp`, `ChevronDown`, `Sun`, `Moon` | Acordeones, temas y controles |

### Reglas de Uso
- **Tamaño estándar**: `16px` para botones y labels, `20px` para iconos destacados (KPIs), `14px` para elementos compactos (tablas).
- **Stroke Width**: `2px` por defecto para mantener la legibilidad.
- **Color**: Deben heredar el color del texto (`currentColor`) o usar los tokens semánticos (`--health-*`).

## 12. Stack Frontend y Configuración

El proyecto asume un stack basado en **React + Vite + Tailwind CSS**.

### 12.1 Configuración de Tailwind

Se debe utilizar la estrategia `darkMode: 'class'` en `tailwind.config.js` para alternar entre los temas usando la clase `dark` en el elemento `<html>` o el atributo `data-theme="light"`. Los tokens de color de la sección 2 deben definirse como variables CSS en el archivo `index.css`.

### 12.2 Instalación de Dependencias

```bash
# Tipografía
npm install geist

# Gráficas
npm install recharts

# DM Mono — vía Google Fonts en index.html o next/font
```

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## 13. Checklist de Conformidad

Antes de hacer PR de cualquier componente, verificar:

- [ ] Usa tokens CSS (`--bg-surface`, `--text-primary`, etc.) — no colores hardcodeados
- [ ] Funciona en dark **y** light theme sin cambios de código
- [ ] Valores `null` de la API muestran `"—"` y no rompen el layout
- [ ] Números usan `DM Mono`, labels usan `Geist`
- [ ] Estados de carga implementados (skeleton o spinner según §7)
- [ ] Empty state implementado si el componente puede recibir lista vacía
- [ ] Mensaje de error implementado si el componente hace llamadas a la API
- [ ] Colores del semáforo tomados de los tokens `--health-*`, no hardcodeados