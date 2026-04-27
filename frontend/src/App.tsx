import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { useProjects } from './hooks/useProjects';

const STORAGE_KEY = 'evm-selected-project';

function App() {
  // --- Estado de la Aplicación ---
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Datos ---
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();

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
    alert('Funcionalidad de creación de proyectos en construcción (Fase 10)');
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto y todos sus datos?')) {
      alert(`Eliminación de proyecto ${id} en construcción (Fase 10)`);
    }
  };

  const handleNewActivity = () => {
    alert('Funcionalidad de creación de actividades en construcción (Fase 10)');
  };

  const handleSimulate = () => {
    alert('Simulación de Monte Carlo en construcción (Fase 12)');
  };

  const handleExport = () => {
    alert('Generación de reporte PDF en construcción (Fase 13)');
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
    </div>
  );
}

export default App;
