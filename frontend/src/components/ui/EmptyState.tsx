import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

/**
 * Componente para mostrar cuando no hay datos o selección.
 * Diseñado con la estética "Elevada" (sombras suaves y tipografía limpia).
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-background-base rounded-xl border border-dashed border-border-subtle">
      <div className="w-16 h-16 bg-background-elevated rounded-full flex items-center justify-center text-text-disabled mb-6">
        <Icon size={32} />
      </div>
      <h3 className="text-heading font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-body text-text-secondary max-w-sm mb-8">
        {description}
      </p>
      {action && (
        <div className="flex items-center justify-center">
          {action}
        </div>
      )}
    </div>
  );
};
