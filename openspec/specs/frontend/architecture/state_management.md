# state_management.md — Especificación de Estado
> EVM Tracker · Frontend Specs · v1.0  
> Define dónde vive cada dato, cómo fluye y cuándo se actualiza.  
> Depende de: `api_client.md` (funciones y tipos), `visual_standards.md` (estados de carga y error)

---

## 1. Decisión de Arquitectura

**Librería seleccionada: TanStack Query v5 (React Query)**

### Racional

El estado de esta aplicación es fundamentalmente **estado del servidor**: proyectos y actividades viven en el backend, los indicadores EVM se calculan allí, y el frontend es una vista sincronizada de esos datos. TanStack Query es la herramienta diseñada exactamente para este caso.

| Necesidad del proyecto | Cómo la resuelve TanStack Query |
|---|---|
| Dashboard recarga datos tras crear/editar actividad | `invalidateQueries` en `onSuccess` de mutación |
| Skeleton mientras carga el proyecto | `isLoading` y `isFetching` por query |
| Mostrar datos anteriores mientras recarga | `staleTime` + `placeholderData: keepPreviousData` |
| Manejo de errores sin código repetido | `isError` + `error` por query |
| Evitar llamadas duplicadas al mismo endpoint | Deduplicación automática por `queryKey` |

**No se usa Zustand ni Context para datos del servidor.** Si en el futuro se necesita estado global de UI puro (ej: tema activo, sidebar abierto), se puede añadir Zustand o Context sin conflicto.

---

## 2. Configuración del QueryClient

Archivo: `src/lib/queryClient.ts`

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,        // 30 segundos — los datos son "frescos" por 30s
      gcTime: 1000 * 60 * 5,       // 5 minutos en caché inactivo
      retry: 1,                    // 1 reintento automático en caso de error de red
      refetchOnWindowFocus: false, // No recargar al volver a la pestaña (datos EVM son estables)
    },
    mutations: {
      retry: 0,                    // Las mutaciones no se reintentan — podrían duplicar datos
    },
  },
})
```

El `QueryClient` se instancia una sola vez en `main.tsx` y se pasa al `QueryClientProvider` que envuelve toda la app.

---

## 3. Query Keys

Todas las query keys se definen en `src/lib/queryKeys.ts` como constantes. Nunca se escriben strings inline en los componentes.

```ts
export const queryKeys = {
  // Lista de proyectos (sin EVM)
  projects: {
    all: ['projects'] as const,
  },

  // Proyecto individual con actividades + EVM completo
  project: {
    detail: (projectId: string) => ['projects', projectId] as const,
  },
} as const
```

### Jerarquía de invalidación

La jerarquía es importante: invalidar `['projects', projectId]` invalida solo ese proyecto. Invalidar `['projects']` invalida tanto la lista como todos los detalles.

```
['projects']                    ← lista de proyectos
['projects', projectId]         ← detalle de un proyecto (con actividades + EVM)
```

---

## 4. Estado del Servidor — Queries

### 4.1 Lista de Proyectos

**Hook:** `useProjects`  
**Archivo:** `src/hooks/useProjects.ts`  
**Cuándo se usa:** Sidebar de selección de proyecto, página de listado

```ts
function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => listProjects(),  // de api_client.ts
  })
}

// Retorna:
// data:       ProjectResponse[] | undefined
// isLoading:  true en la primera carga (sin datos en caché)
// isFetching: true en cualquier recarga (incluyendo background)
// isError:    true si la llamada falló
// error:      ApiError | null
```

### 4.2 Proyecto con EVM (endpoint principal del dashboard)

**Hook:** `useProject`  
**Archivo:** `src/hooks/useProject.ts`  
**Cuándo se usa:** Dashboard — renderiza KPIs, tabla de actividades y gráfica

```ts
function useProject(projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.project.detail(projectId!),
    queryFn: () => getProject(projectId!),  // de api_client.ts
    enabled: projectId !== null,            // No ejecutar si no hay proyecto seleccionado
    placeholderData: keepPreviousData,      // Mostrar datos anteriores mientras recarga
  })
}

// Retorna:
// data:       ProjectWithEVM | undefined
// isLoading:  true en la primera carga de este projectId
// isFetching: true en recargas posteriores (mostrar spinner sutil, no skeleton)
// isError:    true si la llamada falló
// error:      ApiError | null
```

> **Regla de render:** Si `isLoading === true` → mostrar skeleton completo del dashboard.  
> Si `isFetching === true` pero `data` existe → mostrar datos actuales + spinner sutil en esquina.  
> Si `isError === true` → mostrar error state (ver `visual_standards.md §8`).

---

## 5. Estado del Servidor — Mutaciones

Todas las mutaciones invalidan las queries afectadas en `onSuccess` para que el dashboard se actualice automáticamente.

### 5.1 Proyectos

**Hook:** `useCreateProject`  
**Archivo:** `src/hooks/useCreateProject.ts`

```
Acción exitosa → invalida queryKeys.projects.all
Efecto: la lista de proyectos se recarga en background
```

**Hook:** `useUpdateProject`  
**Archivo:** `src/hooks/useUpdateProject.ts`

```
Acción exitosa → invalida queryKeys.project.detail(projectId)
                  invalida queryKeys.projects.all
Efecto: el detalle del proyecto y la lista se recargan
```

**Hook:** `useDeleteProject`  
**Archivo:** `src/hooks/useDeleteProject.ts`

```
Acción exitosa → invalida queryKeys.projects.all
                  elimina queryKeys.project.detail(projectId) del caché
Efecto: la lista se recarga; el detalle eliminado no queda en memoria
```

### 5.2 Actividades

**Hook:** `useCreateActivity`  
**Archivo:** `src/hooks/useCreateActivity.ts`

```
Acción exitosa → invalida queryKeys.project.detail(projectId)
Efecto: el dashboard recarga el proyecto completo con EVM recalculado
```

**Hook:** `useUpdateActivity`  
**Archivo:** `src/hooks/useUpdateActivity.ts`

```
Acción exitosa → invalida queryKeys.project.detail(projectId)
Efecto: ídem — EVM del proyecto y de la actividad se actualizan
```

**Hook:** `useDeleteActivity`  
**Archivo:** `src/hooks/useDeleteActivity.ts`

```
Acción exitosa → invalida queryKeys.project.detail(projectId)
Efecto: la actividad desaparece de la tabla; EVM del proyecto recalculado
```

### 5.3 Estructura de cada hook de mutación

Todos los hooks de mutación siguen este patrón:

```ts
function useCreateActivity(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ActivityCreate) => createActivity(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.project.detail(projectId),
      })
    },
    // onError: el componente lo maneja — ver §6
  })
}

// El hook retorna (de useMutation):
// mutate / mutateAsync: función para ejecutar la mutación
// isPending:            true mientras la llamada está en vuelo
// isError:              true si falló
// error:                ApiError | null
// isSuccess:            true si completó exitosamente
```

---

## 6. Estado Local (useState)

El estado local vive en el componente que lo necesita. No se eleva a Context ni a TanStack Query.

| Estado | Tipo | Vive en | Descripción |
|---|---|---|---|
| `selectedProjectId` | `string \| null` | `App.tsx` o layout raíz | ID del proyecto activo en el dashboard |
| Campos del formulario de actividad | `ActivityCreate \| ActivityUpdate` | `ActivityForm` | Valores de los inputs mientras el usuario escribe |
| `isFormOpen` | `boolean` | `ActivityForm` o su padre directo | Controla visibilidad del modal/panel del formulario |
| `activityToEdit` | `ActivityResponse \| null` | Padre de `ActivityForm` | Si es `null`, el form es de creación; si tiene valor, es edición |
| `activityToDelete` | `ActivityResponse \| null` | Padre del diálogo de confirmación | Actividad pendiente de confirmar eliminación |

### Regla de elevación

Un estado sube al padre solo si **dos o más componentes hermanos** lo necesitan.  
`selectedProjectId` es el único estado que puede necesitar elevarse a nivel de layout, porque tanto el sidebar como el dashboard lo consumen.

---

## 7. Flujos de Actualización Completos

### 7.1 Usuario crea una actividad

```
1. Usuario llena ActivityForm y presiona "Guardar"
2. ActivityForm llama mutate(data) del hook useCreateActivity
3. isPending = true → botón muestra spinner + "Guardando…", inputs deshabilitados
4. API responde 201 → onSuccess se ejecuta
5. queryClient.invalidateQueries(['projects', projectId])
6. useProject detecta la query invalidada → isFetching = true
7. Spinner sutil aparece en el dashboard (datos anteriores siguen visibles)
8. GET /api/v1/projects/{projectId} se ejecuta en background
9. Respuesta llega → data se actualiza → tabla y KPIs re-renderizan con nuevos valores EVM
10. isFormOpen = false → formulario se cierra
```

### 7.2 Usuario edita una actividad

```
1. Usuario hace click en "Editar" en una fila de la tabla
2. activityToEdit = ActivityResponse de esa fila
3. ActivityForm se abre con los valores precargados
4. Usuario modifica campos y presiona "Guardar"
5. Igual que §7.1 desde paso 2, usando useUpdateActivity
```

### 7.3 Usuario elimina una actividad

```
1. Usuario hace click en "Eliminar" en una fila
2. activityToDelete = ActivityResponse de esa fila
3. Diálogo de confirmación aparece ("¿Eliminar esta actividad? Esta acción es irreversible.")
4. Usuario confirma → mutate(activityId) del hook useDeleteActivity
5. isPending = true → botón "Eliminar" del diálogo muestra spinner
6. API responde 204 → onSuccess invalida ['projects', projectId]
7. Dashboard recarga → actividad desaparece de tabla → EVM recalculado
8. activityToDelete = null → diálogo se cierra
```

### 7.4 Usuario elimina un proyecto

```
1. Usuario hace click en "Eliminar proyecto"
2. Diálogo de confirmación: "¿Eliminar este proyecto y todas sus actividades? Esta acción es irreversible."
3. Usuario confirma → useDeleteProject.mutate(projectId)
4. API responde 204 → selectedProjectId = null → queryCache limpia el detalle
5. Dashboard muestra empty state de "Sin proyecto seleccionado"
6. Lista de proyectos se recarga en background
```

### 7.5 Error en mutación

```
1. Cualquier mutación falla → isError = true, error = ApiError
2. El componente captura error en el render y muestra banner de error (visual_standards.md §8)
3. El formulario permanece abierto con los datos que el usuario ingresó
4. Usuario puede corregir y reintentar, o cerrar el formulario
5. Al cerrar el formulario, el error se limpia (reset del estado local)
```

---

## 8. Lo que TanStack Query NO maneja

Estos estados son explícitamente locales y no deben moverse a queries ni a estado global:

- Estado de los inputs de un formulario — usar `useState` o `react-hook-form`
- Visibilidad de modales y paneles
- El proyecto seleccionado — es navegación/UI, no datos del servidor
- Mensajes de error de validación de formulario (campo por campo)

---

## 9. Estructura de Archivos

```
src/
├── lib/
│   ├── queryClient.ts          ← Instancia y configuración del QueryClient
│   └── queryKeys.ts            ← Todas las query keys como constantes
└── hooks/
    ├── useProjects.ts          ← Query: lista de proyectos
    ├── useProject.ts           ← Query: proyecto con EVM (dashboard)
    ├── useCreateProject.ts     ← Mutación: crear proyecto
    ├── useUpdateProject.ts     ← Mutación: actualizar proyecto
    ├── useDeleteProject.ts     ← Mutación: eliminar proyecto
    ├── useCreateActivity.ts    ← Mutación: crear actividad
    ├── useUpdateActivity.ts    ← Mutación: actualizar actividad
    └── useDeleteActivity.ts    ← Mutación: eliminar actividad
```

Un archivo por hook. Los hooks de query y mutación no se mezclan en el mismo archivo.

---

## 10. Pruebas Requeridas

Los tests usan `@tanstack/react-query` con un `QueryClient` de test y `msw` para mockear el API.

| Test | Qué verifica |
|---|---|
| `useProjects — carga exitosa` | `data` contiene la lista, `isLoading` pasa a `false` |
| `useProject — habilitado solo con projectId` | Con `null` no ejecuta fetch; con ID sí |
| `useProject — placeholder data` | Mientras recarga, muestra datos anteriores |
| `useCreateActivity — invalida query` | Tras `mutate`, `useProject` se refetch |
| `useDeleteActivity — invalida query` | Ídem |
| `useCreateProject — error 422` | `error.status === 422`, `data` es `undefined` |
| `useDeleteProject — limpia caché` | El detalle del proyecto ya no está en caché tras éxito |