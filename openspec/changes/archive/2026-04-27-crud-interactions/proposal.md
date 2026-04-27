# Proposal: CRUD & Interactions (Activity Table & Form)
> Change: `crud-interactions` · Status: Draft · v1.0

## Intent
Implementar el núcleo interactivo de la aplicación: la gestión del ciclo de vida de las actividades. Esto dotará a la aplicación de capacidades de escritura, permitiendo crear, editar, listar y eliminar actividades, recalculando instantáneamente el estado general del proyecto EVM gracias a la reactividad de TanStack Query.

## Scope
- Implementación de `ActivityTable` con capacidades de ordenamiento múltiple y filtrado en tiempo real.
- Creación de barra de progreso dual (Plan vs Real) dentro de la tabla.
- Tooltips detallados por fila para métricas secundarias (EAC, VAC).
- Implementación de `ActivityForm` con diseño de modo dual (Modal para creación, Panel lateral para edición).
- Validación de formularios en el cliente y manejo de estados asíncronos y errores de API.
- Integración en el `Dashboard`.

## Non-Goals
- Paginación del lado del servidor (las actividades se manejan en cliente para el filtrado rápido).
- Simulaciones de Monte Carlo (Fase 12).

## Technical Approach
Utilizaremos el estado local de React para los filtros y ordenamiento de la tabla. El formulario utilizará un estado controlado para sus campos, manejando los inputs numéricos temporalmente como `string` para mejorar la UX. Las mutaciones consumirán los hooks ya desarrollados (`useCreateActivity`, `useUpdateActivity`, `useDeleteActivity`), garantizando la invalidación de la caché e hidratando todo el Dashboard instantáneamente.
