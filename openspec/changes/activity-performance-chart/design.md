# Design: Activity Performance Chart
> Change: `activity-performance-chart` · Status: Draft · v1.0

## Architecture Decisions

### Componente: `ActivityBarChart`
- **Ubicación**: `frontend/src/components/charts/ActivityBarChart.tsx`
- **Librería**: `recharts` (`BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ReferenceLine`, `ResponsiveContainer`).
- **Props**: `{ activities: Activity[] }`.

### Data Mapping
Antes de pasar los datos a Recharts, mapearemos el array de actividades para asegurar que los nombres no sean demasiado largos:
```typescript
const chartData = activities.map(a => ({
  name: a.name.length > 12 ? a.name.substring(0, 10) + '...' : a.name,
  fullName: a.name,
  cpi: a.cpi,
  spi: a.spi
}));
```

### Visual Style
- **Barras**:
  - CPI: `var(--accent)` (Azul principal)
  - SPI: `var(--accent-secondary)` o un tono complementario.
- **Tooltip**: Usaremos el componente `GlassTooltip` personalizado ya existente para mantener la estética premium.
- **Grid**: Solo líneas horizontales sutiles (`strokeDasharray="3 3"`).

### Integración
Modificaremos `EVMVisualizations.tsx` para importar `ActivityBarChart` y pasarle `project.activities`. Reemplazaremos el `div` placeholder por el nuevo componente.
