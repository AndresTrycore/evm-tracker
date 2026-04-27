# api_client.md — Cliente de API y Tipos
> EVM Tracker · Frontend Specs · v1.0  
> Define la capa de comunicación con el backend, tipos de datos y manejo de errores.
> Basado en: `openspec/specs/architecture/api_design.md`

---

## 1. Configuración del Cliente

**Librería: Axios**  
Se utiliza Axios para aprovechar los interceptores, el manejo automático de JSON y la facilidad para configurar una instancia base.

Archivo: `src/lib/api-client.ts`

```ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Transformar el error del backend (FastAPI detail) a un formato estándar
    const message = error.response?.data?.detail || 'Error inesperado del servidor';
    return Promise.reject({
      message,
      status: error.response?.status,
      originalError: error,
    });
  }
);
```

---

## 2. Definiciones de Tipos (TypeScript)

Los tipos deben ser espejos exactos de los Schemas definidos en el backend para garantizar la integridad de los datos.

### 2.1 Proyectos
```ts
export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithEVM extends Project {
  activities: Activity[];
  evm_summary: EVMSummary;
}

export type ProjectCreate = Pick<Project, 'name' | 'description'>;
export type ProjectUpdate = Partial<ProjectCreate>;
```

### 2.2 Actividades e Indicadores
```ts
export interface EVMIndicators {
  planned_value: number;
  earned_value: number;
  cost_variance: number;
  schedule_variance: number;
  cost_performance_index: number | null;
  schedule_performance_index: number | null;
  estimate_at_completion: number | null;
  variance_at_completion: number | null;
}

export interface EVMSummary extends EVMIndicators {
  cost_status: 'bajo presupuesto' | 'en presupuesto' | 'sobre presupuesto' | 'sin datos';
  schedule_status: 'adelantado' | 'en cronograma' | 'atrasado' | 'sin datos';
}

export interface Activity {
  id: string;
  project_id: string;
  name: string;
  budget_at_completion: number;
  planned_progress: number;
  actual_progress: number;
  actual_cost: number;
  created_at: string;
  updated_at: string;
  evm: EVMIndicators;
}

export type ActivityCreate = Omit<Activity, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'evm'>;
export type ActivityUpdate = Partial<ActivityCreate>;
```

---

## 3. Servicios (Endpoints)

Los servicios se agrupan por recurso. No manejan estado (TanStack Query se encarga de eso).

### 3.1 Proyectos (`src/services/projects.ts`)

- `getProjects()`: `GET /projects` → `Promise<Project[]>`
- `getProjectDetail(id: string)`: `GET /projects/{id}` → `Promise<ProjectWithEVM>`
- `createProject(data: ProjectCreate)`: `POST /projects` → `Promise<Project>`
- `deleteProject(id: string)`: `DELETE /projects/{id}` → `Promise<void>`

### 3.2 Actividades (`src/services/activities.ts`)

- `createActivity(projectId: string, data: ActivityCreate)`: `POST /projects/{projectId}/activities` → `Promise<Activity>`
- `updateActivity(projectId: string, activityId: string, data: ActivityUpdate)`: `PUT /projects/{projectId}/activities/{activityId}` → `Promise<Activity>`
- `deleteActivity(projectId: string, activityId: string)`: `DELETE /projects/{projectId}/activities/{activityId}` → `Promise<void>`

---

## 4. Validación de Datos (Zod)

Para aumentar la robustez en tiempo de ejecución, se recomienda validar la respuesta del API en los puntos críticos usando Zod.

```ts
import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  // ... rest of fields
});
```

---

## 5. Manejo de Errores

El frontend debe capturar el objeto `ApiError` retornado por Axios:

```ts
export interface ApiError {
  message: string;
  status?: number;
  originalError: any;
}
```

Las validaciones de formulario (422) deben ser transformadas a mensajes legibles para el usuario según las reglas definidas en `visual_standards.md §8`.