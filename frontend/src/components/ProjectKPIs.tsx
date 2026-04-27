import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp, Play, FileText } from 'lucide-react';
import { EVMSummary } from '../types';
import { HealthBadge } from './ui/HealthBadge';
import { SkeletonPulse } from './ui/Skeleton';

interface ProjectKPIsProps {
  evm: EVMSummary | undefined;
  isLoading?: boolean;
}

/**
 * Organismo superior del Dashboard: Project KPIs.
 * Muestra métricas clave con micro-tendencias y panel de diagnóstico expansible.
 */
export const ProjectKPIs: React.FC<ProjectKPIsProps> = ({ evm, isLoading }) => {
  // Persistencia de panel de diagnóstico en localStorage
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('evm-kpi-detail-open');
    if (saved === 'true') setIsDetailOpen(true);
  }, []);

  const toggleDetail = () => {
    setIsDetailOpen(prev => {
      const next = !prev;
      localStorage.setItem('evm-kpi-detail-open', String(next));
      return next;
    });
  };

  // Skeletons
  if (isLoading || !evm) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center w-full mb-6">
          <div className="flex gap-3">
            <SkeletonPulse className="h-7 w-28 rounded-full" />
            <SkeletonPulse className="h-7 w-32 rounded-full" />
          </div>
          <div className="flex gap-2">
            <SkeletonPulse className="h-8 w-24 rounded-md" />
            <SkeletonPulse className="h-8 w-24 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonPulse className="h-[120px] rounded-xl" />
          <SkeletonPulse className="h-[120px] rounded-xl" />
          <SkeletonPulse className="h-[120px] rounded-xl" />
        </div>
        <SkeletonPulse className="h-6 w-48 mt-2 rounded-md" />
      </div>
    );
  }

  // Formateadores
  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatIndex = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    return val.toFixed(2);
  };

  const getKPIColor = (val: number | null) => {
    if (val === null || val === undefined) return 'text-text-disabled';
    if (val >= 0.95) return 'text-health-green';
    if (val >= 0.85) return 'text-health-yellow';
    if (val >= 0.70) return 'text-health-orange';
    return 'text-health-red';
  };
  
  const getTrendColor = (val: number | null) => {
    if (val === null || val === undefined) return '#4A4846'; // text-disabled
    if (val >= 0.95) return '#4ADE80'; // health-green
    if (val >= 0.85) return '#FACC15'; // health-yellow
    if (val >= 0.70) return '#FB923C'; // health-orange
    return '#F87171'; // health-red
  };

  const cpiColor = getKPIColor(evm.cost_performance_index);
  const spiColor = getKPIColor(evm.schedule_performance_index);
  
  const cpiTrendColor = getTrendColor(evm.cost_performance_index);
  const spiTrendColor = getTrendColor(evm.schedule_performance_index);

  // Mock de tendencia plana
  const cpiData = evm.cost_performance_index !== null ? [
    { value: evm.cost_performance_index * 0.98 },
    { value: evm.cost_performance_index * 0.99 },
    { value: evm.cost_performance_index },
  ] : [];

  const spiData = evm.schedule_performance_index !== null ? [
    { value: evm.schedule_performance_index * 0.97 },
    { value: evm.schedule_performance_index * 0.99 },
    { value: evm.schedule_performance_index },
  ] : [];

  // Helper para panel detallado
  const DetailRow = ({ label, code, value, isVariance = false }: { label: string, code: string, value: number | null, isVariance?: boolean }) => {
    const color = isVariance && value !== null 
      ? value > 0 ? 'text-health-green' : value < 0 ? 'text-health-red' : 'text-text-primary'
      : 'text-text-primary';

    return (
      <div className="flex justify-between items-center py-2">
        <span className="text-caption text-text-secondary">
          <strong className="font-medium mr-1">{code}</strong>
          <span className="hidden sm:inline">({label})</span>
        </span>
        <span className={`text-kpi-sm font-mono ${color}`}>
          {formatCurrency(value)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-3 flex-wrap">
          <HealthBadge 
            dimension="cost" 
            status={evm.cost_status} 
            cpi={evm.cost_performance_index} 
          />
          <HealthBadge 
            dimension="schedule" 
            status={evm.schedule_status} 
            spi={evm.schedule_performance_index} 
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-caption font-medium text-text-secondary hover:text-text-primary hover:bg-background-elevated border border-border rounded-md transition-colors">
            <Play size={14} /> Simular
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-caption font-medium text-text-secondary hover:text-text-primary hover:bg-background-elevated border border-border rounded-md transition-colors">
            <FileText size={14} /> Reporte
          </button>
        </div>
      </div>

      {/* Widgets Core */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPI Widget */}
        <div className="relative overflow-hidden bg-background-surface border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between h-[130px] group">
          <div className="z-10 flex flex-col">
            <span className="text-label text-text-secondary uppercase tracking-wider mb-1">
              Cost Performance (CPI)
            </span>
            <span className={`text-kpi-xl font-mono font-bold ${cpiColor}`}>
              {formatIndex(evm.cost_performance_index)}
            </span>
          </div>
          {/* Sparkline de fondo */}
          {cpiData.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full h-16 opacity-30 group-hover:opacity-50 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpiData}>
                  <Area type="monotone" dataKey="value" stroke={cpiTrendColor} fill={cpiTrendColor} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* SPI Widget */}
        <div className="relative overflow-hidden bg-background-surface border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between h-[130px] group">
          <div className="z-10 flex flex-col">
            <span className="text-label text-text-secondary uppercase tracking-wider mb-1">
              Schedule Performance (SPI)
            </span>
            <span className={`text-kpi-xl font-mono font-bold ${spiColor}`}>
              {formatIndex(evm.schedule_performance_index)}
            </span>
          </div>
          {/* Sparkline de fondo */}
          {spiData.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full h-16 opacity-30 group-hover:opacity-50 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spiData}>
                  <Area type="monotone" dataKey="value" stroke={spiTrendColor} fill={spiTrendColor} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* EAC Widget */}
        <div className="bg-background-surface border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between h-[130px]">
          <span className="text-label text-text-secondary uppercase tracking-wider mb-1">
            Estimate at Completion (EAC)
          </span>
          <span className={`text-kpi-lg font-mono font-bold text-text-primary ${String(evm.estimate_at_completion).length > 10 ? 'text-kpi-md' : ''} truncate`} title={formatCurrency(evm.estimate_at_completion)}>
            {formatCurrency(evm.estimate_at_completion)}
          </span>
        </div>
      </div>

      {/* Toggle y Panel de Diagnóstico */}
      <div className="mt-2">
        <button 
          onClick={toggleDetail}
          className="flex items-center gap-1.5 text-body text-text-secondary hover:text-text-primary transition-colors py-1 w-full sm:w-auto outline-none"
        >
          {isDetailOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{isDetailOpen ? 'Ocultar diagnóstico' : 'Ver diagnóstico detallado'}</span>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDetailOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border shadow-xl rounded-xl p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
              {/* Columna Izquierda */}
              <div className="space-y-1 md:border-r border-border-subtle md:pr-8">
                <DetailRow code="PV" label="Valor Planificado" value={evm.planned_value} />
                <DetailRow code="AC" label="Costo Real" value={evm.actual_cost} />
                <DetailRow code="SV" label="Variación de Cronograma" value={evm.schedule_variance} isVariance />
              </div>
              {/* Columna Derecha */}
              <div className="space-y-1 md:pl-4">
                <DetailRow code="EV" label="Valor Ganado" value={evm.earned_value} />
                <DetailRow code="CV" label="Variación de Costo" value={evm.cost_variance} isVariance />
                <DetailRow code="VAC" label="Variación a la Finalización" value={evm.variance_at_completion} isVariance />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
