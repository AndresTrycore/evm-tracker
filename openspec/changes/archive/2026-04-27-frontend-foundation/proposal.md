# Proposal: Frontend Foundation & Design
> Change: `frontend-foundation` · Status: Draft · v1.0

## Intent
Establecer la base técnica y visual del frontend para permitir el desarrollo posterior de los componentes EVM. Esto incluye el setup del bundler, framework de estilos y el sistema de temas (Dark/Light).

## Scope
- Inicialización de proyecto con Vite + React + TypeScript.
- Configuración de Tailwind CSS v3/v4.
- Implementación de tokens de diseño en `index.css`.
- Creación del componente de cambio de tema funcional.
- Configuración de tipografías Geist y DM Mono.

## Non-Goals
- Implementar lógica de API o estado global (Fase 7).
- Crear el Dashboard o Sidebar (Fase 8).

## Technical Approach
Usaremos Vite para una experiencia de desarrollo rápida. La configuración de Tailwind mapeará directamente a las variables CSS definidas en `visual_standards.md`, permitiendo un cambio de tema reactivo sin recargas de página.
