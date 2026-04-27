import React, { useState } from 'react';

import { useProject } from '../hooks/useProject';
import { SkeletonPulse } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { LayoutDashboard, AlertCircle, Plus } from 'lucide-react';
import { EVMVisualizations } from './EVMVisualizations';
import { ProjectKPIs } from './ProjectKPIs';
import { ActivityTable } from './ActivityTable';
import { ActivityForm } from './ActivityForm';
import { useDeleteActivity } from '../hooks/useDeleteActivity';
import { ActivityResponse } from '../types';

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
  const deleteMutation = useDeleteActivity(projectId || '');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityResponse | null>(null);

  const handleEdit = (activity: ActivityResponse | null) => {
    setSelectedActivity(activity);
    setIsFormOpen(true);
  };

  const handleDelete = (activity: ActivityResponse) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${activity.name}"?\nEsta acción no se puede deshacer.`)) {
      deleteMutation.mutate(activity.id);
    }
  };

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
      <section>
        <ProjectKPIs
          evm={project?.evm_summary}
          activities={project?.activities}
          isLoading={isLoading}
        />
      </section>

      {/* Sección Gráficas (Visualizaciones EVM Reales) */}
      {!isLoading && project && (
        <EVMVisualizations project={project} isLoading={isLoading} />
      )}
      
      {isLoading && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonPulse className="h-80 lg:col-span-2" />
          <SkeletonPulse className="h-80 lg:col-span-1" />
        </section>
      )}

      {/* Sección Tabla (Skeletons o Real) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-heading font-semibold">Actividades</h3>
          {!isLoading && (
            <button 
              onClick={() => handleEdit(null)}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-md text-caption hover:bg-accent-hover transition-all"
            >
              <Plus size={14} />
              <span>Nueva Actividad</span>
            </button>
          )}
        </div>
        
        {isLoading ? (
          <SkeletonPulse className="h-64 w-full" />
        ) : project ? (
          <ActivityTable 
            activities={project.activities} 
            isLoading={isLoading} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : null}
      </section>

      {/* Modal / Panel de Formulario */}
      {project && (
        <ActivityForm
          projectId={project.id}
          activity={selectedActivity}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

