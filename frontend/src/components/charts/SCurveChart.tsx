import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GlassTooltip } from './GlassTooltip';

interface SCurvePoint {
  date: string;
  pv: number;
  ev: number;
  ac: number;
}

interface SCurveChartProps {
  data: SCurvePoint[];
  isLoading?: boolean;
}

/**
 * Gráfica de Evolución Temporal (Curva S).
 * Compara el Valor Planificado (PV), Valor Ganado (EV) y Costo Real (AC).
 * Incluye gradientes y estilos alineados con visual_standards.md.
 */
export const SCurveChart: React.FC<SCurveChartProps> = ({ data, isLoading }) => {
  // Configuración de colores desde variables CSS (fallback a hex si es necesario)
  const colors = {
    pv: '#4A4846', // --text-disabled
    ev: '#4ADE80', // --health-green
    ac: '#F87171', // --health-red
    grid: '#2A2D33', // --border
  };

  if (isLoading || !data.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-disabled italic text-caption">
        Procesando serie histórica...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.ev} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors.ev} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.ac} stopOpacity={0.1} />
            <stop offset="95%" stopColor={colors.ac} stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false} 
          stroke={colors.grid} 
          opacity={0.5} 
        />
        
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
          dy={10}
        />
        
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        
        <Tooltip content={<GlassTooltip type="currency" />} />
        
        <Legend 
          verticalAlign="top" 
          align="right" 
          height={36} 
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        />

        {/* Planned Value - Línea base punteada */}
        <Area
          type="monotone"
          dataKey="pv"
          name="PV (Plan)"
          stroke={colors.pv}
          strokeDasharray="5 5"
          strokeWidth={2}
          fill="transparent"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />

        {/* Actual Cost - Línea sólida */}
        <Area
          type="monotone"
          dataKey="ac"
          name="AC (Costo)"
          stroke={colors.ac}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorAc)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />

        {/* Earned Value - Línea sólida con gradiente de área */}
        <Area
          type="monotone"
          dataKey="ev"
          name="EV (Valor)"
          stroke={colors.ev}
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorEv)"
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
