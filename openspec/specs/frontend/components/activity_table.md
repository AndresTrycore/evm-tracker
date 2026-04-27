# activity_table.md — Especificación de Componente
> EVM Tracker · Frontend Specs · v1.0  
> Depende de: `health_badge.md`, `visual_standards.md`, `api_client.md` (tipo `ActivityResponse`)

---

## 1. Propósito

Mostrar todas las actividades de un proyecto en una tabla escaneable que permite
al gerente identificar en segundos qué actividades están en riesgo, ordenar por
indicadores críticos y buscar por nombre — sin saturar la vista con datos secundarios.

---

## 2. Props

```ts
interface ActivityTableProps {
  // Lista de actividades del proyecto — viene de ProjectWithEVM.activities
  activities: ActivityResponse[]

  // Estado de carga — muestra skeleton cuando true
  isLoading?: boolean           // default: false

  // Callbacks de acción por fila
  onEdit:   (activity: ActivityResponse) => void
  onDelete: (activity: ActivityResponse) => void
}
```

---

## 3. Estados Internos

```ts
// Texto del filtro de búsqueda por nombre
const [searchQuery, setSearchQuery] = useState('')

// Columna activa de ordenamiento
const [sortColumn, setSortColumn] = useState<SortColumn>('name')

// Dirección del ordenamiento
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
```

```ts
// Columnas por las que se puede ordenar
type SortColumn =
  | 'name'
  | 'actual_progress'
  | 'budget_at_completion'
  | 'actual_cost'
  | 'cpi'
  | 'spi'
```

### Lógica derivada (no es estado — se calcula en render)

```ts
// 1. Filtrar por nombre (case-insensitive, trim)
const filtered = activities.filter(a =>
  a.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
)

// 2. Ordenar el resultado filtrado
const sorted = [...filtered].sort((a, b) => { /* ver §6 */ })
```

---

## 4. Estructura de Columnas

### 4.1 Columnas Principales (siempre visibles)

| # | Header | Dato | Ancho | Ordenable |
|---|---|---|---|---|
| 1 | `ACTIVIDAD` | `activity.name` | `flex-1` mínimo 200px | ✓ por `name` |
| 2 | `PROGRESO` | Barra dual Plan vs Real | 160px fijo | ✓ por `actual_progress` |
| 3 | `CPI` | `activity.evm.cost_performance_index` | 80px | ✓ |
| 4 | `SPI` | `activity.evm.schedule_performance_index` | 80px | ✓ |
| 5 | `BAC` | `activity.budget_at_completion` | 120px | ✓ |
| 6 | `AC` | `activity.actual_cost` | 120px | ✓ |
| 7 | `` (acciones) | Botones Editar / Eliminar | 80px fijo | ✗ |

### 4.2 Columnas Secundarias (en tooltip de fila)

EAC y VAC **no son columnas** — se muestran en el tooltip que aparece al hacer hover
sobre cualquier celda de la fila (excepto la columna de acciones). Ver §5.3.

---

## 5. Especificación Visual por Columna

### 5.1 Columna ACTIVIDAD

- Texto: `text-body` Geist, `--text-primary`
- Si el nombre supera 40 caracteres: truncar con `truncate` + mostrar nombre completo en el tooltip de fila
- Alineación: izquierda

### 5.2 Columna PROGRESO — Barra Dual

Componente visual inline (no extrae a componente separado — es exclusivo de esta tabla).

```
┌──────────────────────────────────────┐
│  Barra de fondo (Planificado)        │  ← gris --bg-elevated, altura 6px, rounded-full
│  ████████████░░░░░░░░░░░░░░░░░░░░░░  │  ← --health-gray al ancho de planned_progress %
│  ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← color semáforo al ancho de actual_progress %
└──────────────────────────────────────┘
  30% real / 50% plan
```

**Implementación:**
- Contenedor: `relative h-6 w-full` (incluye el texto debajo)
- Barra de fondo (planificado): `absolute h-1.5 w-full rounded-full bg-[--bg-elevated]`
- Barra de planificado: `absolute h-1.5 rounded-full bg-[--text-disabled]` con `width: planned_progress%`
- Barra de real: `absolute h-1.5 rounded-full` con color semáforo según SPI, `width: actual_progress%`
- Texto debajo de las barras: `text-caption --text-secondary`: `"30% / 50%"` (real / plan)

**Color de la barra de progreso real:**

| Condición (actual vs planned) | Color |
|---|---|
| `actual >= planned` | `--health-green` |
| `actual >= planned * 0.85` | `--health-yellow` |
| `actual >= planned * 0.70` | `--health-orange` |
| `actual < planned * 0.70` | `--health-red` |
| `planned = 0` | `--health-gray` |

### 5.3 Columnas CPI y SPI

Cada celda muestra:
- Valor numérico: `text-kpi-sm` DM Mono, color según semáforo (mismos umbrales de `project_kpis.md §5.2`)
- Null: `"—"` en `--text-disabled`
- Alineación: centro

### 5.4 Columnas BAC y AC

- Formato moneda: `visual_standards.md §4.4`
- Fuente: `text-kpi-sm` DM Mono, `--text-primary`
- Alineación: derecha

### 5.5 Tooltip de Fila — Indicadores Secundarios

Aparece al hacer hover sobre cualquier celda de la fila excepto la columna de acciones.
Implementado con CSS `group-hover` igual que `HealthBadge`.

```
┌──────────────────────────────────────┐
│  Desarrollo módulo de login          │  ← nombre completo (útil si estaba truncado)
│  ────────────────────────────────    │
│  EAC   $13,333.33                    │
│  VAC   −$3,333.33          (rojo)    │
│  ────────────────────────────────    │
│  PV    $5,000.00                     │
│  EV    $3,000.00                     │
└──────────────────────────────────────┘
```

- Posición: encima de la fila (`bottom-full`), alineado al inicio de la celda
- Ancho fijo: `w-64`
- Estilos: `bg-[--bg-elevated] border border-[--border] rounded-md p-3 text-xs`
- VAC negativo: `--health-red` / VAC positivo: `--health-green` / VAC cero: `--text-primary`
- EAC: siempre `--text-primary`

### 5.6 Columna de Acciones

Dos botones visibles al hacer hover sobre la fila (`opacity-0 group-hover:opacity-100`):

```
[✏ Editar]  [🗑 Eliminar]
```

- Editar: variante `Ghost`, ícono `Pencil` de lucide-react, llama `onEdit(activity)`
- Eliminar: variante `Ghost` con color `--health-red` en hover, ícono `Trash2`, llama `onDelete(activity)`
- En móvil: siempre visibles (sin hover)

---

## 6. Ordenamiento

### Comportamiento del header

- Click en columna ordenable → ordena `asc` por esa columna
- Click de nuevo en la misma columna → invierte a `desc`
- Click en columna diferente → ordena `asc` por la nueva columna
- El header activo muestra `ChevronUp` o `ChevronDown` según dirección
- Los headers inactivos muestran `ChevronsUpDown` (ícono de "ordenable") en `--text-disabled`

### Lógica de ordenamiento por columna

```ts
// Columnas de texto
'name': comparación alfabética locale-aware (localeCompare)

// Columnas numéricas directas
'actual_progress':       a.actual_progress vs b.actual_progress
'budget_at_completion':  a.budget_at_completion vs b.budget_at_completion
'actual_cost':           a.actual_cost vs b.actual_cost

// Columnas que pueden ser null — los null van siempre al final, sin importar la dirección
'cpi': a.evm.cost_performance_index vs b.evm.cost_performance_index
'spi': a.evm.schedule_performance_index vs b.evm.schedule_performance_index
```

**Regla para nulls en CPI/SPI:** `null` siempre se posiciona al final de la lista,
independientemente de si el orden es `asc` o `desc`. Nunca flotan arriba.

---

## 7. Filtrado por Nombre

- Input tipo `search` en la parte superior de la tabla, ancho completo
- Placeholder: `"Buscar actividad…"`
- Ícono `Search` de lucide-react a la izquierda del input
- El filtro es **case-insensitive** y aplica `trim()` al valor
- El filtro se aplica **antes** del ordenamiento
- Si no hay resultados: mostrar empty state inline (ver §8)
- El input no tiene botón de submit — filtra en tiempo real con cada keystroke (`onChange`)

---

## 8. Render Condicional

### isLoading = true

Skeleton de 4 filas que replica la estructura de la tabla real:

```
Header:  6 rectángulos de ~60px en la fila de headers
Filas:   4 filas con celdas de altura 40px, animate-pulse, bg-[--bg-elevated]
         La columna de PROGRESO muestra un rectángulo redondeado de 160px × 6px
```

### activities.length = 0 (sin actividades en el proyecto)

No renderizar la tabla. Mostrar empty state centrado:

```
[ícono PackageOpen de lucide-react, tamaño 40px, --text-disabled]
"Este proyecto no tiene actividades aún."
[Botón Primary "Agregar primera actividad" que llama a onEdit con null]
```

> El `onEdit(null)` señaliza al padre que debe abrir el formulario en modo creación.
> El padre debe aceptar `activity: ActivityResponse | null` en su handler.

### searchQuery activo sin resultados

Mantener la tabla visible con el input de búsqueda. Dentro del cuerpo de la tabla, una sola fila que ocupa todo el ancho:

```
[ícono SearchX, --text-disabled]
"Ninguna actividad coincide con «{searchQuery}»."
[Botón Ghost "Limpiar búsqueda" que llama a setSearchQuery('')]
```

### Con datos

Render completo. Mínimo de filas sin altura fija — la tabla crece con el contenido.

---

## 9. Casos Borde Visuales

| Caso | Comportamiento |
|---|---|
| Nombre de actividad muy largo (+60 chars) | Truncar con `truncate`, nombre completo en tooltip de fila |
| BAC o AC = 0 | Mostrar `"$0.00"` — no es null, es un valor válido |
| `planned_progress = 0` y `actual_progress = 0` | Ambas barras en ancho 0, texto `"0% / 0%"`, color gris |
| `actual_progress > planned_progress` | La barra real sobresale visualmente — color verde, es un buen signo |
| Una sola actividad | Tabla con una fila — no hay empty state |
| CPI o SPI null | `"—"` en la celda, null al final al ordenar por esa columna |
| VAC exactamente en 0 | Color `--text-primary` en el tooltip (ni rojo ni verde) |

---

## 10. Dependencias

| Dependencia | Uso |
|---|---|
| `HealthBadge` | No se usa directamente — los colores semáforo se aplican inline en CPI/SPI |
| `lucide-react` | `Search`, `SearchX`, `Pencil`, `Trash2`, `ChevronUp`, `ChevronDown`, `ChevronsUpDown`, `PackageOpen` |
| `visual_standards.md §4.2–4.4` | Formato de índices y moneda |
| `visual_standards.md §6.2` | Estilos de botones Ghost |
| `visual_standards.md §7` | Skeleton |
| `api_client.md §2.1` | Tipo `ActivityResponse` |

No consume hooks — recibe `activities` y `isLoading` por props desde el Dashboard.

---

## 11. Pruebas Requeridas

| Test | Qué verifica |
|---|---|
| Render con lista de actividades | Todas las filas visibles, nombre y valores correctos |
| Barra de progreso dual | Anchos correctos según `planned_progress` y `actual_progress` |
| Color barra real según umbral | Verde cuando actual >= planned, rojo cuando < 70% |
| CPI null muestra `"—"` | Celda contiene `"—"`, no `"0"` ni vacío |
| Ordenar por CPI asc | Actividad con CPI más bajo en primera fila |
| Ordenar por CPI asc con nulls | Actividades con null al final de la lista |
| Ordenar por nombre | Orden alfabético correcto |
| Cambiar orden en misma columna | Segunda click invierte dirección |
| Búsqueda filtra correctamente | Solo filas cuyo nombre contiene el texto |
| Búsqueda case-insensitive | `"LOGIN"` encuentra `"Módulo de login"` |
| Sin resultados de búsqueda | Empty state con texto y botón "Limpiar búsqueda" |
| Lista vacía | Empty state de "sin actividades" con botón de creación |
| isLoading = true | Skeleton de 4 filas visible, sin datos reales |
| onEdit llamado con actividad correcta | Click en Editar fila 2 → callback con activity de fila 2 |
| onDelete llamado con actividad correcta | Click en Eliminar → callback con activity correspondiente |
| Tooltip de fila muestra EAC y VAC | Hover sobre fila → EAC y VAC visibles en DOM |
| VAC negativo en rojo en tooltip | Clase de color rojo cuando VAC < 0 |