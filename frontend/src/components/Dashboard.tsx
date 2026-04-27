import React from 'react';
import { useProject } from '../hooks/useProject';
import { SkeletonPulse } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { LayoutDashboard, AlertCircle, Plus } from 'lucide-react';

interface DashboardProps {
  projectId: string | null;
  onNewActivity: () => void;
}

/**
 * Contenedor principal de visualización de datos.
 * Orquesta los estados de carga, error y vacío del proyecto seleccionado.
 */
export const Dashboard: React.FC<DashboardProps> = ({ projectId, onNewActivity }) => {
  const { data: project, isLoading, isError, error } = useProject(projectId);

  if (!projectId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          icon={LayoutDashboard}
          title="Sin proyecto seleccionado"
          description="Selecciona un proyecto del sidebar para visualizar sus indicadores EVM o crea uno nuevo para comenzar."
          action={
            <div className="text-caption text-text-disabled">
              Usa el botón "Nuevo Proyecto" en el sidebar
            </div>
          }
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          icon={AlertCircle}
          title="Error al cargar datos"
          description={(error as any)?.message || 'No se pudo conectar con el servidor.'}
          action={
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-health-red/10 text-health-red rounded-md hover:bg-health-red/20 transition-colors"
            >
              Reintentar
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto custom-scrollbar">
      {/* Sección KPIs (Skeletons o Real) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-32 w-full" />
          ))
        ) : (
          <>
            {/* Placeholder para ProjectKPIs */}
            <div className="h-32 bg-background-elevated rounded-xl border border-border-subtle p-6 flex flex-col justify-between shadow-sm">
              <span className="text-label text-text-secondary uppercase">CPI</span>
              <span className="text-3xl font-bold text-health-green">{project?.evm_summary.cost_performance_index?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="h-32 bg-background-elevated rounded-xl border border-border-subtle p-6 flex flex-col justify-between shadow-sm">
              <span className="text-label text-text-secondary uppercase">SPI</span>
              <span className="text-3xl font-bold text-accent">{project?.evm_summary.schedule_performance_index?.toFixed(2) || '0.00'}</span>
            </div>
            {/* ... más placeholders ... */}
          </>
        )}
      </section>

      {/* Sección Gráficas (Skeletons o Real) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <SkeletonPulse className="h-80 lg:col-span-2" />
            <SkeletonPulse className="h-80 lg:col-span-1" />
          </>
        ) : (
          <>
            <div className="h-80 lg:col-span-2 bg-background-elevated rounded-xl border border-border-subtle p-6 shadow-sm">
              <h3 className="text-body font-semibold mb-4">Curva S (Avance vs Plan)</h3>
              <div className="w-full h-full flex items-center justify-center text-text-disabled italic">
                Gráfica en construcción (Fase 9)
              </div>
            </div>
            <div className="h-80 lg:col-span-1 bg-background-elevated rounded-xl border border-border-subtle p-6 shadow-sm">
              <h3 className="text-body font-semibold mb-4">Estado de Salud</h3>
              <div className="w-full h-full flex items-center justify-center text-text-disabled italic">
                Radar Chart (Fase 9)
              </div>
            </div>
          </>
        )}
      </section>

      {/* Sección Tabla (Skeletons o Real) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-heading font-semibold">Actividades</h3>
          {!isLoading && (
            <button 
              onClick={onNewActivity}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-md text-caption hover:bg-accent-hover transition-all"
            >
              <Plus size={14} />
              <span>Nueva Actividad</span>
            </button>
          )}
        </div>
        
        {isLoading ? (
          <SkeletonPulse className="h-64 w-full" />
        ) : (
          <div className="bg-background-elevated rounded-xl border border-border-subtle overflow-hidden shadow-sm">
             <div className="p-12 text-center text-text-disabled italic">
                Tabla de actividades real (Fase 11)
             </div>
          </div>
        )}
      </section>
    </div>
  );
};
