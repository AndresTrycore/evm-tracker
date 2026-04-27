# activity_form.md — Especificación de Componente
> EVM Tracker · Frontend Specs · v1.0  
> Depende de: `visual_standards.md`, `api_client.md` (tipos `ActivityCreate`, `ActivityUpdate`, `ActivityResponse`)  
> Consume: `useCreateActivity`, `useUpdateActivity` de `state_management.md`

---

## 1. Propósito

Permitir al usuario crear una nueva actividad (modal) o editar una existente
(panel lateral), con validación en tiempo real campo por campo y feedback
claro del resultado de la operación.

---

## 2. Dos Modos, Un Componente

`ActivityForm` es un único componente que se comporta de forma diferente
según la prop `activity`:

| Prop `activity` | Modo | Contenedor | Título | Botón CTA |
|---|---|---|---|---|
| `null` | **Creación** | Modal centrado | `"Nueva actividad"` | `"Crear actividad"` |
| `ActivityResponse` | **Edición** | Panel lateral derecho | `"Editar actividad"` | `"Guardar cambios"` |

El componente no decide su propio contenedor — el contenedor (modal o panel)
es parte del render del componente y se activa según el modo.

---

## 3. Props

```ts
interface ActivityFormProps {
  // Proyecto al que pertenece la actividad
  projectId: string

  // null = modo creación / ActivityResponse = modo edición
  activity: ActivityResponse | null

  // Controla visibilidad desde el padre
  isOpen: boolean

  // Llamado al cerrar (cancelar, click fuera, ESC, éxito)
  onClose: () => void
}
```

---

## 4. Estados Internos

```ts
// Valores actuales de los campos del formulario
const [fields, setFields] = useState<FormFields>(initialValues)

// Errores de validación por campo — solo los campos tocados muestran error
const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({})
```

```ts
type FormFields = {
  name:                  string
  budget_at_completion:  string   // string — el input es texto, se convierte a number al enviar
  planned_progress:      string   // string — ídem
  actual_progress:       string   // string — ídem
  actual_cost:           string   // string — ídem
}
```

> **Nota:** Los campos numéricos se manejan como `string` en el estado del formulario
> para evitar problemas con inputs vacíos y el teclado del usuario.
> La conversión a `number` ocurre solo en el momento de construir el payload para la API.

### Valores iniciales según modo

```ts
// Modo creación
const initialValuesCreate: FormFields = {
  name: '',
  budget_at_completion: '',
  planned_progress: '',
  actual_progress: '',
  actual_cost: '',
}

// Modo edición — precarga los valores de la actividad existente
const initialValuesEdit = (activity: ActivityResponse): FormFields => ({
  name: activity.name,
  budget_at_completion: String(activity.budget_at_completion),
  planned_progress:     String(activity.planned_progress),
  actual_progress:      String(activity.actual_progress),
  actual_cost:          String(activity.actual_cost),
})
```

Cuando cambia la prop `activity` (el usuario abre otra actividad para editar),
el formulario se reinicia con los nuevos valores — usar `useEffect` sobre `activity`.

---

## 5. Campos del Formulario

| Campo | Label | Tipo input | Placeholder | Unidad |
|---|---|---|---|---|
| `name` | `Nombre de la actividad` | `text` | `"Ej: Diseño de interfaz"` | — |
| `budget_at_completion` | `Presupuesto (BAC)` | `number` | `"0.00"` | `$` prefijo |
| `planned_progress` | `Avance planificado` | `number` | `"0"` | `%` sufijo |
| `actual_progress` | `Avance real` | `number` | `"0"` | `%` sufijo |
| `actual_cost` | `Costo real (AC)` | `number` | `"0.00"` | `$` prefijo |

### Orden visual de los campos

```
1. Nombre de la actividad          (ancho completo)
2. Presupuesto (BAC)               (mitad izquierda)   Costo real (AC)    (mitad derecha)
3. Avance planificado              (mitad izquierda)   Avance real        (mitad derecha)
```

El grid de 2 columnas agrupa los campos relacionados semánticamente:
presupuesto junto a costo, avance plan junto a avance real.

---

## 6. Validación en Tiempo Real (onChange)

La validación se activa en cada campo al cumplirse **ambas** condiciones:
1. El campo fue tocado al menos una vez (`touched[field] = true`, se activa en `onBlur`)
2. El valor actual no cumple alguna regla

El error se limpia en tiempo real cuando el valor vuelve a ser válido.

### Reglas por campo

| Campo | Regla | Mensaje de error |
|---|---|---|
| `name` | No vacío después de trim | `"El nombre es obligatorio"` |
| `name` | Máximo 200 caracteres | `"Máximo 200 caracteres"` |
| `budget_at_completion` | No vacío | `"El presupuesto es obligatorio"` |
| `budget_at_completion` | Número válido >= 0 | `"Debe ser un número mayor o igual a 0"` |
| `planned_progress` | No vacío | `"El avance planificado es obligatorio"` |
| `planned_progress` | Número entre 0 y 100 | `"Debe estar entre 0 y 100"` |
| `actual_progress` | No vacío | `"El avance real es obligatorio"` |
| `actual_progress` | Número entre 0 y 100 | `"Debe estar entre 0 y 100"` |
| `actual_cost` | No vacío | `"El costo real es obligatorio"` |
| `actual_cost` | Número válido >= 0 | `"Debe ser un número mayor o igual a 0"` |

### Presentación del error

- Texto en `text-caption` color `--health-red`, debajo del campo
- El borde del input cambia a `border-[--health-red]` mientras el error esté activo
- El mensaje aparece con transición suave `transition-opacity duration-150`
- Solo se muestra **un error por campo** a la vez — el primero que aplique

### Contador de caracteres en `name`

Debajo del input de nombre, alineado a la derecha:

```
"142 / 200"   ← color --text-disabled cuando < 180
"195 / 200"   ← color --health-yellow cuando >= 180
"200 / 200"   ← color --health-red cuando = 200
```

---

## 7. Comportamiento del Botón CTA

El botón principal ("Crear actividad" / "Guardar cambios") está:

- **Habilitado** cuando: todos los campos tienen valor y no hay errores de validación activos
- **Deshabilitado** cuando: hay algún campo vacío o con error — con `opacity-50 cursor-not-allowed`
- **En progreso** cuando: `isPending = true` → muestra spinner inline + texto `"Guardando…"`, deshabilitado

Al hacer click, antes de llamar a la mutación:
1. Marcar todos los campos como `touched` para mostrar todos los errores de una vez
2. Re-validar todos los campos
3. Si hay errores → no llamar a la API, hacer foco en el primer campo inválido
4. Si no hay errores → construir payload y llamar a `mutate`

---

## 8. Contenedores

### 8.1 Modal — Modo Creación

```
┌─────────────────── Overlay ───────────────────────┐
│  bg-black/60 backdrop-blur-sm                     │
│  fixed inset-0 z-50 flex items-center justify-center│
│                                                    │
│  ┌──────────── Modal Card ─────────────────────┐  │
│  │  bg-[--bg-surface] rounded-lg               │  │
│  │  border border-[--border]                   │  │
│  │  w-full max-w-lg p-6                        │  │
│  │                                             │  │
│  │  [X]  Nueva actividad              ← header │  │
│  │  ─────────────────────────────────          │  │
│  │  [campos del formulario]                    │  │
│  │  ─────────────────────────────────          │  │
│  │  [Cancelar]        [Crear actividad]← footer│  │
│  └─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

- Click en overlay → cierra (llama `onClose`)
- Tecla `ESC` → cierra
- El modal no se cierra si `isPending = true` (evitar mutación incompleta)
- Animación de entrada: `scale-95 opacity-0` → `scale-100 opacity-100`, `duration-150`

### 8.2 Panel Lateral — Modo Edición

```
┌─── App Layout ──────────────────────────────────────────┐
│                                          ┌── Panel ───┐ │
│  [Dashboard content]                     │ bg-surface  │ │
│  (no se desplaza ni oscurece)            │ border-l    │ │
│                                          │ border-border│ │
│                                          │ w-96 h-full │ │
│                                          │ fixed right-0│ │
│                                          │ top-0 z-40  │ │
│                                          │             │ │
│                                          │ [X] Editar  │ │
│                                          │ ─────────── │ │
│                                          │ [campos]    │ │
│                                          │ ─────────── │ │
│                                          │ [Cancelar]  │ │
│                                          │ [Guardar]   │ │
│                                          └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

- El dashboard sigue visible y **no** se bloquea — el usuario puede ver los valores actuales mientras edita
- Animación de entrada: `translate-x-full` → `translate-x-0`, `duration-200 ease-out`
- Tecla `ESC` → cierra
- Click fuera del panel (en el dashboard) → **no cierra** — el usuario puede estar comparando datos
- Para cerrar: botón `[X]` o botón `[Cancelar]`
- En móvil: el panel ocupa el 100% del ancho de la pantalla

---

## 9. Flujo Completo por Modo

### Creación (Modal)

```
1. Usuario hace click en "Agregar actividad" en el dashboard
2. isOpen = true, activity = null → modal aparece con campos vacíos
3. Usuario llena campos → validación onChange activa por campo (tras primer blur)
4. Usuario presiona "Crear actividad"
5. isPending = true → botón muestra "Guardando…"
6. API responde 201 → onSuccess:
   a. queryClient.invalidateQueries(['projects', projectId])
   b. onClose() → modal se cierra
   c. Dashboard actualiza con la nueva actividad y EVM recalculado
7. Si API responde error → banner de error encima del footer del modal (ver §10)
```

### Edición (Panel Lateral)

```
1. Usuario hace click en "Editar" en una fila de ActivityTable
2. isOpen = true, activity = ActivityResponse → panel se desliza con valores precargados
3. Usuario modifica uno o más campos → validación onChange activa
4. Usuario presiona "Guardar cambios"
5. isPending = true → botón muestra "Guardando…"
6. API responde 200 → onSuccess:
   a. queryClient.invalidateQueries(['projects', projectId])
   b. onClose() → panel se cierra
   c. Dashboard actualiza con nuevos valores EVM
7. Si API responde error → banner de error encima del footer del panel (ver §10)
```

---

## 10. Manejo de Errores del API

Cuando la mutación falla, mostrar un banner de error entre los campos y el footer:

```
┌─────────────────────────────────────────────────────┐
│  ⚠  Hay campos con errores. Revisa el formulario.   │
│     (o el mensaje exacto del campo detail del API)  │
└─────────────────────────────────────────────────────┘
```

- Fondo `--health-red` bg-subtle, borde `--health-red`, ícono `AlertTriangle`
- El formulario **permanece abierto** con los datos que el usuario ingresó
- El banner se limpia automáticamente cuando el usuario empieza a editar cualquier campo
- El banner también se limpia al cerrar el formulario

---

## 11. Render Condicional

| Condición | Comportamiento |
|---|---|
| `isOpen = false` | No renderizar nada (o renderizar con `display:none` para preservar estado de animación) |
| `isPending = true` | Botón CTA deshabilitado con spinner, inputs deshabilitados, `[X]` deshabilitado |
| `activity` cambia mientras el panel está abierto | Reiniciar `fields` y `touched` con nuevos valores |
| Error de API presente | Banner de error visible, resto del formulario intacto |

---

## 12. Casos Borde Visuales

| Caso | Comportamiento |
|---|---|
| Campo numérico con valor `"0"` | Es válido — `0` es un número >= 0 |
| Pegar texto en campo numérico | Si no es parseable como número, mostrar error de validación |
| `planned_progress = 100` y `actual_progress = 100` | Válido — ambos en límite superior |
| Nombre con solo espacios | `trim()` antes de validar → mostrar error "El nombre es obligatorio" |
| Panel lateral + modal abiertos simultáneamente | Imposible por diseño — el padre nunca abre ambos a la vez |
| Cerrar panel con cambios sin guardar | No mostrar diálogo de confirmación — el usuario elige cancelar conscientemente |

---

## 13. Dependencias

| Dependencia | Uso |
|---|---|
| `useCreateActivity` | Mutación en modo creación |
| `useUpdateActivity` | Mutación en modo edición |
| `lucide-react` | `X`, `AlertTriangle`, íconos de los inputs con unidad |
| `visual_standards.md §6.3` | Estilos de inputs y mensajes de error |
| `visual_standards.md §6.2` | Estilos de botones Primary y Secondary |
| `visual_standards.md §8` | Banner de error del API |
| `api_client.md §2.1` | Tipos `ActivityCreate`, `ActivityUpdate`, `ActivityResponse` |

---

## 14. Pruebas Requeridas

| Test | Qué verifica |
|---|---|
| Render modal con `activity = null` | Título "Nueva actividad", campos vacíos, botón "Crear actividad" |
| Render panel con `activity` existente | Título "Editar actividad", campos precargados con valores de la actividad |
| Botón CTA deshabilitado con campos vacíos | `disabled` presente en el DOM al montar en modo creación |
| Validación `name` vacío tras blur | Mensaje "El nombre es obligatorio" visible |
| Validación `planned_progress` > 100 | Mensaje "Debe estar entre 0 y 100" visible |
| Validación se limpia al corregir | Error desaparece cuando el valor vuelve a ser válido |
| Contador de caracteres cambia de color | Clase amarilla cuando name.length >= 180 |
| Botón CTA activo cuando formulario válido | `disabled` ausente cuando todos los campos son correctos |
| Click CTA con formulario válido llama mutación | `useCreateActivity.mutate` llamado con payload correcto |
| Payload construido correctamente | Campos string convertidos a number antes de enviar |
| `isPending = true` deshabilita inputs y botón | Inputs y botón con `disabled` durante mutación |
| Éxito cierra el contenedor | `onClose` llamado tras mutación exitosa |
| Error de API muestra banner | Banner con mensaje del API visible, formulario intacto |
| Banner se limpia al editar un campo | Banner desaparece en el siguiente `onChange` |
| ESC cierra el modal | `onClose` llamado al presionar `Escape` |
| ESC no cierra el panel lateral | Panel permanece abierto — solo se cierra con botón |
| `activity` cambia → campos se reinician | Nuevos valores de la otra actividad cargados en `fields` |