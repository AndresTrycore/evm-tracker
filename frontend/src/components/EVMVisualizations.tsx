import React, { useMemo } from 'react';
import { ProjectWithEVM } from '../types';
import { ChartCard } from './charts/ChartCard';
import { SCurveChart } from './charts/SCurveChart';
import { HealthRadarChart } from './charts/HealthRadarChart';
import { BACDonutChart } from './charts/BACDonutChart';
import { ActivityBarChart } from './charts/ActivityBarChart';

interface EVMVisualizationsProps {
  project: ProjectWithEVM;
  isLoading?: boolean;
}

/**
 * Orquestador de visualizaciones EVM.
 * Procesa los datos crudos del proyecto para alimentar las gráficas de Recharts.
 */
export const EVMVisualizations: React.FC<EVMVisualizationsProps> = ({ project, isLoading }) => {
  
  // 1. Procesar datos para la Curva S (Evolución por fecha de fin de actividades)
  const sCurveData = useMemo(() => {
    if (!project.activities.length) return [];

    // Agrupar por fecha
    const grouped = project.activities.reduce((acc, act) => {
      const date = act.end_date || 'Sin fecha';
      if (!acc[date]) acc[date] = { pv: 0, ev: 0, ac: 0 };
      acc[date].pv += act.evm.planned_value ?? 0;
      acc[date].ev += act.evm.earned_value ?? 0;
      acc[date].ac += act.actual_cost ?? 0;
      return acc;
    }, {} as Record<string, { pv: number; ev: number; ac: number }>);

    // Ordenar cronológicamente y acumular
    const sortedDates = Object.keys(grouped).sort();
    let accPv = 0, accEv = 0, accAc = 0;

    return sortedDates.map(date => {
      accPv += grouped[date].pv;
      accEv += grouped[date].ev;
      accAc += grouped[date].ac;
      return {
        date: date === 'Sin fecha' ? 'Plan' : date,
        pv: accPv,
        ev: accEv,
        ac: accAc
      };
    });
  }, [project.activities]);

  // 2. Procesar datos para el Donut de BAC
  const donutData = useMemo(() => {
    return project.activities
      .filter(a => a.budget_at_completion > 0)
      .map(a => ({
        name: a.name || 'Sin nombre',
        value: a.budget_at_completion
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [project.activities]);

  const totalBac = useMemo(() => {
    return project.activities.reduce(
      (acc, activity) => acc + Math.max(activity.budget_at_completion, 0),
      0,
    );
  }, [project.activities]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Curva S - Ocupa 2 columnas */}
      <ChartCard 
        title="Curva S: Evolución de Valor" 
        subtitle="Progreso acumulado de Plan vs Valor Ganado vs Costo Real"
        className="lg:col-span-2"
      >
        <SCurveChart data={sCurveData} isLoading={isLoading} />
      </ChartCard>

      {/* Radar de Salud - Ocupa 1 columna */}
      <ChartCard 
        title="Salud del Proyecto" 
        subtitle="Rendimiento integral en índices y variaciones"
        className="lg:col-span-1"
      >
        <HealthRadarChart 
          cpi={project.evm_summary.cost_performance_index ?? 0}
          spi={project.evm_summary.schedule_performance_index ?? 0}
          cv={project.evm_summary.cost_variance}
          sv={project.evm_summary.schedule_variance}
          bac={totalBac}
        />
      </ChartCard>

      {/* Donut de BAC - Ocupa 1 columna */}
      <ChartCard 
        title="Distribución Presupuestaria" 
        subtitle="BAC total distribuido por actividades principales"
        className="lg:col-span-1"
      >
        <BACDonutChart 
          data={donutData} 
          totalBac={totalBac} 
        />
      </ChartCard>

      {/* Rendimiento por Actividad - Ocupa 2 columnas */}
      <ChartCard 
        title="Rendimiento por Actividad" 
        subtitle="Comparativa de eficiencia CPI/SPI individual (Peores 10)"
        className="lg:col-span-2"
      >
        <ActivityBarChart 
          activities={project.activities} 
          isLoading={isLoading} 
        />
      </ChartCard>
    </div>
  );
};

