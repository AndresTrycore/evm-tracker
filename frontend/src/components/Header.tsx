import React from 'react';
import { Menu, Share2, Download, Play } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  projectName?: string;
  onMenuClick: () => void;
  onSimulate: () => void;
  onExport: () => void;
}

/**
 * Header superior con efecto Glassmorphism.
 * Contiene las acciones principales del proyecto y el toggle de tema.
 */
export const Header: React.FC<HeaderProps> = ({
  projectName,
  onMenuClick,
  onSimulate,
  onExport,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-background-base/80 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-text-secondary hover:bg-background-elevated rounded-lg md:hidden"
        >
          <Menu size={20} />
        </button>
        
        <h2 className="text-body font-semibold text-text-primary truncate max-w-[200px] md:max-w-md">
          {projectName || 'Dashboard General'}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Acciones de escritorio */}
        <div className="hidden sm:flex items-center gap-2 mr-2 border-r border-border-subtle pr-4">
          <button 
            onClick={onSimulate}
            className="flex items-center gap-2 px-3 py-1.5 text-caption font-medium text-accent hover:bg-accent-subtle rounded-md transition-colors"
          >
            <Play size={14} />
            <span>Simular</span>
          </button>
          <button 
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 text-caption font-medium text-text-secondary hover:bg-background-elevated rounded-md transition-colors"
          >
            <Download size={14} />
            <span>Reporte</span>
          </button>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
};
