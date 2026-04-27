# dashboard.md — Especificación de Página
> EVM Tracker · Frontend Specs · v1.0  
> Define la página principal de la aplicación donde se visualizan los indicadores EVM y se gestionan las actividades.

---

## 1. Estructura de la Página

El Dashboard sigue un layout de dos paneles: un sidebar lateral para navegación de proyectos y un área de contenido principal para la visualización de datos.

### 1.1 Layout (Wireframe)

```
┌──────────────────────────────────────────────────────────┐
│  SIDEBAR          │  CONTENIDO PRINCIPAL (Elevated UI)    │
│  [EVM Tracker]    │                                      │
│                   │  [Título del Proyecto] [Tema] [Actions] │
│  BUSCAR PROYECTO  │  ──────────────────────────────────  │
│  [        ]       │                                      │
│                   │  [ High-Level KPI Widgets ]          │
│  LISTA PROYECTOS  │  (CPI, SPI, EAC con tendencias)      │
│  - Proyecto A [X] │                                      │
│  - Proyecto B [X] │  [ EVM Visualizations Panel ]        │
│  - Proyecto C [X] │  (S-Curve, Radar, Donut, Bars)       │
│                   │                                      │
│  [+ Nuevo Proy]   │  [ Activity Table Section ]          │
│                   │  (Listado, Búsqueda, Filtros)        │
└───────────────────┴──────────────────────────────────────┘
```

---

## 2. Composición de Componentes

La página orquesta los siguientes componentes:

1.  **Sidebar**: Gestión de la lista de proyectos y selección del proyecto activo (`selectedProjectId`).
2.  **Header**: Muestra el nombre del proyecto actual, botones de acción (Simular, Reporte) y el toggle de tema.
3.  **`ProjectKPIs`**: Widgets de alto nivel con micro-gráficas de tendencia y panel de diagnóstico "esmerilado".
4.  **`EVMVisualizations`**: Panel mixto con Curva S, Radar Chart y Donut de distribución.
5.  **`ActivityTable`**: Gestión detallada de actividades (CRUD).
6.  **`ActivityForm`**: Modal/Panel lateral para creación y edición.

---

## 3. Estado de la Página

La página maneja el estado de selección a través del hook `useProject(selectedProjectId)`.

- **Carga inicial**: Si no hay `selectedProjectId` en la URL o localStorage, mostrar un "Empty State" invitando a seleccionar o crear un proyecto.
- **Carga de datos**: Mientras la API responde, se muestran Skeletons en todas las secciones principales (`KPIs`, `Chart`, `Table`).
- **Error**: Si la API falla, se muestra un banner de error global con opción de reintentar.

---

## 4. Interacciones Principales

| Acción | Componente Origen | Efecto |
|---|---|---|
| Seleccionar Proyecto | Sidebar | Actualiza `selectedProjectId`, dispara refetch de datos. |
| Crear Actividad | Botón Flotante / Tabla | Abre `ActivityForm` en modo creación. |
| Editar Actividad | `ActivityTable` | Abre `ActivityForm` en modo edición (Panel lateral). |
| Cambiar Tema | Header | Cambia clase `dark` en el `html` y guarda en `localStorage`. |

---

## 5. Responsividad (Mobile)

- **Sidebar**: Se convierte en un menú "Drawer" (hamburguesa) que se desliza desde la izquierda.
- **KPIs**: Se apilan verticalmente en una sola columna.
- **Tabla**: Se activa el scroll horizontal y se ocultan columnas no esenciales (`BAC`, `AC`).
- **Chart**: Se ajusta al 100% del ancho del dispositivo.

---

## 6. Definition of Done (Página)

- [ ] El cambio de proyecto es fluido y muestra skeletons.
- [ ] Las mutaciones en el formulario actualizan automáticamente los KPIs y la tabla.
- [ ] El tema persiste después de recargar la página.
- [ ] La URL refleja el proyecto seleccionado (opcional: `/project/:id`).
