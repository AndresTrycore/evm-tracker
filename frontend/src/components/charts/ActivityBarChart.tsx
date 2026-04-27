import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell,
  Legend
} from 'recharts';

import { Activity } from '../../types';
import { GlassTooltip } from './GlassTooltip';

interface ActivityBarChartProps {
  activities: Activity[];
  isLoading?: boolean;
}

/**
 * Gráfica de barras comparativa de CPI y SPI por actividad.
 * Permite identificar desviaciones de rendimiento individuales.
 */
export const ActivityBarChart: React.FC<ActivityBarChartProps> = ({ activities, isLoading }) => {
  
  // Colores consistentes con el sistema de diseño (hex para compatibilidad con SVG)
  const colors = {
    accent: '#8B5CF6', // Electric Violet
    accentSecondary: '#D8B4FE', // Light Violet
    red: '#EF4444',
    orange: '#F97316',
    text: '#94A3B8',
    grid: '#15171F',
  };

  const chartData = useMemo(() => {
    return [...activities]
      .sort((a, b) => (a.evm.cost_performance_index ?? 0) - (b.evm.cost_performance_index ?? 0))
      .slice(0, 10)
      .map(a => ({
        name: a.name.length > 15 ? a.name.substring(0, 12) + '...' : a.name,
        fullName: a.name,
        cpi: Number((a.evm.cost_performance_index ?? 0).toFixed(2)),
        spi: Number((a.evm.schedule_performance_index ?? 0).toFixed(2)),
      }));
  }, [activities]);

  if (isLoading) return <div className="w-full h-full bg-background-elevated animate-pulse rounded-lg" />;

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
          
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.text, fontSize: 11 }}
            dy={10}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.text, fontSize: 11 }}
            domain={[0, (dataMax: number) => Math.max(1.5, dataMax + 0.2)]}
          />

          <Tooltip 
            content={<GlassTooltip type="index" />} 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)', opacity: 0.4 }}
          />

          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />

          <ReferenceLine 
            y={1} 
            stroke={colors.text} 
            strokeDasharray="5 5" 
            label={{ 
              value: 'Umbral', 
              position: 'right', 
              fill: colors.text, 
              fontSize: 10 
            }} 
          />

          <Bar 
            dataKey="cpi" 
            name="CPI (Costo)" 
            fill={colors.accent}
            radius={[4, 4, 0, 0]}
            barSize={12}
          />

          <Bar 
            dataKey="spi" 
            name="SPI (Plazo)" 
            fill={colors.accentSecondary}
            radius={[4, 4, 0, 0]}
            barSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


