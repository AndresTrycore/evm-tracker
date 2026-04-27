import React from 'react';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface GlassTooltipProps extends TooltipProps<ValueType, NameType> {
  type?: 'currency' | 'index' | 'percentage';
}

/**
 * Tooltip personalizado con efecto Glassmorphism y tipografía técnica.
 * Cumple con visual_standards.md §6.2 y §10.1.
 */
export const GlassTooltip: React.FC<GlassTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  type = 'currency' 
}) => {
  if (!active || !payload || !payload.length) return null;

  const formatValue = (val: number) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(val);
    }
    if (type === 'index') {
      return val.toFixed(2);
    }
    if (type === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    return val;
  };

  return (
    <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-3 shadow-xl ring-1 ring-black/5">
      {label && (
        <div className="text-caption text-text-secondary font-medium mb-2 border-b border-border-subtle pb-1">
          {label}
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-caption text-text-secondary font-sans capitalize">
                {item.name}
              </span>
            </div>
            <span className="text-caption text-text-primary font-mono font-semibold">
              {typeof item.value === 'number' ? formatValue(item.value) : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
