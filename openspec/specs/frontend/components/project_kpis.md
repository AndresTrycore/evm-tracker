# project_kpis.md — Especificación de Componente
> EVM Tracker · Frontend Specs · v1.0  
> Depende de: `health_badge.md`, `visual_standards.md`, `api_client.md` (tipos `EVMSummary`)

---

## 1. Propósito

Responder las tres preguntas fundamentales del gerente de proyecto en un solo vistazo con una jerarquía visual de alto nivel:
¿Estamos gastando más de lo previsto? ¿Vamos tarde? ¿Cuánto nos costará terminar?
Se implementa como una sección de **widgets destacados** con micro-visualizaciones de tendencia y botones de acción rápida.

---

## 2. Props

```ts
interface ProjectKPIsProps {
  // Datos del resumen EVM del proyecto — viene de ProjectWithEVM.evm_summary
  evm: EVMSummary

  // Estado de carga — muestra skeleton cuando true
  isLoading?: boolean   // default: false
}
```

---

## 3. Estados Internos

```ts
// Controla visibilidad del panel de diagnóstico
const [isDetailOpen, setIsDetailOpen] = useState(false)
```

Un solo estado interno. Se inicializa en `false` (panel colapsado por defecto).  
Se persiste en `localStorage` bajo la clave `'evm-kpi-detail-open'` para recordar la preferencia del usuario entre sesiones.

---

## 4. Anatomía Visual

```
│  ╚═══════════════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Especificación por Sección

### 5.1 Cabecera — Badges de Estado

Dos instancias de `HealthBadge` a la izquierda y botones de acción a la derecha.

- **Badges**: `size="md"`, `gap-3`.
- **Botones de Acción**:
    - `[Simular Costos]`: Variante Secondary, icono `Play`.
    - `[Generar Reporte]`: Variante Secondary, icono `FileText`.
- **Layout**: `flex justify-between items-center w-full mb-6`.

### 5.2 Cuerpo Principal — Widgets de Alto Nivel

Tres tarjetas independientes con estilo de **Card Elevada** (`visual_standards.md §6.1`).

Cada widget (CPI, SPI) incluye:

| Elemento | Estilo | Detalle |
|---|---|---|
| Valor | `text-kpi-xl` | Número gigante en DM Mono. |
| Mini-Trend | Recharts `AreaChart` | Micro-gráfica de 60px de alto con la evolución de la última semana. |
| Label | `text-label` | Nombre del índice en Geist 500 desaturado. |

- **Color de la línea de tendencia**: Mismo color que el valor numérico según el semáforo (§5.2).
- **EAC Widget**: No tiene gráfica de tendencia, se enfoca en la magnitud del número.

**Formato de cada valor:**

| KPI | Formato | Null |
|---|---|---|
| CPI | 2 decimales fijos: `"0.75"` | `"—"` |
| SPI | 2 decimales fijos: `"0.83"` | `"—"` |
| EAC | Moneda con miles y 2 decimales: `"$125,000.00"` | `"—"` |

**Color del valor numérico según umbral:**

| KPI | Condición | Color |
|---|---|---|
| CPI | `>= 0.95` | `--health-green` |
| CPI | `>= 0.85` | `--health-yellow` |
| CPI | `>= 0.70` | `--health-orange` |
| CPI | `< 0.70` | `--health-red` |
| CPI | `null` | `--text-disabled` |
| SPI | Mismos umbrales que CPI | Ídem |
| EAC | Siempre | `--text-primary` — EAC es un valor absoluto, no tiene semáforo propio |

> **Racional:** EAC no tiene color de semáforo porque no hay un umbral universal de "malo" — depende del BAC del proyecto. Su interpretación la aportan CPI y los badges de la cabecera.

### 5.3 Toggle del Panel de Diagnóstico

Botón tipo `Ghost` (ver `visual_standards.md §6.2`) alineado a la izquierda, ancho completo en móvil.

```
Estado cerrado:  [chevron-down]  "Ver diagnóstico detallado"
Estado abierto:  [chevron-up]    "Ocultar diagnóstico"
```

- Fuente: `text-body` Geist, color `--text-secondary`
- El ícono es `ChevronDown` / `ChevronUp` de `lucide-react`
- Transición de apertura: `transition-all duration-200` con `max-height` animado

Utiliza el concepto de **Glassmorphism** (`visual_standards.md §6.2`) para superponerse ligeramente al dashboard.

- **Fondo**: `bg-[--glass-bg]` con `backdrop-blur-md`.
- **Borde**: `border-[--glass-border]`.
- **Sombra**: `shadow-xl`.
- **Animación**: Aparece con un ligero fade y escala (`scale-95` -> `scale-100`).

Seis indicadores en pares de dos columnas:

| Columna izquierda | Columna derecha |
|---|---|
| PV — Valor Planificado | EV — Valor Ganado |
| AC — Costo Real | CV — Variación de Costo |
| SV — Variación de Cronograma | VAC — Variación a la Finalización |

Cada indicador en el panel muestra:
- Label: `text-caption` Geist, `--text-secondary`, con nombre corto + nombre completo entre paréntesis
- Valor: `text-kpi-sm` DM Mono, `--text-primary`
- CV, SV y VAC coloreados: positivo → `--health-green`, negativo → `--health-red`, cero → `--text-primary`

**Formato de todos los valores del panel:** moneda con miles y 2 decimales (igual que EAC).  
**Null:** `"—"` en todos los campos.

---

## 6. Comportamiento

- Al montar el componente, leer `localStorage['evm-kpi-detail-open']` y setear `isDetailOpen` con ese valor
- Al cambiar `isDetailOpen`, guardar el nuevo valor en `localStorage`
- Al recibir nuevas props (proyecto cambia), **no** resetear `isDetailOpen` — respetar la preferencia del usuario
- Si `isLoading = true`, renderizar el skeleton (ver §7)

---

## 7. Render Condicional

### Loading (isLoading = true)

Mostrar skeleton que replica exactamente la forma del componente real:

```
Cabecera:  2 rectángulos redondeados de ~80px × 28px (badges)
KPIs:      3 bloques de 40px × 60px en grid de 3 columnas
Toggle:    1 línea de 160px × 16px
```

Todos con `animate-pulse bg-[--bg-elevated] rounded`.  
El panel de diagnóstico no se incluye en el skeleton.

### Con datos (isLoading = false)

Render completo descrito en §5.  
Si cualquier valor individual es `null`, mostrar `"—"` en ese campo — no ocultar el widget completo.

### evm_summary con todos los campos null

Ocurre cuando el proyecto no tiene actividades. Mostrar el componente completo con todos los valores en `"—"` y los badges en estado `'sin datos'`. No mostrar un empty state — el componente `ProjectKPIs` no es responsable de ese mensaje.

---

## 8. Casos Borde Visuales

| Caso | Comportamiento |
|---|---|
| EAC con valor muy grande (ej: `$12,500,000.00`) | El valor no se trunca — el widget se expande. En móvil, reducir a `text-kpi-lg` si supera 10 caracteres |
| CV o SV exactamente en `0` | Color `--text-primary` (neutro), no verde ni rojo |
| CPI exactamente en `1.00` | Color `--health-green` (>= 0.95) |
| Panel abierto + cambio de proyecto | Panel permanece abierto — el usuario lo prefirió así |
| Valor `null` en CPI/SPI | El widget muestra `"—"` en `--text-disabled`. No hay color de semáforo |

---

## 9. Dependencias

| Dependencia | Uso |
|---|---|
| `HealthBadge` | Cabecera — dos instancias para cost y schedule |
| `lucide-react` | `ChevronDown`, `ChevronUp` en el toggle |
| `visual_standards.md §3.2` | Escala tipográfica `text-kpi-xl`, `text-kpi-sm`, `text-label` |
| `visual_standards.md §4.2–4.4` | Formato de índices y moneda |
| `visual_standards.md §7` | Skeleton en estado de carga |
| `api_client.md §2.1` | Tipo `EVMSummary` |

No consume hooks directamente — recibe `evm` y `isLoading` por props.  
El padre (`Dashboard`) es quien llama a `useProject` y pasa los datos.

---

## 10. Pruebas Requeridas

| Test | Qué verifica |
|---|---|
| Render con datos completos | CPI, SPI y EAC visibles con formato correcto |
| Color CPI < 0.70 | Clase de color rojo en el valor numérico |
| Color CPI >= 0.95 | Clase de color verde en el valor numérico |
| EAC siempre en `--text-primary` | Sin clase de color semáforo en EAC |
| Toggle abre el panel | Click en botón → panel de diagnóstico visible en DOM |
| Toggle persiste en localStorage | Tras click, `localStorage['evm-kpi-detail-open']` = `'true'` |
| Estado reabierto desde localStorage | Al montar con localStorage en `'true'`, panel visible sin click |
| Todos los valores null | Muestra `"—"` en cada campo, badges en estado `'sin datos'` |
| isLoading = true | Skeleton visible, ningún valor numérico en el DOM |
| CV negativo en rojo, positivo en verde | Clases correctas según signo del valor |
| Snapshot abierto y cerrado | 2 snapshots: panel colapsado / panel expandido |