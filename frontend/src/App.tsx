import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { useProjects } from './hooks/useProjects';
import { useCreateProject } from './hooks/useCreateProject';
import { useDeleteProject } from './hooks/useDeleteProject';
import { ProjectModal } from './components/ProjectModal';

const STORAGE_KEY = 'evm-selected-project';

function App() {
  // --- Estado de la Aplicación ---
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // --- Datos ---
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const deleteProjectMutation = useDeleteProject();

  // --- Efectos ---
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem(STORAGE_KEY, selectedProjectId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedProjectId]);

  // --- Handlers ---
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleNewProject = () => {
    setIsProjectModalOpen(true);
  };

  const handleProjectCreated = (id: string) => {
    setSelectedProjectId(id);
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto y todos sus datos?\nEsta acción es irreversible.')) {
      deleteProjectMutation.mutate(id, {
        onSuccess: () => {
          if (selectedProjectId === id) {
            setSelectedProjectId(null);
          }
        }
      });
    }
  };

  const handleNewActivity = () => {
    // La Dashboard maneja su propia apertura de formulario al recibir el trigger
    // pero mantenemos esto por si el sidebar lo requiere.
  };

  const handleSimulate = () => {
    alert('Simulación de Monte Carlo en construcción (Fase 13 - BI Estendido)');
  };

  const handleExport = () => {
    alert('Generación de reporte PDF en construcción (Fase 14 - Reporting)');
  };

  // Obtener el nombre del proyecto seleccionado para el Header
  const currentProjectName = projects.find(p => p.id === selectedProjectId)?.name;

  return (
    <div className="flex h-screen bg-background-base text-text-primary overflow-hidden">
      {/* Sidebar - Gestión de Navegación y Proyectos */}
      <Sidebar
        projects={projects}
        selectedId={selectedProjectId}
        onSelect={handleSelectProject}
        onDelete={handleDeleteProject}
        onNew={handleNewProject}
        isLoading={isLoadingProjects}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header
          projectName={currentProjectName}
          onMenuClick={() => setIsSidebarOpen(true)}
          onSimulate={handleSimulate}
          onExport={handleExport}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          <Dashboard 
            projectId={selectedProjectId} 
            onNewActivity={handleNewActivity}
          />
        </main>
      </div>

      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}

export default App;
