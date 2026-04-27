import React from 'react';
import { CheckCircle2, AlertTriangle, Minus } from 'lucide-react';
import { CostStatus, ScheduleStatus } from '../../types';

interface HealthBadgeProps {
  status: CostStatus | ScheduleStatus | 'sin datos';
  dimension: 'cost' | 'schedule';
  cpi?: number | null;
  spi?: number | null;
  size?: 'sm' | 'md';
  compact?: boolean;
  tooltipPosition?: 'top' | 'bottom';
}

/**
 * Representación atómica de salud con tooltip CSS-only.
 */
export const HealthBadge: React.FC<HealthBadgeProps> = ({
  status,
  dimension,
  cpi,
  spi,
  size = 'md',
  compact = false,
  tooltipPosition = 'top'
}) => {
  // Mapeos visuales
  const isHealthy = status === 'bajo presupuesto' || status === 'adelantado' || status === 'en presupuesto' || status === 'en cronograma';
  const isWarning = status === 'sobre presupuesto' || status === 'atrasado';
  const isNoData = status === 'sin datos' || (!isHealthy && !isWarning);

  const Icon = isNoData ? Minus : isWarning ? AlertTriangle : CheckCircle2;

  const colorClass = isNoData 
    ? 'bg-text-disabled/10 text-text-disabled border border-text-disabled/20' 
    : isWarning 
      ? 'bg-health-red/10 text-health-red border border-health-red/20' 
      : 'bg-health-green/10 text-health-green border border-health-green/20';

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 12 : 14;

  const label = isNoData ? 'Sin datos' : status.charAt(0).toUpperCase() + status.slice(1);
  const dimensionTitle = dimension === 'cost' ? 'Costo' : 'Cronograma';

  // Tooltip Logic
  const val = dimension === 'cost' ? cpi : spi;
  
  const getTooltipDescription = (v: number | null) => {
    if (v === null || v === undefined) return null;
    if (dimension === 'cost') {
      return `Indica $${v.toFixed(2)} ganados por cada $1.00 invertido.`;
    } else {
      return `El proyecto avanza al ${(v * 100).toFixed(0)}% del ritmo planificado.`;
    }
  };

  const getTooltipAdvice = (v: number | null) => {
    if (v === null || v === undefined) return null;
    if (v >= 1.0) return "Eficiencia óptima";
    if (v >= 0.95) return "Dentro del margen aceptable";
    if (v >= 0.85) return "Ligera desviación — monitorear";
    if (v >= 0.70) return "Desviación significativa — tomar acción";
    return "Desviación crítica — requiere intervención";
  };

  const desc = getTooltipDescription(val);
  const advice = getTooltipAdvice(val);

  return (
    <div className="relative inline-flex group cursor-help">
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-colors ${colorClass} ${sizeClass}`}>
        <Icon size={iconSize} className="shrink-0" />
        {!compact && <span className="truncate max-w-[120px]">{label}</span>}
      </span>

      {/* CSS-Only Tooltip */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 
          ${tooltipPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} 
          invisible group-hover:visible opacity-0 group-hover:opacity-100 
          transition-all duration-150 transform group-hover:translate-y-0 ${tooltipPosition === 'top' ? 'translate-y-1' : '-translate-y-1'}
          w-56 rounded-md p-3 shadow-xl backdrop-blur-md
          bg-background-elevated border border-border
          text-text-primary text-xs z-50 pointer-events-none`}
      >
        <div className="font-semibold text-body mb-1 pb-1 border-b border-border-subtle flex justify-between items-center">
          <span>{dimensionTitle}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${colorClass}`}>{label}</span>
        </div>
        
        {isNoData ? (
          <p className="text-text-secondary mt-2">
            No hay actividades registradas para calcular indicadores.
          </p>
        ) : (
          val !== null && val !== undefined && (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-text-secondary font-mono">{dimension === 'cost' ? 'CPI' : 'SPI'}</span>
                <span className={`font-mono text-body font-bold ${val >= 0.95 ? 'text-health-green' : val >= 0.85 ? 'text-health-yellow' : val >= 0.70 ? 'text-health-orange' : 'text-health-red'}`}>
                  {val.toFixed(2)}
                </span>
              </div>
              <p className="text-text-secondary leading-tight">
                {desc}
              </p>
              <p className="font-medium text-text-primary pt-1 border-t border-border-subtle border-dashed">
                {advice}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
