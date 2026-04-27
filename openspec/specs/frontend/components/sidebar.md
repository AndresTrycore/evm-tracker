# sidebar.md — Especificación de Componente
> EVM Tracker · Frontend Specs · v1.0  
> Depende de: `visual_standards.md`, `state_management.md` (hook `useProjects`)

---

## 1. Propósito

Gestionar la navegación principal entre proyectos y permitir la creación rápida de nuevos proyectos. Es el ancla persistente de la aplicación que mantiene el contexto global del proyecto seleccionado.

---

## 2. Props

```ts
interface SidebarProps {
  // ID del proyecto seleccionado actualmente
  selectedProjectId: string | null

  // Callback cuando el usuario selecciona un proyecto
  onSelectProject: (id: string) => void

  // Estado de carga de la lista de proyectos
  isLoading?: boolean
}
```

---

## 3. Anatomía Visual

```
┌──────────────────────────┐
│  BRAND / LOGO            │
│  EVM Tracker             │
├──────────────────────────┤
│  BÚSQUEDA                │
│  [🔍 Buscar proyecto...] │
├──────────────────────────┤
│  LISTA DE PROYECTOS      │
│  (scrollable)            │
│                          │
│  ● Proyecto Alpha      [X]│  ← Item activo
│  ○ Proyecto Beta       [X]│  ← Item inactivo
│  ○ Proyecto Gamma      [X]│
│                          │
├──────────────────────────┤
│  ACCIONES                │
│  [+ Nuevo Proyecto]      │
└──────────────────────────┘
```

---

## 4. Comportamiento

### 4.1 Selección y Navegación
- Al hacer click en un proyecto, se dispara `onSelectProject(id)`.
- El item seleccionado usa el token `--bg-elevated` y el texto `--accent` para destacar.
- Si la lista está cargando (`isLoading`), mostrar 5 filas de skeletons rectangulares.

### 4.2 Búsqueda Local
- Un input de búsqueda filtra la lista de proyectos en tiempo real (case-insensitive).
- Si no hay coincidencias, mostrar "No se encontraron proyectos".

### 4.3 Eliminación de Proyecto
- Cada item tiene un botón de eliminación (`X` o `Trash`) que solo aparece al hacer hover sobre el item.
- Al hacer click, debe disparar un diálogo de confirmación (ver `state_management.md §7.4`).

---

## 5. Diseño Visual (Tailwind)

- **Contenedor**: `w-64 h-screen bg-[--bg-surface] border-r border-[--border] flex flex-col`.
- **Items**: `flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-[--bg-elevated] cursor-pointer`.
- **Input de Búsqueda**: `bg-[--bg-elevated] border-[--border] rounded-md px-3 py-1.5 mx-4 my-2`.

---

## 6. Responsividad

- En desktop (md+): Permanente a la izquierda.
- En mobile (<md): Oculto por defecto. Se abre mediante un "Hamburguer menu" en el header, cubriendo parte de la pantalla con un overlay.

---

## 7. Dependencias

| Dependencia | Uso |
|---|---|
| `lucide-react` | `Plus`, `Search`, `Trash2`, `Folder` |
| `visual_standards.md` | Colores de superficie y bordes. |
| `useProjects` | Hook que provee la data (en el componente padre Dashboard). |
