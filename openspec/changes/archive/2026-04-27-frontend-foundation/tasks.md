# Tasks: Frontend Foundation & Design
> Change: `frontend-foundation` · Status: Pending · v1.0

## Phase 1: Infrastructure & Environment
- [x] 1.1 Crear `frontend/package.json` con dependencias base: React, Tailwind v3, Lucide, Geist.
- [x] 1.2 Configurar `frontend/vite.config.ts` y `frontend/postcss.config.js`.
- [x] 1.3 Crear `frontend/tailwind.config.js` mapeando tokens a variables CSS.
- [x] 1.4 Crear `frontend/index.html` incluyendo el link a Google Fonts (DM Mono).

## Phase 2: Design System & Tokens
- [x] 2.1 Implementar `frontend/src/index.css` con variables `:root` y `@tailwind directives`.
- [x] 2.2 Definir utilidades personalizadas para Glassmorphism (`backdrop-blur`) en Tailwind config.

## Phase 3: App Shell & Theme Logic
- [x] 3.1 Crear `frontend/src/components/ThemeToggle.tsx` con soporte para `localStorage` y clase `dark`.
- [x] 3.2 Crear `frontend/src/App.tsx` con un layout básico que use los tokens de fondo y texto.
- [x] 3.3 Configurar `frontend/src/main.tsx` como punto de entrada de React.

## Phase 4: Verification
- [ ] 4.1 Test: El cambio de tema debe persistir tras recargar la página.
- [ ] 4.2 Test: Los colores deben cambiar dinámicamente al alternar la clase `.dark`.
- [ ] 4.3 Test: Las fuentes DM Mono y Geist deben cargar correctamente en el navegador.
