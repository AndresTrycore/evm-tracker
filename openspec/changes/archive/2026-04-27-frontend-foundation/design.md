# Design: Frontend Foundation & Design
> Change: `frontend-foundation` · Stage: Design · v1.0

## Technical Approach
El objetivo es crear un entorno de desarrollo React moderno y altamente performante. Utilizaremos **Vite** como build tool y **Tailwind CSS** para los estilos. La clave del diseño es la **abstracción de colores mediante variables CSS**, lo que nos permitirá implementar el Glassmorphism y los temas Dark/Light de forma nativa y eficiente.

## Architecture Decisions

### Decision: Build Tool Selection
**Choice**: Vite (React + TypeScript)
**Alternatives considered**: Create React App (deprecado), Next.js (demasiado complejo para este dashboard).
**Rationale**: Vite ofrece el mejor tiempo de respuesta en desarrollo (HMR) y una configuración mínima para proyectos de una sola página (SPA).

### Decision: Theme Management Strategy
**Choice**: Tailwind `class` mode + CSS Variables
**Alternatives considered**: CSS-in-JS (Styled Components), Tailwind arbitrary values.
**Rationale**: El uso de variables CSS (`--bg-base`, etc.) permite que el sistema de diseño sea agnóstico a la lógica de React. Tailwind se encarga de las utilidades de layout, mientras que las variables CSS manejan la "piel" (temas).

### Decision: Typography Integration
**Choice**: Geist (via npm) + DM Mono (via Google Fonts)
**Alternatives considered**: Local files for both.
**Rationale**: Geist es la fuente oficial de Vercel y tiene excelente soporte para UI. DM Mono se carga vía Google Fonts para simplificar el setup inicial sin añadir peso al bundle local.

## Data Flow
El flujo de estado del tema es unidireccional y persistente:

```
[ThemeToggle] ──(setState)──→ [DOM <html> classList] ──→ [CSS Variables update]
      │                                                     │
      └───────(persist)─────→ [localStorage] <──────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/package.json` | Create | Dependencias base (React, Tailwind, Lucide, Geist). |
| `frontend/vite.config.ts` | Create | Configuración de Vite con alias de rutas. |
| `frontend/tailwind.config.js` | Create | Extensión del tema con los tokens de `visual_standards.md`. |
| `frontend/src/index.css` | Create | Definición de variables CSS (tokens) y utilidades globales. |
| `frontend/src/components/ThemeToggle.tsx` | Create | Lógica de cambio de tema. |
| `frontend/index.html` | Create | Punto de entrada HTML con carga de fuentes. |

## Interfaces / Contracts

### Theme Token Interface (CSS)
```css
:root {
  --bg-base: #0E0F11;
  --bg-surface: #16181C;
  /* ... rest of tokens from visual_standards.md */
}

[data-theme="light"] {
  --bg-base: #F5F5F4;
  /* ... light overrides */
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Theme logic | Verificar que la clase `dark` se añade/remueve correctamente. |
| Visual | Responsive tokens | Verificar que las variables CSS escalan en diferentes breakpoints. |

## Migration / Rollout
No migration required (Fresh start).

## Open Questions
- [ ] ¿Usaremos Tailwind v3 (configuración JS) o v4 (configuración CSS)? Se recomienda v3 por compatibilidad con la mayoría de plugins actuales.
