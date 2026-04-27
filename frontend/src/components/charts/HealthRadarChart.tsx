import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { GlassTooltip } from './GlassTooltip';

interface HealthRadarChartProps {
  cpi: number;
  spi: number;
  cv: number; // Cost Variance
  sv: number; // Schedule Variance
  bac: number; // Budget at Completion (for normalization)
}

/**
 * Gráfica de Salud Integral (Radar).
 * Normaliza variaciones monetarias y las compara con los índices de rendimiento.
 */
export const HealthRadarChart: React.FC<HealthRadarChartProps> = ({ 
  cpi, 
  spi, 
  cv, 
  sv, 
  bac 
}) => {
  // Normalizar variaciones: (Variance / BAC) + 1. 
  // Así, un valor > 1 es positivo, < 1 es riesgo.
  const normalize = (val: number) => {
    if (!bac || bac === 0) return 1;
    return (val / bac) + 1;
  };

  const data = [
    { subject: 'CPI (Costo)', value: cpi, fullMark: 1.5 },
    { subject: 'SPI (Tiempo)', value: spi, fullMark: 1.5 },
    { subject: 'CV Normalizado', value: normalize(cv), fullMark: 1.5 },
    { subject: 'SV Normalizado', value: normalize(sv), fullMark: 1.5 },
  ];

  const colors = {
    accent: '#4F7CFF', // --accent
    grid: '#2A2D33', // --border
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke={colors.grid} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 500 }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 1.5]} 
          tick={false} 
          axisLine={false} 
        />
        <Tooltip content={<GlassTooltip type="index" />} />
        <Radar
          name="Desempeño"
          dataKey="value"
          stroke={colors.accent}
          fill={colors.accent}
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
