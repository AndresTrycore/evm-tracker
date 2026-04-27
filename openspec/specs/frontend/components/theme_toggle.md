# theme_toggle.md — Especificación de Componente
> EVM Tracker · Frontend Specs · v1.0  
> Depende de: `visual_standards.md §2` (Temas Dark/Light)

---

## 1. Propósito

Permitir al usuario alternar entre el tema oscuro (Dark) y el tema claro (Light) de la aplicación, persistiendo la preferencia en el navegador.

---

## 2. Comportamiento

- Al hacer click, el componente alterna el atributo `data-theme` o la clase `dark` en el elemento raíz `<html>`.
- Guarda la preferencia en `localStorage` bajo la clave `evm-theme` (`"dark"` | `"light"`).
- Al cargar la aplicación, debe leer el `localStorage` o usar la preferencia del sistema (`prefers-color-scheme`).

---

## 3. Diseño Visual

El componente es un botón tipo `Ghost` circular con un icono que cambia según el estado:

- **Modo Dark activo**: Muestra el icono de `Sun` (Sol).
- **Modo Light activo**: Muestra el icono de `Moon` (Luna).

### Estilos Tailwind
```ts
<button class="p-2 rounded-full hover:bg-[--bg-elevated] text-[--text-secondary] transition-colors">
  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
</button>
```

---

## 4. Dependencias

| Dependencia | Uso |
|---|---|
| `lucide-react` | Iconos `Sun` y `Moon`. |
| `visual_standards.md` | Colores de hover y texto. |
