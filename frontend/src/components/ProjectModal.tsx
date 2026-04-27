import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useCreateProject } from '../hooks/useCreateProject';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

/**
 * Modal esmerilado para creación de proyectos.
 * Aplica estilos de UI Elevada y validación de cliente.
 */
export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre del proyecto es obligatorio.');
      return;
    }

    createMutation.mutate(
      { name: name.trim(), description: description.trim() },
      {
        onSuccess: (newProject) => {
          setName('');
          setDescription('');
          onSuccess(newProject.id);
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-background-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-background-elevated/50">
          <h2 className="text-heading font-semibold text-text-primary">Nuevo Proyecto</h2>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-label text-text-secondary mb-1.5">Nombre del Proyecto</label>
            <input
              autoFocus
              type="text"
              placeholder="Ej: Expansión de Planta Solar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createMutation.isPending}
              className={`w-full bg-background-elevated border rounded-md px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent-subtle transition-all
                ${error ? 'border-health-red' : 'border-border focus:border-accent'}`}
            />
            {error && (
              <p className="mt-1.5 text-caption text-health-red flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-label text-text-secondary mb-1.5">Descripción (Opcional)</label>
            <textarea
              rows={3}
              placeholder="Breve descripción del alcance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createMutation.isPending}
              className="w-full bg-background-elevated border border-border rounded-md px-3 py-2 text-body focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle transition-all resize-none"
            />
          </div>

          {createMutation.isError && (
            <div className="p-3 bg-health-red/10 border border-health-red/20 rounded-md text-caption text-health-red">
              Error: {(createMutation.error as any)?.message || 'No se pudo crear el proyecto.'}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-background-elevated rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                'Crear Proyecto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
