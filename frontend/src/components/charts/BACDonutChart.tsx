import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from 'recharts';
import { GlassTooltip } from './GlassTooltip';

interface DonutData {
  name: string;
  value: number;
}

interface BACDonutChartProps {
  data: DonutData[];
  totalBac: number;
}

/**
 * Gráfica de Distribución de Presupuesto (Donut).
 * Muestra el BAC por actividad y el total consolidado en el centro.
 * Usa la paleta desaturada industrial (§4.3).
 */
export const BACDonutChart: React.FC<BACDonutChartProps> = ({ data, totalBac }) => {
  // Paleta de azules/grises industrial
  const COLORS = [
    '#4F7CFF', // --accent
    '#3B82F6', 
    '#60A5FA', 
    '#93C5FD', 
    '#4A4846', // --text-disabled
    '#8A8784', // --text-secondary
  ];

  const formatCurrency = (val: number) => {
    if (isNaN(val) || val === null || val === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (!data.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-disabled italic text-caption">
        Sin datos de presupuesto
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Texto Central (BAC Total) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-label text-text-secondary uppercase tracking-wider">Total BAC</span>
        <span className="text-kpi-lg font-mono text-text-primary font-bold">
          {formatCurrency(totalBac)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<GlassTooltip type="currency" />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
