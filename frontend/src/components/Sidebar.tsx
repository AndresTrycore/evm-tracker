import React, { useState } from 'react';
import { Search, Plus, Folder, Loader2, Trash2, X } from 'lucide-react';
import { Project } from '../types';
import { SkeletonPulse } from './ui/Skeleton';

interface SidebarProps {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar principal con gestión de proyectos y búsqueda.
 * Responsivo: Drawer en móvil, lateral fijo en desktop.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  selectedId,
  onSelect,
  onDelete,
  onNew,
  isLoading,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-background-base border-r border-border-subtle 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}>
        {/* Header del Sidebar */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-accent">
              <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6"/>
                <path d="M38 42L30 50L38 58" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M62 42L70 50L62 58" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M54 35L46 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-heading font-bold tracking-tight">EVM Tracker</h1>
          </div>
          <button onClick={onClose} className="md:hidden text-text-secondary">
            <X size={20} />
          </button>
        </div>

        {/* Buscador */}
        <div className="px-4 mb-4">
          <div className="relative group">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors" 
            />
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background-elevated border border-border-subtle rounded-lg pl-10 pr-4 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
        </div>

        {/* Lista de Proyectos */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="mb-2 text-label text-text-secondary uppercase tracking-widest px-2">
            Proyectos
          </div>

          <div className="space-y-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonPulse key={i} className="h-10 w-full" />
              ))
            ) : filteredProjects.length === 0 ? (
              <div className="px-3 py-8 text-center text-caption text-text-disabled italic">
                {searchTerm ? 'No se encontraron resultados' : 'Sin proyectos'}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    onSelect(project.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all
                    ${selectedId === project.id 
                      ? 'bg-accent-subtle text-accent font-medium' 
                      : 'text-text-secondary hover:bg-background-elevated hover:text-text-primary'}
                  `}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Folder size={18} className={selectedId === project.id ? 'text-accent' : 'text-text-disabled group-hover:text-text-secondary'} />
                    <span className="truncate">{project.name}</span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-health-red transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Acción: Nuevo Proyecto */}
        <div className="p-4 border-t border-border-subtle">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent-hover active:scale-95 transition-all shadow-lg shadow-accent/20"
          >
            <Plus size={18} />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </aside>
    </>
  );
};
